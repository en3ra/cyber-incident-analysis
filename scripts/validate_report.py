#!/usr/bin/env python3
"""
Validate an incident analysis report before delivery.

Usage:
    python validate_report.py report.html
    python validate_report.py report.md
    python validate_report.py report.html --strict   # warnings become failures

Checks (HTML):
  - HTML tag nesting and unclosed elements
  - JavaScript syntax, if node is available
  - Navigation hrefs resolve to real section ids, and vice versa
  - Browser storage usage (breaks in some embedded viewers)
  - Network dependencies: web fonts, CDN links, fetch/XHR at runtime
  - AI provenance notice present, and repeated
  - Unsafe DOM sinks with incident-derived content
  - Report profile declared
  - Print stylesheet present
  - Tables wrapped for mobile horizontal scroll
  - Viewport meta present
  - Duplicate element ids
    - Original report order plus compact cover overview and management routes
    - Core WCAG landmarks, skip links, table captions, motion and target sizing

Checks (both):
  - Evidence hygiene: large unattributed numbers, hedge-free absolutes,
    banned filler phrasing, missing confidence vocabulary

Exit code 0 = pass (warnings allowed), 1 = failures found.
"""

import sys
import os
import re
import json
import shutil
import subprocess
import tempfile
from html.parser import HTMLParser

VOID = {
    "meta", "link", "br", "hr", "img", "input", "path", "rect", "line",
    "circle", "ellipse", "polygon", "polyline", "use", "source", "col",
    "marker", "stop", "area", "base", "embed", "track", "wbr",
}
# SVG text elements are frequently self-closed or nested oddly; skip strictness
SKIP = {"text", "tspan", "textpath"}

FAILS, WARNS, NOTES = [], [], []


def fail(msg):
    FAILS.append(msg)


def warn(msg):
    WARNS.append(msg)


def note(msg):
    NOTES.append(msg)


