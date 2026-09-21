import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadContract(){
  const box={};
  const code=fs.readFileSync('web/daily-guard-report-d57.js','utf8');
  const ctx={window:box,console};
  vm.runInNewContext(code,ctx);
  return box.mtaDailyGuardD57;
}
const c=loadContract();

const reports=[
 {documentId:'R1',reportDate:'2026-09-21',reguId:'Bravo',shiftId:'Pagi',status:'FINAL',revision:1,filename:'B-1.pdf',createdAt:'2026-09-21T01:00:00Z'},
 {documentId:'R2',reportDate:'2026-09-21',reguId:'Bravo',shiftId:'Pagi',status:'FINAL',revision:2,revisionOf:'R1',filename:'B-2.pdf',createdAt:'2026-09-21T02:00:00Z'},
 {documentId:'R3',reportDate:'2026-09-21',reguId:'Alpha',shiftId:'Malam',status:'APPROVED',revision:1,filename:null,createdAt:'2026-09-21T03:00:00Z'}
];

assert.equal(c.filterReports(reports,{date:'2026-09-21',regu:'Bravo',shift:'Pagi'}).length,2);
assert.equal(c.filterReports(reports,{regu:'alpha'})[0].documentId,'R3');

const history=c.buildRevisionHistory(reports,'R2');
assert.deepEqual(Array.from(history, x=>x.documentId),['R1','R2']);
assert.equal(c.latestRevisionMap(reports).get('R1').documentId,'R2');

const manifest=c.createBulkManifest(reports,['R1','R2'],{date:'2026-09-21',regu:'Bravo',shift:'Pagi'});
assert.equal(manifest.contract,'D5.7-BULK-DOWNLOAD-MANIFEST-v1');
assert.equal(manifest.count,2);
assert.deepEqual(manifest.items.map(x=>x.documentId),['R1','R2']);

assert.throws(()=>c.createBulkManifest(reports,['R3'],{}),/BULK_FINAL_ONLY/);
assert.throws(()=>c.createBulkManifest(reports,[],{}),/BULK_SELECTION_EMPTY/);

console.log('D5.7 PASS: filters, revision history, latest revision map, final-only bulk manifest');
