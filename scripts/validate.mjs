import { readFile } from "node:fs/promises";
import path from "node:path";

const root = new URL("../", import.meta.url);
const read = relative => readFile(new URL(relative, root), "utf8");
const [prompt, report, notices, metadata] = await Promise.all([
  read("prompt/cybersecurity-incident-analysis-prompt.md"),
  read("examples/xz-utils-cve-2024-3094.html"),
  read("THIRD_PARTY_NOTICES.txt"),
  read(".graph-build/meta.json").then(JSON.parse),
]);

const failures = [];
const requireCheck = (condition, message) => { if (!condition) failures.push(message); };
const count = (text, value) => text.split(value).length - 1;

requireCheck(!/industrial[ -]grid/i.test(prompt), "Prompt still contains retired visual-variant wording");
requireCheck(count(report, 'class="report-section"') === 25, "Reference report must contain 25 sections");
requireCheck(count(report, 'class="part-heading"') === 8, "Reference report must contain Part 0-VII");
requireCheck(count(report, "AI-generated analytical report") === 2, "Reference report must contain two AI notices");
requireCheck(!/(?:src|href)="https?:\/\//i.test(report), "Reference report contains an external runtime resource");
requireCheck(count(report, "/* BEGIN REACT FLOW BUNDLE */") === 2, "Reference report bundle markers are incomplete");
requireCheck(report.includes("Open-source software notices"), "Reference report lacks bundled software notices");

const bundledPackages = new Set();
for (const input of Object.keys(metadata.inputs)) {
  const marker = "node_modules/";
  const index = input.indexOf(marker);
  if (index < 0) continue;
  const parts = input.slice(index + marker.length).split("/");
  bundledPackages.add(parts[0].startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]);
}

for (const packageName of bundledPackages) {
  const packageJson = JSON.parse(await readFile(path.join(process.cwd(), "node_modules", packageName, "package.json"), "utf8"));
  const identity = `${packageName} ${packageJson.version}`;
  requireCheck(notices.includes(identity), `THIRD_PARTY_NOTICES.txt lacks ${identity}`);
  requireCheck(report.includes(identity), `Reference HTML lacks ${identity}`);
}

if (failures.length) {
  failures.forEach(failure => console.error(`FAIL: ${failure}`));
  process.exit(1);
}

console.log(`Validated prompt, report structure, offline bundle, and ${bundledPackages.size} bundled package notices.`);