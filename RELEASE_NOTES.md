# Release Notes

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