class Nesting(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        if tag in VOID or tag in SKIP:
            return
        self.stack.append((tag, self.getpos()[0]))

    def handle_endtag(self, tag):
        if tag in VOID or tag in SKIP:
            return
        names = [t for t, _ in self.stack]
        if self.stack and names[-1] == tag:
            self.stack.pop()
        elif tag in names:
            i = len(names) - 1 - names[::-1].index(tag)
            for t, ln in self.stack[i + 1:]:
                self.errors.append(f"<{t}> opened at line {ln} never closed")
            del self.stack[i:]
        else:
            self.errors.append(f"stray </{tag}> at line {self.getpos()[0]}")


def check_html(src):
    # Instruction comments in a template must not trip the code checks.
    code = re.sub(r"<!--.*?-->", " ", src, flags=re.S)

    # --- nesting ---
    p = Nesting()
    try:
        p.feed(src)
    except Exception as e:
        fail(f"HTML could not be parsed: {e}")
        return
    for e in p.errors[:15]:
        fail(f"Nesting: {e}")
    for t, ln in p.stack[:15]:
        fail(f"Nesting: <{t}> opened at line {ln} never closed")
    if not p.errors and not p.stack:
        note("HTML nesting is balanced")

    # --- javascript ---
    # Only lint actual JS blocks. A script tag with a non-JS type — the embedded
    # Archify JSON IR (type="application/json") above all — is data, not code.
    NON_JS_TYPE = re.compile(
        r'type\s*=\s*["\']?(?!(?:text/javascript|application/javascript|module)\b)'
        r'[\w./+-]+', re.I)
    scripts = [body for tag, body in re.findall(r"<script([^>]*)>(.*?)</script>", src, re.S)
               if body.strip() and not NON_JS_TYPE.search(tag)]
    if scripts and shutil.which("node"):
        for i, js in enumerate(scripts):
            with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False,
                                             encoding="utf-8") as fh:
                fh.write(js)
                path = fh.name
            r = subprocess.run(["node", "--check", path],
                               capture_output=True, text=True)
            os.unlink(path)
            if r.returncode != 0:
                first = (r.stderr.strip().splitlines() or ["unknown error"])[0]
                fail(f"JavaScript block {i + 1} has a syntax error: {first}")
        if not any("JavaScript block" in f for f in FAILS):
            note(f"JavaScript syntax valid ({len(scripts)} block(s))")
    elif scripts:
        warn("node not available — JavaScript syntax not checked")

    # --- nav integrity ---
    ids = re.findall(r'<section[^>]*\bid="([^"]+)"', src)
    all_target_ids = set(re.findall(r'\bid="([^"]+)"', src))
    # skip links and dock links may target landmarks, not sections
    hrefs = [h for h in re.findall(r'<a[^>]*\bhref="#([^"]+)"', src)
             if h not in ("main", "top")]
    dangling = [h for h in hrefs if h not in ids and h not in all_target_ids]
    orphan = [i for i in ids if i not in hrefs]
    if dangling:
        fail(f"Nav links point at ids with no section: {sorted(set(dangling))}")
    if orphan:
        warn(f"Sections not reachable from nav: {sorted(set(orphan))}")
    if ids and not dangling and not orphan:
        note(f"Navigation matches all {len(ids)} sections")

    # --- compact overview inside the original report order ---
    if "overview" not in all_target_ids or "overview-shortcuts" not in all_target_ids:
        fail("Cover must provide #overview and #overview-shortcuts")
    elif re.search(r'<section[^>]*\bid="overview"', code, re.I):
        fail("Overview must remain inside the cover, not become a standalone report section")
    else:
        order_ids = ["overview", "interactive-attack", "interactive-graph",
                     "interactive-timeline", "part-0"]
        positions = [code.find(f'id="{item}"') for item in order_ids]
        if -1 in positions or positions != sorted(positions):
            fail("Original order must remain cover, pathway, graph, chronology, then Part 0")
        else:
            note("Compact overview retains the original report order")
    route_targets = ["control", "interactive-timeline", "part-2", "part-3",
                     "part-4", "part-5", "part-6", "part-7"]
    missing_routes = [target for target in route_targets
                      if f'href="#{target}"' not in code]
    if missing_routes:
        fail(f"Management quick route(s) missing: {missing_routes}")
    else:
        note("Incident-management and root-cause quick routes present")

    # --- all eight Parts rendered ---
    # The shell is a binding contract: every Part divider renders even when a Part
    # holds no applicable section (references/visual-system.md, "Fixed page order").
    # Match on a delimited divider, not a bare substring — "Part I" is a substring
    # of "Part II"/"Part III"/"Part IV", and "Part V" of "Part VI"/"Part VII".
    part_order = ["0", "I", "II", "III", "IV", "V", "VI", "VII"]
    rendered = set(re.findall(r'\bPart\s+(0|I|II|III|IV|V|VI|VII)\b(?![IVX0])', code))
    missing_parts = [p for p in part_order if p not in rendered]
    if missing_parts:
        fail(f"Part divider(s) not found: {['Part ' + p for p in missing_parts]} — all "
             "eight Parts must render, even ones with no applicable section")
    else:
        note("All eight Part dividers present")

    # --- all 25 canonical sections rendered in order ---
    section_ids = [f"s{number:02d}" for number in range(1, 26)]
    missing_sections = [section_id for section_id in section_ids
                        if section_id not in all_target_ids]
    if missing_sections:
        fail(f"Canonical section(s) not found: {missing_sections} — Sections 01-25 must "
             "all render; use a concise evidence-boundary statement when depth is unsupported")
    else:
        section_positions = [code.find(f'id="{section_id}"') for section_id in section_ids]
        if section_positions != sorted(section_positions):
            fail("Canonical Sections 01-25 must render in numerical order")
        else:
            note("All 25 canonical sections render in order")

    # --- duplicate ids ---
    all_ids = re.findall(r'\bid="([^"]+)"', code)
    dupes = {i for i in all_ids if all_ids.count(i) > 1}
    if dupes:
        fail(f"Duplicate element ids: {sorted(dupes)}")

    # --- browser storage ---
    for api in ("localStorage", "sessionStorage", "indexedDB"):
        if api in code:
            fail(f"{api} is used — unsupported in some viewers; hold state in memory")

    # --- mobile ---
    if 'name="viewport"' not in src:
        fail("Missing viewport meta tag — will not render correctly on mobile")
    tables = len(re.findall(r"<table", src))
    wrapped = len(re.findall(r'class="(?:tblwrap|tw)"', src))
    if tables > wrapped:
        warn(f"{tables - wrapped} table(s) not wrapped in .tw/.tblwrap — "
             "these will overflow on mobile")
    elif tables:
        note(f"All {tables} tables wrapped for mobile scrolling")

    # --- core accessibility contract ---
    for landmark in ("header", "main", "nav", "footer"):
        if not re.search(fr"<{landmark}\b", code, re.I):
            fail(f"Missing semantic <{landmark}> landmark")
    skip_targets = re.findall(r'<a[^>]*class="[^"]*skip[^"]*"[^>]*href="#([^"]+)"', code, re.I)
    if "overview" not in skip_targets or "part-0" not in skip_targets:
        fail("Provide skip links to #overview and #part-0")
    else:
        note("Overview and full-report skip links present")
    captions = len(re.findall(r"<caption\b", code, re.I))
    if tables and captions < tables:
        fail(f"{tables - captions} table(s) lack a visible <caption>")
    elif tables:
        note(f"All {tables} tables have captions")
    if "prefers-reduced-motion" not in code:
        fail("Missing prefers-reduced-motion support")
    if "forced-colors" not in code:
        warn("Missing forced-colors support for Windows high-contrast mode")
    if not re.search(r"min-(?:height|width)\s*:\s*44px", code):
        fail("No 44px minimum pointer target rule found")


    # --- network dependencies: must be fully offline ---
    ext = re.findall(r'<link[^>]+href="(https?://[^"]+)"', code)
    ext += re.findall(r'<script[^>]+src="(https?://[^"]+)"', code)
    ext += re.findall(r"@import\s+url\(['\"]?(https?://[^'\")]+)", code)
    if ext:
        fail(f"External resource(s) loaded — artifact must work offline: {sorted(set(ext))[:3]}")
    else:
        note("No external resource loads (offline-safe)")
    for api in ("fetch(", "XMLHttpRequest", "navigator.sendBeacon", "EventSource("):
        if api in code:
            warn(f"{api} present — the artifact must make no network request after opening")

    # --- web fonts ---
    if re.search(r"fonts\.googleapis|fonts\.gstatic|@font-face", code):
        fail("Web font detected — use the local grotesk stack; no network font dependency")

    # --- AI provenance notice ---
    plain_ai = re.sub(r"<[^>]+>", " ", code)
    hits = len(re.findall(r"AI-generated analytical report", plain_ai, re.I))
    if hits == 0:
        fail("AI provenance notice missing — required at top and repeated in footer")
    elif hits == 1:
        warn("AI provenance notice appears once — it must also be repeated in the footer")
    else:
        note(f"AI provenance notice present and repeated ({hits}x)")

    # --- report profile declared ---
    if not re.search(r"report profile|public-source incident analysis|forensic report"
                     r"|active incident case record|post-incident review", code, re.I):
        warn("Report profile not declared — state it prominently so public-source research "
             "is not mistaken for a forensic report or notification")

    # --- unsafe DOM sinks ---
    for sink, msg in [(r"\bdocument\.write\s*\(", "document.write"),
                      (r"\beval\s*\(", "eval"),
                      (r"new\s+Function\s*\(", "new Function")]:
        if re.search(sink, code):
            fail(f"Unsafe sink {msg}() present — forbidden with incident-derived content")
    inner = len(re.findall(r"\.innerHTML\s*=", code))
    if inner:
        warn(f"{inner} innerHTML assignment(s) — use textContent/DOM creation for "
             "incident-derived strings")
    if re.search(r'<[a-z]+[^>]+\son(?:click|load|error|mouseover)\s*=', code, re.I):
        warn("Inline event-handler attribute(s) present — attach listeners in script instead")

    # --- print stylesheet ---
    if "@media print" not in code:
        warn("No print stylesheet — print must retain the AI notice, analysis and sources")
    else:
        note("Print stylesheet present")

    # --- unreplaced placeholders ---
    # Strip code samples first: {{ }} is legitimate syntax in Jinja2, Vue, Handlebars.
    nocode = re.sub(r"<(code|pre|kbd)[^>]*>.*?</\1>", " ", code, flags=re.S)
    ph = [p for p in re.findall(r"\{\{[^}]{1,60}\}\}", nocode)
          # inner content only: real placeholders are plain words, template
          # expressions contain calls, dunders, filters or attribute chains
          if not re.search(r"\(|\)|\||__|\.\w+\.", p[2:-2])]
    if ph:
        fail(f"{len(ph)} unreplaced placeholder(s), e.g. {ph[:3]}")


