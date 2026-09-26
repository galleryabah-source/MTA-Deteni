import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const url=process.env.DATABASE_URL;
if(!url) throw new Error("DATABASE_URL is required");
if(/supabase\\.(co|com)/i.test(url)) throw new Error("P9.6 local harness refuses Supabase URLs; use local PostgreSQL only.");
if(process.env.P9_6_ALLOW_WRITE==="true") throw new Error("P9.6 introspection is read-only; write mode is forbidden.");

const sql=path.resolve("scripts/p9.6-introspect-postgres.sql");
const out=path.resolve("artifacts/p9.6/local-postgres-introspection.json");
await fs.mkdir(path.dirname(out),{recursive:true});

const child=spawn("psql",["--no-psqlrc","--dbname",url,"--tuples-only","--no-align","--file",sql],{env:{...process.env,PGOPTIONS:"-c default_transaction_read_only=on"}});
let stdout="",stderr="";
child.stdout.on("data",d=>stdout+=d);
child.stderr.on("data",d=>stderr+=d);
const code=await new Promise(resolve=>child.on("close",resolve));
if(code!==0) throw new Error(`psql failed (${code}): ${stderr}`);
const parsed=JSON.parse(stdout.trim());
await fs.writeFile(out,JSON.stringify(parsed,null,2)+"\n");
console.log(out);
