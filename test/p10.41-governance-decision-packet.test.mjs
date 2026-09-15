import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const p='docs/03-implementation/P10.41-CONTROLLED-GOVERNANCE-DECISION-PACKET.md';
test('P10.41 remains a governance decision, not automatic approval',()=>{const s=readFileSync(p,'utf8');assert.match(s,/KEEP_FREEZE/);assert.match(s,/LIFT_FREEZE_CONTROLLED/);assert.match(s,/REJECT/);assert.match(s,/does not lift Migration Freeze/);assert.match(s,/NOT CERTIFIED/);});
test('P10.41 requires explicit governance evidence',()=>{const s=readFileSync(p,'utf8');for(const x of ['decisionId','authorityRole','changeWindow','targetEnvironment','migrationBundleSha256','rollbackPlanRef','SoDConfirmed'])assert.match(s,new RegExp('`'+x+'`'));});
