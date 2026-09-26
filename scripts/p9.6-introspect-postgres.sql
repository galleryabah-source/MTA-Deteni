select jsonb_build_object(
  'generatedAt', now(),
  'target','local-postgresql',
  'readOnly', true,
  'server',(select row_to_json(s) from (select version(),current_database() as database,current_user as user) s),
  'schemas',(select coalesce(jsonb_agg(row_to_json(s) order by schema_name),'[]'::jsonb) from (select nspname as schema_name from pg_namespace where nspname not in ('pg_toast','pg_temp_1') order by 1) s),
  'tables',(select coalesce(jsonb_agg(row_to_json(t) order by schema_name,table_name),'[]'::jsonb) from (select n.nspname as schema_name,c.relname as table_name,c.relkind,c.relpersistence,obj_description(c.oid,'pg_class') as comment from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname not in ('pg_catalog','information_schema') and c.relkind in ('r','p','v','m','f')) t),
  'columns',(select coalesce(jsonb_agg(row_to_json(c) order by table_schema,table_name,ordinal_position),'[]'::jsonb) from information_schema.columns c where table_schema not in ('pg_catalog','information_schema')),
  'constraints',(select coalesce(jsonb_agg(row_to_json(c) order by schema_name,table_name,constraint_name),'[]'::jsonb) from (select n.nspname as schema_name,cl.relname as table_name,con.conname as constraint_name,con.contype,pg_get_constraintdef(con.oid,true) as definition from pg_constraint con join pg_class cl on cl.oid=con.conrelid join pg_namespace n on n.oid=cl.relnamespace where n.nspname not in ('pg_catalog','information_schema')) c),
  'indexes',(select coalesce(jsonb_agg(row_to_json(i) order by schema_name,table_name,index_name),'[]'::jsonb) from pg_indexes i where schemaname not in ('pg_catalog','information_schema')),
  'functions',(select coalesce(jsonb_agg(row_to_json(f) order by schema_name,function_name),'[]'::jsonb) from (select n.nspname as schema_name,p.proname as function_name,pg_get_function_identity_arguments(p.oid) as arguments,pg_get_function_result(p.oid) as result_type,l.lanname as language,p.prosecdef as security_definer,pg_get_functiondef(p.oid) as definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_language l on l.oid=p.prolang where n.nspname not in ('pg_catalog','information_schema')) f),
  'triggers',(select coalesce(jsonb_agg(row_to_json(t) order by schema_name,table_name,trigger_name),'[]'::jsonb) from information_schema.triggers t where trigger_schema not in ('pg_catalog','information_schema')),
  'rls',(select coalesce(jsonb_agg(row_to_json(r) order by schema_name,table_name),'[]'::jsonb) from pg_tables r where schemaname not in ('pg_catalog','information_schema')),
  'policies',(select coalesce(jsonb_agg(row_to_json(p) order by schema_name,table_name,policyname),'[]'::jsonb) from pg_policies p where schemaname not in ('pg_catalog','information_schema')),
  'extensions',(select coalesce(jsonb_agg(row_to_json(e) order by extname),'[]'::jsonb) from pg_extension e)
);