def check_prose(text, is_html):
    """Evidence-hygiene checks that apply to both formats."""
    body = re.sub(r"<script.*?</script>", " ", text, flags=re.S) if is_html else text
    body = re.sub(r"<style.*?</style>", " ", body, flags=re.S)
    plain = re.sub(r"<[^>]+>", " ", body) if is_html else body

    # confidence vocabulary
    conf = ["established", "contested", "unverified", "unknown",
            "high confidence", "disputed"]
    found = [c for c in conf if c in plain.lower()]
    if len(found) < 2:
        warn("Little or no confidence vocabulary found (established / contested / "
             "unverified / unknown). Every significant claim should carry a label.")
    else:
        note(f"Confidence vocabulary present: {', '.join(found[:4])}")

    # source tiering
    if not re.search(r"\bT1\b|tier 1|primary source", plain, re.I):
        warn("No source tiering language found — sources should be tiered")

    # banned filler
    banned = {
        r"\b(?:highly |extremely |very )?sophisticated (?:attack|adversary|actor|threat|campaign|malware|operation|intrusion|technique)":
            "'sophisticated' explains nothing; describe the mechanism",
        r"\bnation-state[- ]grade\b":
            "'nation-state-grade' is not a mechanism",
        r"\bfollow(?:ing)? (?:industry )?best practices?\b":
            "'follow best practices' is not a recommendation",
        r"\b(?:highly |extremely )?advanced (?:threat|attack|actor|adversary)\b":
            "vague severity language; name the technique",
        r"\bunprecedented\b":
            "'unprecedented' is almost always false; check the precedent section",
        r"\bmilitary[- ]grade\b":
            "'military-grade' is marketing, not a property",
    }
    for pat, msg in banned.items():
        if re.search(pat, plain, re.I):
            warn(f"Banned phrasing: {msg}")

    # large numbers without attribution nearby
    risky = []
    for m in re.finditer(r"\b\d{1,3}(?:,\d{3})+\b|\b\d+(?:\.\d+)?\s?(?:million|billion)\b",
                         plain):
        window = plain[max(0, m.start() - 420): m.end() + 420].lower()
        cues = ("accord", "report", "estimat", "source", "per ", "vendor",
                "confirm", "disclos", "telemetr", "measur", "dataset",
                "reconstruct", "advisory", "stated", "published", "analysis",
                "observ", "figure", "record", "research",
                "tracked", "documented", "cited")
        if not any(c in window for c in cues):
            risky.append(m.group(0))
    if risky:
        uniq = sorted(set(risky))[:6]
        warn(f"{len(set(risky))} large number(s) with no attribution cue nearby: "
             f"{uniq} — label each as measured or estimated")

    # capability vs observation separation
    if is_html and len(plain) > 8000:
        if not re.search(r"observ|confirmed|capab", plain, re.I):
            warn("No capability-vs-observation language found — keep what malware "
                 "*could* take separate from what was *seen* taken")

    # UTC
    if re.search(r"\b\d{1,2}:\d{2}\b", plain) and "utc" not in plain.lower():
        warn("Times present but no UTC marker — state the timezone explicitly")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    strict = "--strict" in sys.argv
    if not args:
        print(__doc__)
        return 2
    path = args[0]
    if not os.path.exists(path):
        print(f"No such file: {path}")
        return 2

    src = open(path, encoding="utf-8", errors="replace").read()
    is_html = path.lower().endswith((".html", ".htm"))

    if is_html:
        check_html(src)
    check_prose(src, is_html)

    print(f"\n  Validating: {path}  ({len(src) / 1024:.1f} KB)\n")
    for m in NOTES:
        print(f"  [ok]   {m}")
    for m in WARNS:
        print(f"  [warn] {m}")
    for m in FAILS:
        print(f"  [FAIL] {m}")

    print(f"\n  {len(FAILS)} failure(s), {len(WARNS)} warning(s)\n")
    if FAILS:
        print("  Fix the failures before delivering.\n")
        return 1
    if WARNS and strict:
        print("  Strict mode: warnings treated as failures.\n")
        return 1
    if WARNS:
        print("  Warnings are advisory. Review each and confirm it is intentional.\n")
    else:
        print("  Clean.\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
