# ChatGPT Custom GPT Setup

ChatGPT does not use the same `Skill` package format as Claude. The closest reusable setup
is a **Custom GPT**: configure it once, upload the analysis prompt once as Knowledge, and
then start new incident analyses without attaching the prompt every time.

## Create The GPT

1. Open ChatGPT and create a new GPT.
2. Name it `Evidence-Graded Incident Analyst`.
3. Paste the contents of [instructions.md](instructions.md) into the GPT **Instructions** field.
4. Upload [../prompt/cybersecurity-incident-analysis-prompt.md](../prompt/cybersecurity-incident-analysis-prompt.md) as a Knowledge file.
5. Enable web browsing/search if your ChatGPT plan exposes it.
6. Leave Actions disabled unless you are adding your own reviewed integration.
7. Save the GPT for yourself or your workspace.

## Use It

Start a new chat with the GPT and send only an incident identifier, for example:

```text
xz-utils CVE-2024-3094
```

or:

```text
MOVEit Transfer exploitation 2023
```

The GPT should scope the incident internally, apply the template defaults, research the
evidence, and produce the report. It should not ask you to upload the prompt again.

## Archify Behavior

Users do **not** need to install Archify to use the GPT. The prompt instructs ChatGPT to
author the sourced relationship graph as Archify typed JSON IR. If an Archify renderer is
available in the environment, the GPT may use it. If not, it must embed the Archify JSON IR
and render the clearly labelled fallback graph from that same source.

## Updating The GPT

When [../prompt/cybersecurity-incident-analysis-prompt.md](../prompt/cybersecurity-incident-analysis-prompt.md)
changes, replace the Knowledge file in the GPT with the current version. If
[instructions.md](instructions.md) changes, replace the GPT Instructions field as well.
