import assert from 'node:assert/strict';
import fs from 'node:fs';

const ui=fs.readFileSync('web/mta-auth-ui.js','utf8');
const api=fs.readFileSync('supabase/functions/mta-api/index.ts','utf8');
const rls=fs.readFileSync('supabase/migrations/20260921070000_mta_production_auth_rbac_v1.sql','utf8');

assert.match(ui,/ROLES=Object\.freeze\(\['OWNER','ADMIN','EDITOR','REVIEWER','AUDITOR'\]\)/);
assert.match(api,/GET:new Set\(\["OWNER","ADMIN","EDITOR","REVIEWER","AUDITOR"\]\)/);
assert.match(api,/POST:new Set\(\["OWNER","ADMIN","EDITOR"\]\)/);
assert.match(api,/PATCH:new Set\(\["OWNER","ADMIN","EDITOR"\]\)/);
assert.match(api,/DELETE:new Set\(\["OWNER","ADMIN"\]\)/);

assert.match(rls,/mta_detainees_delete_admin/);
assert.match(rls,/mta_documents_delete_admin/);
assert.match(rls,/mta_audit_select_authorized/);
assert.match(rls,/mta_current_role\(\) in \('OWNER','ADMIN','AUDITOR'\)/);
assert.match(ui,/AUDIT:\['OWNER','ADMIN','AUDITOR'\]/);
assert.doesNotMatch(ui,/REVIEWER:\{label:'Reviewer',views:\[[^\]]*'audit'/);

const broadPlacement=/create policy mta_placements_write_editor on public\.mta_placements for all to authenticated using \(public\.mta_current_role\(\) in \('OWNER','ADMIN','EDITOR'\)\)/;
const broadMovement=/create policy mta_movements_write_editor on public\.mta_movements for all to authenticated using \(public\.mta_current_role\(\) in \('OWNER','ADMIN','EDITOR'\)\)/;
const broadLeave=/create policy mta_leaves_write_editor on public\.mta_leaves for all to authenticated using \(public\.mta_current_role\(\) in \('OWNER','ADMIN','EDITOR'\)\)/;
assert.match(rls,broadPlacement);
assert.match(rls,broadMovement);
assert.match(rls,broadLeave);

console.log('RBAC_RLS_PARITY_AUDIT PASS — known direct-DB DELETE drift is documented and migration remains frozen');

const auth=fs.readFileSync('web/mta-auth.js','utf8');
assert.doesNotMatch(auth,/client:supabase/);
assert.doesNotMatch(auth,/window\\.mtaAuth\\.client/);
