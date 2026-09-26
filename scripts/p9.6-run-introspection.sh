#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"
case "$DATABASE_URL" in
  *supabase.co*|*supabase.com*) echo "Production boundary violation"; exit 2 ;;
esac
out="artifacts/p9.6/local-postgres-introspection.json"
mkdir -p "$(dirname "$out")"
json(){ psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -At -c "$1"; }
export DB_NAME="$(json 'select current_database()')"
export DB_USER="$(json 'select current_user')"
export TABLES="$(json "select coalesce(json_agg(row_to_json(t))::text,'[]') from (select n.nspname schema_name,c.relname table_name,c.relkind from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind in ('r','p') and n.nspname not in ('pg_catalog','information_schema') order by 1,2) t")"
export COLUMNS="$(json "select coalesce(json_agg(row_to_json(t))::text,'[]') from (select table_schema,table_name,column_name,data_type,is_nullable,column_default from information_schema.columns where table_schema not in ('pg_catalog','information_schema') order by 1,2,ordinal_position) t")"
export INDEXES="$(json "select coalesce(json_agg(row_to_json(t))::text,'[]') from (select schemaname schema_name,indexname index_name,tablename table_name,indexdef from pg_indexes where schemaname not in ('pg_catalog','information_schema') order by 1,2) t")"
export CONSTRAINTS="$(json "select coalesce(json_agg(row_to_json(t))::text,'[]') from (select n.nspname schema_name,c.relname table_name,con.conname constraint_name,con.contype constraint_type from pg_constraint con join pg_class c on c.oid=con.conrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname not in ('pg_catalog','information_schema') order by 1,2,3) t")"
export FUNCTIONS="$(json "select coalesce(json_agg(row_to_json(t))::text,'[]') from (select n.nspname schema_name,p.proname function_name,pg_get_function_identity_arguments(p.oid) arguments from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','private') order by 1,2,3) t")"
export TRIGGERS="$(json "select coalesce(json_agg(row_to_json(t))::text,'[]') from (select event_object_schema schema_name,event_object_table table_name,trigger_name,event_manipulation from information_schema.triggers where event_object_schema not in ('pg_catalog','information_schema') order by 1,2,3) t")"
export POLICIES="$(json "select coalesce(json_agg(row_to_json(t))::text,'[]') from (select schemaname schema_name,tablename table_name,policyname,cmd,roles,qual,with_check from pg_policies where schemaname not in ('pg_catalog','information_schema') order by 1,2,3) t")"
export ROLES="$(json "select coalesce(json_agg(row_to_json(t))::text,'[]') from (select rolname,rolcanlogin,rolsuper,rolinherit,rolcreaterole,rolcreatedb from pg_roles where rolname in ('anon','authenticated','service_role','mta_p96') order by 1) t")"
node - "$out" <<'NODE'
const fs=require("node:fs"), path=require("node:path");
const out=process.argv[2], q=n=>JSON.parse(process.env[n]);
const payload={generatedAt:new Date().toISOString(),target:{database:process.env.DB_NAME,user:process.env.DB_USER},tables:q("TABLES"),columns:q("COLUMNS"),indexes:q("INDEXES"),constraints:q("CONSTRAINTS"),functions:q("FUNCTIONS"),triggers:q("TRIGGERS"),policies:q("POLICIES"),roles:q("ROLES")};
fs.mkdirSync(path.dirname(out),{recursive:true}); fs.writeFileSync(out,JSON.stringify(payload,null,2)+"\n");
NODE
