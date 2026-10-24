# Executive incident brief — design review

Status: the design was accepted with a requirement to remove publisher/company branding.
That correction is complete. The separate concise prompt, assistant instructions and
unfilled production scaffold are available in this folder; see [README.md](./README.md).

Open [the interactive preview](./executive-design-preview.html) locally. It contains its
own styles, scripts and graph data and makes no external resource requests. External
reference links require connectivity only when opened deliberately.

## Source ownership verified on 24 October 2026

[DataBreachCost.com](https://databreachcost.com/) describes itself as an independent
register, identifies Digital Signet as its builder, and explicitly disclaims affiliation
with IBM, Verizon and Ponemon. Its estimator applies its own model to published figures.
It must not be described as IBM-managed or its calculator as an IBM calculator.

Use [IBM's official report](https://www.ibm.com/reports/data-breach) for primary benchmark
claims. DataBreachCost.com can be an accurately attributed secondary reference, with its
underlying claims checked against primary material before use. No numbers or equations
from its estimator are copied into this preview.

## Design direction

- An unbranded contemporary executive publication, with pale neutral surfaces, indigo and
  teal accents, a navy decision panel, and a coordinated dark theme.
- Use “Incident Analysis - <actual incident name, CVE or other verified identifier> - Executive Briefing”
  as the browser, top-left and main report title. Display “Report Generated Date” at the top
  right, with a fixed generation date and timezone, distinct from the evidence as-of date.
  No invented publisher name,
  logo, marketing tagline, vendor branding, endorsement badge or affiliation claim.
  Necessary source attribution and factual incident subjects remain clearly identified.
- Eleven sections: overview; business impact; leadership decisions; causes and relationship
  map; timeline; financial exposure; response priorities; regulatory implications; lessons
  and oversight; terminology; evidence and sources.
- Short reading path with expandable evidence, cost assumptions, standards mapping and
  board questions. Sidebar on desktop, a controlled contents drawer and quick routes on mobile.
- All incident details, dates, owners and amounts are fictional. The visible demo labels
  must remain until real, researched incident content is substituted.

## Interaction and provenance boundaries

- The graph has six nodes and five relationships from embedded JSON. It uses an interactive
  local fallback. Native Archify rendering and schema validation have not been performed;
  the preview does not claim an Archify receipt or a validated native Archify schema.
- Full screen uses an accessible full-viewport dialog within the page. Toolbar, search,
  filters, inspector and exit stay available. Both button exit and Escape were exercised.
- Cost calculations use synthetic activity inputs and explicit low/base/high factors.
  These factors are illustrative assumptions, not statistical intervals or IBM findings.
  The grouping follows [IBM's four cost categories](https://www.ibm.com/think/topics/data-breach).
  Actual losses, scenario estimates and benchmark references remain separate.
- Regulatory examples demonstrate screening only. They do not establish applicability,
  noncompliance, a notification deadline or a penalty for any real organisation.
- Standards mapping is topic-level alignment using public ISO and NIST references, not
  a conformity assessment or certification.

## Checks completed on the preview

- JavaScript syntax and graph JSON parsed; all relationship endpoints resolve.
- No editor diagnostics; no broken internal anchors or captionless tables in the rendered page.
- Responsive checks at 320, 390, 768 and 1440 CSS pixels: page width equals viewport width.
- Inspected desktop light/dark captures. Responsive layout metrics were checked on mobile;
  the graph rearranges into two columns. Refreshed mobile PNG export produced cropped
  desktop views in the embedded browser, so those images are excluded from version control.
  Use the interactive HTML to review the mobile layout; no mobile screenshots are published.
- Exercised theme switching; graph search, type filtering, keyboard selection, fit, reset,
  full-viewport expansion and both exit methods; timeline selection and event-register view;
  glossary search; mobile menu dismissal and breakpoint cleanup.
- Verified base/low/high outputs of USD 620,000 / 403,000 / 992,000 from the synthetic inputs.
  A missing input produces “Not calculable”; restoring it recalculates the total.
- PNG generation produced a valid PNG signature at 2600 × 1071 pixels in the desktop layout.
  The browser handled the download; automated download-receipt capture was unavailable.
- Print-state checks reveal the chronology, all relationship rows and expanded details,
  then restore the prior filter state. Full A4/Letter pagination has not been audited.
- Browser resource checks observed no external HTTP resource loads.
- Git comparison confirmed no tracked files changed.
- After the branding correction, the derived unfilled scaffold was checked at
  320/390/768/1440px without page overflow, including long placeholders. Its empty graph,
  confidence filtering/reset, full-viewport expansion/exit, chronology toggle, theme and
  print-state recovery were exercised. Its cost panel reports no sourced estimate; no
  currency, incident amount, low/high multiplier or fictional event is prepopulated.
- The local package validator passed for neutral identity, section order, inline script/JSON
  syntax, graph endpoints, absence of fictional data in the scaffold and instruction length.

Formal WCAG conformance, screen-reader testing, a full browser/device matrix, native
Archify validation and production-report completeness are outside this design review.

## Review images

- [Desktop, light](./preview-light.png)
- [Desktop, dark](./preview-dark.png)
- [Desktop relationship map](./preview-desktop-map.png)

Mobile image refresh was not completed reliably. The two failed local PNG captures are
ignored and are not part of the published package.

The concise prompt package is contained only in this folder. The original detailed prompt
and all other existing tracked repository files remain unchanged. This package's maintenance
helpers regenerate/check only the new edition and must not overwrite a populated report.
