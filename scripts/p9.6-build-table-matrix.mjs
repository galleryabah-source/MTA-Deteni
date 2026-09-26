import fs from "node:fs/promises";
import path from "node:path";

const root=process.cwd();
const actualPath=path.join(root,"artifacts/p9.6/local-postgres-introspection.json");
const migrations=path.join(root,"supabase/migrations");
const actual=JSON.parse(await fs.readFile(actualPath,"utf8"));
const names=new Set();
for(const file of await fs.readdir(migrations)){
  if(!file.endsWith(".sql")) continue;
  const text=await fs.readFile(path.join(migrations,file),"utf8");
  for(const m of text.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-zA-Z0-9_]+)/gi)) names.add("public."+m[1].toLowerCase());
}
const actualNames=new Set((actual.tables||[]).filter(x=>x.schema_name==="public"&&x.relkind==="r").map(x=>"public."+x.table_name.toLowerCase()));
const all=new Set([...names,...actualNames]);
const rows=[...all].sort().map(name=>{
 const e=names.has(name), a=actualNames.has(name);
 return {object_type:"table",object:name,expected_from_repo:e,actual:a,status:e&&a?"MATCH":e?"MISSING":"EXTRA"};
});
const out=path.join(root,"artifacts/p9.6/schema-matrix-table-level.json");
await fs.mkdir(path.dirname(out),{recursive:true});
await fs.writeFile(out,JSON.stringify({generatedAt:new Date().toISOString(),basis:"repository CREATE TABLE evidence vs local PostgreSQL introspection",rows},null,2)+"\n");
console.log(out);
