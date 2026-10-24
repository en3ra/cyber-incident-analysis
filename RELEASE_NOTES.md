# Release Notes

## Unreleased

### Concise executive edition — 2026-10-25

- Added the separate [concise-incident-analysis/ package](concise-incident-analysis/) with
  its own reusable prompt, assistant instructions, unfilled HTML scaffold, fictional design
  preview, README and maintenance/validation helpers. Users should navigate to that folder
  and follow its README to use the concise prompt and companion files together.
- Introduced eleven executive sections covering incident facts, business impact, leadership
  decisions, cause/relationships, timeline, financial exposure, response priorities,
  regulatory implications, lessons/oversight, terminology and evidence/sources.
- Added an unbranded light/dark design, an interactive sourced relationship-map fallback,
  timeline, local financial scenarios, glossary, mobile navigation and print equivalents.
  Native Archify rendering/schema validation is explicitly distinguished from fallback use.
- Standardised the report title as
  `Incident Analysis - <actual incident name or CVE> - Executive Briefing`, with a fixed,
  timezone-labelled **Report Generated Date** at the top right, separate from evidence
  freshness and incident timestamps.
- Preserved evidence grading and uncertainty; separated actual costs, planning assumptions
  and published benchmarks; added incident-specific regulatory screening and standards
  alignment without claiming certification or legal compliance. IBM primary references and
  the independent DataBreachCost.com site are accurately distinguished.
- Added edition-selection guidance and direct folder navigation to the main README, and
  scoped its 25-section requirement to the detailed edition. The detailed analysis prompt,
  instructions, scaffold, Claude package and example reports remain unchanged.

## v1.2.0 - 2026-09-10

- Added a factual short `Incident in brief` within the original cover, with direct routes
  across situation/scope, chronology, root cause, impact, accountability, controls/recovery,
  governance/ownership, and evidence/lessons.
- Promoted one shared report scaffold for ChatGPT and Claude, tightened typography and
  responsive information density, and made the four incident facts fully visible at narrow
  mobile widths.
- Expanded WCAG 2.2 AA behavior for landmarks, skip links, keyboard focus, 44px targets,
  table captions, zoom/reflow, reduced motion, and high-contrast modes.
- Restored the fixed Sections 01–25 report contract while keeping section depth adaptive to
  evidence and requiring explicit `unknown externally` or `not applicable` boundaries.
- Tightened the prompt so no-tool ChatGPT/Claude output must include embedded Archify
  relationship IR plus a visible labelled fallback graph when an Archify renderer is unavailable.
- Restored the previous movable/fullscreen/export-capable graph feature floor as mandatory
  for the fallback renderer when Archify cannot render directly.
- Refreshed the packaged Claude skill so its embedded prompt and HTML scaffold use the same
  Archify relationship IR marker and interactive fallback contract.

## v1.1.0 - 2026-09-08

- Updated the incident-analysis prompt so sourced relationship graphs are authored as
  Archify typed JSON IR and rendered with Archify when available.
- Added a validated Archify repository architecture diagram in both source JSON and
  self-contained HTML form under `docs/`.
- Added ChatGPT Custom GPT setup instructions so ChatGPT users can configure the prompt once
  and start future analyses with only an incident identifier.
- Added a packaged Claude skill at `claude_skill/incident-analysis.skill` for Claude users
  who want reusable incident analysis without attaching the full prompt each chat.
- Preserved the no-install default for ordinary ChatGPT and Claude use: users do not need to
  install Archify; unavailable Archify rendering falls back to embedded Archify JSON IR plus
  a labelled local renderer.
