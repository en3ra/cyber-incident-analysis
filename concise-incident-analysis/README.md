# Concise executive incident analysis

A separate executive edition of the incident-analysis workflow. Its report title follows
**Incident Analysis - <actual incident name, CVE or other verified identifier> - Executive Briefing**.
The top-right **Report Generated Date** records the fixed generation date and timezone,
separately from the evidence as-of date. The full title/date remain visible on mobile and
in print. There is no invented publisher/company name, logo, wordmark, slogan,
endorsement badge or affiliation. Necessary factual incident identification and source
attribution remain permitted. This is not a legal-clearance or certification claim.

The existing detailed prompt, Custom GPT instructions, original scaffold, skill archive
and example reports are not modified by this package.

## Files to use

| File | Purpose |
| --- | --- |
| [concise-incident-analysis.md](./concise-incident-analysis.md) | Standalone reusable executive-analysis prompt. |
| [instructions.md](./instructions.md) | Short reusable assistant instructions; use the fenced body. |
| [concise-report-scaffold.html](./concise-report-scaffold.html) | Unfilled neutral HTML shell with tested interaction patterns. Not an incident report. |
| [executive-design-preview.html](./executive-design-preview.html) | Worked design demonstration, with fictional incident data and financial inputs. Never use it as evidence. |
| [DESIGN-REVIEW.md](./DESIGN-REVIEW.md) | Source ownership, design rationale, review checks and limitations. |

## Use

1. Supply the concise prompt and HTML scaffold to the assistant. For a reusable setup,
   also use this folder's instruction body. Do not substitute the detailed edition's
   instruction file, which requires a different report structure.
2. Send one incident identifier, advisory URL or rough description. Web research is needed
   to verify incident facts, current developments, regulatory status and cost references.
3. The assistant scopes internally and returns a finished, standalone HTML report.
   No user-operated build is required for the default report.

The final report has eleven executive functions, a short core reading path, expanded
definitions, material-claim/source registers, a relationship map, timeline, relevant cost
charts, priorities, regulatory screening and standards alignment. Light/dark themes,
mobile navigation, keyboard controls, local export and print equivalents are included.

## Fill the scaffold safely

The scaffold deliberately starts with placeholders, no graph nodes, no milestone events,
blank monetary inputs and no benchmark. It renders as an **unfilled template** rather
than asserting a fictional incident. Replace every `[[...]]` token and all related labels,
notices, captions, registers and runtime data consistently. Remove the “unfilled template”
labels only when real source-backed content is complete; retain the AI provenance notice.

- Populate the embedded graph source and matching source/claim registers. Node IDs can be
  incident-specific; supply valid coordinates, types, states and source references. Update
  relevant type-filter options to match the actual graph. Native Archify is used only when
  already available; the local fallback must not imply native rendering or validation.
- Populate timeline buttons, `milestones` runtime data and the event register in the same
  order. Empty or unknown chronology must not become invented timestamps or durations.
- Populate currency and justified scenario factors in `cost-model` only when supported.
  Add input sources, horizon and exclusions before enabling the calculator. Blank is
  unknown, not zero. Base factor 1 represents the base calculation; low/high remain
  unavailable until justified cases are supplied. Remove the calculator if it cannot
  give a defensible estimate, leaving a concise cost-drivers explanation instead.
- Populate jurisdiction-specific obligations and verified dates. The template establishes
  no compliance finding, reporting deadline or organisational certification.
- Expand every abbreviation on first use and add the necessary definitions.

Source text must be contextually encoded; do not insert arbitrary HTML. Escape `<` as
`\u003c` in embedded JSON and inspect URLs. Do not introduce runtime resource loads,
analytics, browser storage, copied branding or remote calculators.

## Cost source boundary

[DataBreachCost.com](https://databreachcost.com/) is an independent site built by Digital
Signet. Its disclosure states that it is not affiliated with IBM or Ponemon (checked
24 October 2026; verify again when used). It is not IBM-managed and its estimator is a
separate model. Attribute it accurately as a secondary source and verify load-bearing
claims against original material.

Use [IBM's official Cost of a Data Breach material](https://www.ibm.com/reports/data-breach)
for primary benchmark claims; verify the actual edition, sample, cohort, currency,
definitions and limitations. Keep actual losses, transparent activity-based scenarios and
published benchmarks separate. The preview's amounts and low/high factors are invented
for design demonstration and do not occur in the unfilled scaffold.

## Design and validation

The design was accepted with the condition that it remain unbranded. The original
placeholder publication name and logo were removed from the preview, screenshots, template
and export filenames. This package does not claim trademark clearance or guaranteed legal
compliance; it avoids an invented publisher identity and preserves explicit source boundaries.

The preview was exercised at 320/390/768/1440 CSS pixels. Its graph, timeline, financial
controls, menu, themes, definitions and print-state recovery were checked. The derived
scaffold has a separate blank-state check; these checks do not validate future generated
incident reports. Test every final report after population and after its last edit.

The committed review images cover desktop light/dark themes and the relationship map.
Refreshed mobile PNG capture was unreliable in the embedded browser; those failed local
images are ignored rather than published. Review the responsive HTML itself for mobile.

Native Archify rendering/schema validation, a formal screen-reader/accessibility audit
and full A4/Letter pagination are not certified by this package. Document checks actually
performed and those unavailable; static validation does not establish WCAG conformity.

Optional maintainer checks, with an existing Node runtime:

```sh
node concise-incident-analysis/scripts/build-scaffold.mjs
node concise-incident-analysis/scripts/validate-package.mjs
```

Run from the repository root. The builder regenerates only this folder's unfilled scaffold
from the approved preview. Do not run it over a populated incident report. The scripts are
maintenance helpers, not a prerequisite for reading or generating the default report.
