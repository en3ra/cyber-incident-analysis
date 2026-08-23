# Contributing

Thank you for helping make incident analysis more rigorous and more useful to defenders.

## What to contribute

- Prompt improvements that reduce unsupported claims and make uncertainty explicit
- Incident examples grounded in public, primary evidence
- Improvements to the interactive report shell, accessibility, or offline behavior
- Organization-ready defensive recommendations and detection ideas
- Reproducible bug reports and validation improvements

## Standards for incident content

- Cite primary sources wherever possible, including advisories, incident disclosures, and
  technical research.
- Separate confirmed facts, credible assessments, and inference.
- Do not present speculation as fact.
- Avoid including secrets, personal data, victim data, or restricted material.
- Keep incident-specific sections adaptive; do not weaken the fixed Part 0-VII shell.

## Development

Requires Node.js 20 or newer:

```sh
npm ci
npm run build
npm run validate
```

Keep changes focused, explain behavior changes in the pull request, and include validation
results. Prompt-only changes should not modify generated example HTML unless the change
explicitly requires it.

## Pull requests

Describe the problem, the proposed change, and how you verified it. For report or visual
changes, include a screenshot or a link to the rendered example when practical.

AI-generated analysis is decision support, not a substitute for qualified incident response,
legal, privacy, or communications review.
