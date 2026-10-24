import fs from "node:fs/promises";
import vm from "node:vm";
const directory = new URL("../", import.meta.url);
const read = name => fs.readFile(new URL(name, directory), "utf8");
const [prompt, instructions, html, preview] = await Promise.all([
  read("concise-incident-analysis.md"), read("instructions.md"),
  read("concise-report-scaffold.html"), read("executive-design-preview.html")
]);
const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message);};
const ids=["overview","impact","decisions","relationships","timeline","financial","response","governance","lessons","terminology","evidence"];
for(const [name,content] of [["scaffold",html],["preview",preview]]){
  let last=-1;
  for(const id of ids){const position=content.indexOf(`id="${id}"`);check(position>last,`${name}: missing or out-of-order ${id}`);last=position;}
  check(!/Signal —|signal-illustrative|class="brand(?:-mark|-name)?"|>signal[.<]/i.test(content),`${name}: removed publisher identity remains`);
  check(content.includes('class="report-identity"'),`${name}: neutral report heading missing`);
  check(/<title>Incident Analysis - .+ - Executive Briefing<\/title>/.test(content),`${name}: incident-specific title contract missing`);
  check(/id="overview-title">Incident Analysis - .+ - Executive Briefing<\/h1>/.test(content),`${name}: main title contract missing`);
  check(content.includes("Report Generated Date")&&content.includes('id="report-generated-date"'),`${name}: top-right generation date missing`);
  check(!/(?:localStorage|sessionStorage|\beval\s*\(|\bnew Function\b|document\.write\s*\(|\bfetch\s*\()/i.test(content),`${name}: unsafe storage/evaluation/network API`);
  check(!/(?:src|srcset)\s*=\s*["']https?:/i.test(content),`${name}: external runtime asset`);
  check(!/@import\b|url\(\s*["']?https?:/i.test(content),`${name}: external CSS/font resource`);
  check(!/\son(?:click|load|error|input)\s*=/i.test(content),`${name}: inline event handler`);
  for(const [,attrs,source]of content.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
    try{if(attrs.includes("application/json"))JSON.parse(source);else new vm.Script(source);}
    catch(error){failures.push(`${name}: invalid script/JSON: ${error.message}`);}
  }
  const graphMatch=content.match(/id="archify-relationship-ir">\s*([\s\S]*?)<\/script>/);
  check(Boolean(graphMatch),`${name}: canonical graph source missing`);
  if(graphMatch){const graph=JSON.parse(graphMatch[1]),nodeIds=new Set(graph.nodes.map(n=>n.id));
    check(nodeIds.size===graph.nodes.length,`${name}: duplicate node ID`);
    check(graph.relationships.every(e=>nodeIds.has(e.from)&&nodeIds.has(e.to)),`${name}: graph endpoint missing`);
    if(name==="scaffold")check(graph.nodes.length===0&&graph.relationships.length===0,"Unfilled scaffold must not contain fictional graph facts");
  }
}
check(!/620,000|64000|320000|D1 ·|D2 ·|2026-09-08T/.test(html),"Fictional incident facts leaked into the scaffold");
check(html.includes('const milestones=[]'),"Blank chronology must contain no invented events");
check(html.includes('"currency":null')&&html.includes('"low":null')&&html.includes('"high":null'),"Calculator must begin without assumed currency or low/high cases");
check(html.includes('id="graph-confidence"'),"Production graph confidence filter missing");
check(html.includes("if(!n)return"),"Blank graph inspector guard missing");
check(prompt.includes("DataBreachCost.com")&&prompt.includes("not affiliated"),"Cost-source ownership boundary missing");
check(prompt.includes("Do not invent a company")&&instructions.includes("Do not create or display a company"),"Neutral identity requirements missing");
const body=instructions.match(/```text\n([\s\S]*?)\n```/);
check(Boolean(body),"Reusable instruction body missing");
if(body)check([...body[1]].length<=8000,"Reusable instruction body exceeds 8000 characters");
if(failures.length){for(const failure of failures)console.error(`FAIL: ${failure}`);process.exitCode=1;}
else console.log("Validated concise package: neutral identity, 11-section order, safe inline runtime, graph JSON, unfilled data boundaries, cost defaults and instruction length. Browser and accessibility checks are separate.");
