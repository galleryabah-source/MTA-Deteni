import fs from "node:fs/promises";
import path from "node:path";

const root=process.cwd();
const actual=JSON.parse(await fs.readFile(path.join(root,"artifacts/p9.6/local-postgres-introspection.json"),"utf8"));
const migrationDir=path.join(root,"supabase/migrations");
const sql=(await Promise.all((await fs.readdir(migrationDir)).filter(f=>f.endsWith(".sql")).sort().map(f=>fs.readFile(path.join(migrationDir,f),"utf8")))).join("\n");

function unique(values){return [...new Set(values.map(v=>v.toLowerCase()))].sort()}
const expectedTables=unique([...sql.matchAll(/create\\s+table\\s+if\\s+not\\s+exists\\s+public\\.([a-z0-9_]+)/gi)].map(m=>"public."+m[1]));
const expectedIndexes=unique([...sql.matchAll(/create\\s+index\\s+if\\s+not\\s+exists\\s+([a-z0-9_]+)/gi)].map(m=>m[1]));
const expectedFunctions=unique([...sql.matchAll(/create\\s+(?:or\\s+replace\\s+)?function\\s+(?:public|private)\\.([a-z0-9_]+)/gi)].map(m=>m[1]));
const expectedTriggers=unique([...sql.matchAll(/create\\s+trigger\\s+([a-z0-9_]+)/gi)].map(m=>m[1]));
const expectedPolicies=unique([...sql.matchAll(/create\\s+policy\\s+([a-z0-9_]+)/gi)].map(m=>m[1]));

const actualTables=unique((actual.tables||[]).filter(x=>x.schema_name==="public"&&["r","p"].includes(x.relkind)).map(x=>"public."+x.table_name));
const actualIndexes=unique((actual.indexes||[]).filter(x=>x.schema_name==="public").map(x=>x.index_name));
const actualFunctions=unique((actual.functions||[]).filter(x=>["public","private"].includes(x.schema_name)).map(x=>x.function_name));
const actualTriggers=unique((actual.triggers||[]).map(x=>x.trigger_name));
const actualPolicies=unique((actual.policies||[]).map(x=>x.policyname));

function rows(expected,actual,type){
 const all=unique([...expected,...actual]);
 return all.map(object=>({object_type:type,object,expected:expected.includes(object),actual:actual.includes(object),status:expected.includes(object)&&actual.includes(object)?"MATCH":expected.includes(object)?"MISSING":"EXTRA"}));
}
const rows=[
 ...rows(expectedTables,actualTables,"table"),
 ...rows(expectedIndexes,actualIndexes,"index"),
 ...rows(expectedFunctions,actualFunctions,"function"),
 ...rows(expectedTriggers,actualTriggers,"trigger"),
 ...rows(expectedPolicies,actualPolicies,"policy")
];
const summary=Object.fromEntries([...new Set(rows.map(r=>r.object_type))].map(type=>{
 const x=rows.filter(r=>r.object_type===type); return [type,{total:x.length,match:x.filter(r=>r.status==="MATCH").length,missing:x.filter(r=>r.status==="MISSING").length,extra:x.filter(r=>r.status==="EXTRA").length}];
}));
const out=path.join(root,"artifacts/p9.6/schema-reconciliation-matrix.json");
await fs.mkdir(path.dirname(out),{recursive:true});
await fs.writeFile(out,JSON.stringify({generatedAt:new Date().toISOString(),basis:"repository migration evidence vs local PostgreSQL introspection",summary,rows},null,2)+"\n");
console.log(out);
