import fs from 'node:fs';
import assert from 'node:assert/strict';

const admin=fs.readFileSync('web/admin-settings-v9.js','utf8');
const api=fs.readFileSync('supabase/functions/mta-api/index.ts','utf8');

for (const role of ['OWNER','ADMIN','EDITOR','REVIEWER','AUDITOR']) {
  assert.match(admin,new RegExp('\\b'+role+'\\b'),'canonical role missing: '+role);
}
for (const permission of [
  'IDENTITY.USER.CREATE','IDENTITY.USER.DISABLE',
  'DETENI.VIEW','DETENI.EDIT','PLACEMENT.ASSIGN',
  'MOVEMENT.CREATE','LEAVE.APPROVE','ESCORT.ASSIGN',
  'ESCORT_LETTER.GENERATE','DOCUMENT.DOWNLOAD',
  'AUDIT.INTEGRITY.VERIFY','RBAC.ROLE.MANAGE',
  'SYSTEM.SECURITY.MANAGE'
]) assert.ok(admin.includes(permission),'permission missing: '+permission);

assert.match(admin,/Manajemen User & RBAC/);
assert.match(admin,/mtaAdminAddUser/);
assert.match(admin,/mtaAdminEditUser/);
assert.match(admin,/Reset ke Default RBAC/);
assert.match(admin,/Unchecked = DENY/);
assert.match(api,/mta_permissions/);
assert.match(api,/ADMIN_USER_PERMISSION_UPDATE_FAILED/);
assert.match(api,/Array\.isArray\(body\.permissions\)/);

console.log('admin-user-rbac-checklist: PASS');
