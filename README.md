# Cyber Security Incident Analysis

A reusable prompt and reference implementation for producing rigorous, evidence-graded
cybersecurity incident reports as self-contained interactive HTML files.

## Use The Prompt

Attach [prompt/cybersecurity-incident-analysis-prompt.md](prompt/cybersecurity-incident-analysis-prompt.md)
to an AI assistant with research or web-search access, then provide one incident name,
CVE, advisory URL, or short description. The prompt governs scoping, evidence quality,
analysis, report structure, visualization, accessibility, offline behavior, printing, and
third-party notices.

## Repository Structure

```text
prompt/       Latest reusable incident-analysis prompt
src/graph/    React Flow reference graph source and styles
scripts/      Deterministic bundle embedding and validation
examples/     Validated self-contained XZ incident report
.github/      CI validation workflow
```

Only [examples/xz-utils-cve-2024-3094.html](examples/xz-utils-cve-2024-3094.html) is needed
to view or share the reference report. It contains its graph runtime, styles, incident data,
PNG export support, and open-source notices inline.

## Development

Requires Node.js 20 or newer.

```sh
npm ci
npm run build
npm run validate
```

`npm run build` bundles the graph source and embeds it between the preserved bundle markers
in the reference HTML. Generated `.graph-build/` files and `node_modules/` are intentionally
excluded from version control.

## Validation

The validator checks:

- retired variant wording is absent from the prompt;
- all 25 report sections and Part 0-VII are present;
- both AI-generated/not-official notices remain;
- the HTML has no external runtime resources;
- bundle markers remain reproducible; and
- every package actually included by esbuild has matching versioned notices in both
  [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt) and the distributable HTML.

## Licensing

Bundled dependencies use permissive MIT, ISC, or BSD-3-Clause licenses. Their notices are
preserved in [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt) and inside the reference HTML.

No license is currently granted for this repository's original source or report content.
The repository is private pending owner validation. Choose and add a project license only
after ownership, content, trademark, and publication review.