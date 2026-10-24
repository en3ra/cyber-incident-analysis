import { readFile } from "node:fs/promises";
import path from "node:path";

const root = new URL("../", import.meta.url);
const read = relative => readFile(new URL(relative, root), "utf8");
const [prompt, report, scaffold, notices, metadata] = await Promise.all([
  read("prompt/cybersecurity-incident-analysis-prompt.md"),
  read("examples/xz-utils-cve-2024-3094.html"),
  read("report/report-scaffold.html"),
  read("THIRD_PARTY_NOTICES.txt"),
  read(".graph-build/meta.json").then(JSON.parse),
]);

const failures = [];
const requireCheck = (condition, message) => { if (!condition) failures.push(message); };
const count = (text, value) => text.split(value).length - 1;

requireCheck(!/industrial[ -]grid/i.test(prompt), "Prompt still contains retired visual-variant wording");
requireCheck(count(report, 'class="part-heading"') === 8, "Reference report must contain Part 0-VII");
requireCheck(count(report, "AI-generated analytical report") === 2, "Reference report must contain two AI notices");
requireCheck(!/(?:src|href)="https?:\/\//i.test(report), "Reference report contains an external runtime resource");
requireCheck(count(report, "/* BEGIN REACT FLOW BUNDLE */") === 2, "Reference report bundle markers are incomplete");
requireCheck(report.includes("Open-source software notices"), "Reference report lacks bundled software notices");
const fixedOrder = ["overview", "interactive-attack", "interactive-graph", "interactive-timeline", "part-0"]
  .map(id => scaffold.indexOf(`id="${id}"`));
requireCheck(!fixedOrder.includes(-1) && fixedOrder.every((position, index) => !index || position > fixedOrder[index - 1]),
  "Shared scaffold must retain cover, pathway, graph, chronology, and Part 0 order");
requireCheck(!/<section[^>]*id="overview"/i.test(scaffold),
  "Shared scaffold overview must remain in the cover, not a standalone section");
requireCheck(scaffold.includes('id="overview-shortcuts"'), "Shared scaffold lacks management quick routes");
for (const target of ["control", "interactive-timeline", "part-2", "part-3", "part-4", "part-5", "part-6", "part-7"]) {
  requireCheck(scaffold.includes(`href="#${target}"`), `Shared scaffold quick routes lack #${target}`);
}
const sectionPositions = Array.from({ length: 25 }, (_, index) => scaffold.indexOf(`id="s${String(index + 1).padStart(2, "0")}"`));
requireCheck(!sectionPositions.includes(-1) && sectionPositions.every((position, index) => !index || position > sectionPositions[index - 1]),
  "Shared scaffold must render canonical Sections 01-25 in order");
requireCheck(scaffold.includes('href="#overview">Skip to incident overview</a>'),
  "Shared scaffold lacks the incident-overview skip link");
requireCheck(scaffold.includes('href="#part-0">Skip to full report</a>'),
  "Shared scaffold lacks the full-report skip link");
requireCheck(scaffold.includes("prefers-reduced-motion") && scaffold.includes("forced-colors"),
  "Shared scaffold lacks reduced-motion or forced-colors support");
requireCheck(count(scaffold, "<caption>") === count(scaffold, "<table>"),
  "Every static scaffold table must have a caption");
requireCheck(!scaffold.includes("letter-spacing:-"),
  "Shared scaffold must not use negative letter spacing");

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