import { readFile, writeFile } from "node:fs/promises";

const reportPath = new URL("../examples/xz-utils-cve-2024-3094.html", import.meta.url);
const cssPath = new URL("../.graph-build/incident-graph.css", import.meta.url);
const jsPath = new URL("../.graph-build/incident-graph.js", import.meta.url);

const replaceBundle = (html, startMarker, endMarker, bundle) => {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error(`Missing bundle marker: ${startMarker}`);
  const contentStart = start + startMarker.length;
  return `${html.slice(0, contentStart)}\n${bundle}\n${html.slice(end)}`;
};

let html = await readFile(reportPath, "utf8");
const css = (await readFile(cssPath, "utf8")).replaceAll("</style", "<\\/style");
const js = (await readFile(jsPath, "utf8")).replaceAll("</script", "<\\/script");

html = replaceBundle(
  html,
  "/* BEGIN REACT FLOW BUNDLE */",
  "/* END REACT FLOW BUNDLE */",
  css,
);
const firstEnd = html.indexOf("/* END REACT FLOW BUNDLE */");
const secondStart = html.indexOf("/* BEGIN REACT FLOW BUNDLE */", firstEnd);
const secondEnd = html.indexOf("/* END REACT FLOW BUNDLE */", secondStart);
if (secondStart < 0 || secondEnd < 0) throw new Error("Missing JavaScript bundle markers");
html = `${html.slice(0, secondStart + "/* BEGIN REACT FLOW BUNDLE */".length)}\n${js}\n${html.slice(secondEnd)}`;

await writeFile(reportPath, html);