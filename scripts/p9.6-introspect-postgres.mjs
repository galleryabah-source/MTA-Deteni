import pg from "pg";
import fs from "node:fs/promises";
import path from "node:path";

const { Client } = pg;
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");
if (/supabase\\.(co|com)/i.test(url)) throw new Error("P9.6 local harness refuses Supabase URLs; use local PostgreSQL only.");
if (process.env.P9_6_ALLOW_WRITE === "true") throw new Error("P9.6 introspection is read-only; write mode is forbidden.");

const client = new Client({ connectionString: url });
await client.connect();
const q = async (sql) => (await client.query(sql)).rows;
const result = {
 generatedAt:new Date().toISOString(), target:"local-postgresql", readOnly:true,
 server:(await q("select version() as version,current_database() as database,current_user as user"))[0],
 schemas:await q("select nspname as schema_name from pg_namespace where nspname not in ('pg_toast','pg_temp_1') order by 1"),
 tables:await q("select n.nspname as schema_name,c.relname as table_name,c.relkind,c.relpersistence,obj_description(c.oid,'pg_class') as comment from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname not in ('pg_catalog','information_schema') and c.relkind in ('r','p','v','m','f') order by 1,2"),
 columns:await q("select table_schema,table_name,ordinal_position,column_name,data_type,udt_name,is_nullable,column_default,character_maximum_length,numeric_precision,numeric_scale from information_schema.columns where table_schema not in ('pg_catalog','information_schema') order by 1,2,3"),
 constraints:await q("select n.nspname as schema_name,cl.relname as table_name,con.conname as constraint_name,case con.contype when 'p' then 'PRIMARY KEY' when 'f' then 'FOREIGN KEY' when 'u' then 'UNIQUE' when 'c' then 'CHECK' when 'x' then 'EXCLUDE' else con.contype::text end as constraint_type,pg_get_constraintdef(con.oid,true) as definition from pg_constraint con join pg_class cl on cl.oid=con.conrelid join pg_namespace n on n.oid=cl.relnamespace where n.nspname not in ('pg_catalog','information_schema') order by 1,2,3"),
 indexes:await q("select schemaname as schema_name,tablename as table_name,indexname as index_name,indexdef as definition from pg_indexes where schemaname not in ('pg_catalog','information_schema') order by 1,2,3"),
 functions:await q("select n.nspname as schema_name,p.proname as function_name,pg_get_function_identity_arguments(p.oid) as arguments,pg_get_function_result(p.oid) as result_type,l.lanname as language,p.prosecdef as security_definer,pg_get_functiondef(p.oid) as definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_language l on l.oid=p.prolang where n.nspname not in ('pg_catalog','information_schema') order by 1,2"),
 triggers:await q("select event_object_schema as schema_name,event_object_table as table_name,trigger_name,event_manipulation,event_timing,action_statement from information_schema.triggers where trigger_schema not in ('pg_catalog','information_schema') order by 1,2,3"),
 rls:await q("select schemaname as schema_name,tablename as table_name,rowsecurity,forcerowsecurity from pg_tables where schemaname not in ('pg_catalog','information_schema') order by 1,2"),
 policies:await q("select schemaname as schema_name,tablename as table_name,policyname,permissive,roles,cmd,qual,with_check from pg_policies where schemaname not in ('pg_catalog','information_schema') order by 1,2,3"),
 extensions:await q("select extname,extversion from pg_extension order by 1")
};
const out=path.resolve("artifacts/p9.6"); await fs.mkdir(out,{recursive:true});
await fs.writeFile(path.join(out,"local-postgres-introspection.json"),JSON.stringify(result,null,2)+"\n");
await client.end(); console.log("Wrote artifacts/p9.6/local-postgres-introspection.json");
