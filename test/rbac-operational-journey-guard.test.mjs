import assert from 'node:assert/strict';
import fs from 'node:fs';

const guard=fs.readFileSync('web/mta-rbac-action-guard.js','utf8');
const html=fs.readFileSync('web/index.html','utf8');
const movement=fs.readFileSync('web/movement-v9.js','utf8');
const preview=fs.readFileSync('web/preview-v6.js','utf8');
const preview5=fs.readFileSync('web/preview-v5.js','utf8');

assert.match(html,/mta-rbac-action-guard\.js/,'runtime must load the RBAC action guard');
for(const marker of [
  'mtaRbacActionGuard','window.mtaRbac?.canAction','RBAC_ACTION_DENIED',
  'addDetainee','archiveDetainee','generateReport','validateReport','approveReport',
  'finalizeReport','downloadReport','advanceLeave','p5return','p6roomState','p6issue',
  'p6csv','p6printReport','p6printQR'
]) assert.ok(guard.includes(marker),'missing action guard marker: '+marker);

assert.match(guard,/form\.addEventListener\('submit',[\s\S]*movement\.CREATE/,'movement CREATE must be guarded at event boundary');
assert.match(guard,/canAction\('APPROVE'\)/,'approval must be guarded');
assert.match(guard,/canAction\('FINALIZE'\)/,'finalization must be guarded');
assert.match(guard,/canAction\('AUDIT'\)/,'audit access must be guarded');
assert.match(movement,/p9moveForm/,'movement journey must expose its form boundary');
assert.match(preview,/p6issue/,'leave QR issuance journey must be present');
assert.match(preview,/p6roomState/,'room state journey must be present');
assert.match(preview,/p6manualScan/,'camera scan journey must be present');
assert.match(preview5,/p5resolve/,'Scan Center resolution journey must be present');
assert.match(preview5,/p5return/,'leave return journey must be present');

console.log('RBAC_OPERATIONAL_JOURNEY_GUARD PASS');
