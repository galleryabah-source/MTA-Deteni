import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const p='docs/03-implementation/P10.43-POST-FREEZE-VERIFICATION-EVIDENCE-CONTRACT.md';
test('P10.43 defines independently verifiable evidence',()=>{const s=readFileSync(p,'utf8');for(const x of ['schemaVersion','decisionId','commitSha','targetEnvironment','targetDatabaseIdentity','migrationBundleSha256','backupId','schemaInventorySha256','rlsVerificationSha256','concurrencyEvidenceSha256'])assert.match(s,new RegExp('`'+x+'`'));});
test('P10.43 preserves PASS FAIL BLOCKED semantics',()=>{const s=readFileSync(p,'utf8');for(const x of ['PASS','FAIL','BLOCKED','independently'])assert.match(s,new RegExp(x));});
