import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

const source=await fs.readFile(new URL('../web/daily-guard-report-v2.js',import.meta.url),'utf8');
const window={};
vm.runInNewContext(source,{window,crypto:webcrypto,TextEncoder,structuredClone});
const api=window.mtaDailyGuardReport;

const fixture=()=>({
  documentId:'RPT-SYN-001',
  documentType:api.TYPE,
  reportDate:'2026-09-21',
  officeId:'MTA-SYNTHETIC-OFFICE',
  reguId:'Bravo',
  shiftId:'Pagi',
  startAt:'07.00–14.00 WIB',
  status:'GENERATED',
  templateVersion:api.VERSION,
  generatedAt:'2026-09-21T07:00:00.000Z',
  sourceRecordIds:['DET-001','DET-002','MOV-001'],
  addressees:[{id:'SYN-ADD-01',label:'Synthetic'}],
  handover:{incomingRegu:'Bravo',shift:'Pagi',attendanceStatus:'SYNTHETIC',note:'Synthetic handover'},
  blockControl:[{id:'SYN-BLOCK-01'}],
  guardPost:[{id:'SYN-POST-01'}],
  detaineeActivity:[{id:'SYN-ACT-01'}],
  escortActivity:[{id:'SYN-ESC-01'}],
  mealDistribution:[{id:'SYN-MEAL-01'}],
  endHandover:{id:'SYN-END-01'},
  signatories:[{role:'Duty Commander',name:'SYNTHETIC OFFICER',identifier:'SYNTHETIC'}],
  photos:[],
  sections:{
    cover:{},
    addressee:{text:'Synthetic addressee'},
    handover:{incomingRegu:'Bravo',shift:'Pagi',attendanceStatus:'SYNTHETIC',note:'Synthetic handover'},
    block_control:{time:'07.00–14.00 WIB',headcount:2,result:'Synthetic control check'},
    guard_post:{activity:'Synthetic post check',result:'Synthetic result'},
    activity:{description:'Synthetic supervision',time:'10.00 WIB',location:'Synthetic location',result:'Synthetic result'},
    escort:{count:0,destination:'Synthetic',purpose:'Synthetic',activity:'Synthetic'},
    meal:{time:'12.00 WIB',result:'Synthetic result',distributionStatus:'Synthetic'},
    end_handover:{time:'14.00 WIB',incomingRegu:'Alpha',condition:'Synthetic',outstandingIssues:'None'},
    closing:{statement:'Synthetic document'},
    closing_page:{}
  }
});

test('daily guard report contract validates complete synthetic fixture',()=>assert.equal(api.validate(fixture()),true));

test('daily guard report rejects incomplete section contract',()=>{
  const r=fixture();
  delete r.sections.meal;
  assert.throws(()=>api.validate(r),/REPORT_SECTION_INCOMPLETE/);
});

test('daily guard report integrity hash is deterministic and changes with source material',async()=>{
  const a=await api.prepare(fixture());
  const b=await api.prepare(fixture());
  assert.equal(a.integrityHash,b.integrityHash);
  assert.match(a.integrityHash,/^[0-9a-f]{64}$/);
  assert.match(a.filename,/^Laporan_Harian_Regu_Jaga_2026-09-21_Bravo_Pagi\.pdf$/);
  const changed=fixture();
  changed.sections.handover.note='Changed synthetic handover';
  const c=await api.prepare(changed);
  assert.notEqual(a.integrityHash,c.integrityHash);
});

test('daily guard report renderer produces the complete 11-page structure',async()=>{
  const r=await api.prepare(fixture());
  const html=api.render(r);
  assert.equal((html.match(/class="mta-report-page"/g)||[]).length,11);
  assert.match(html,/Halaman 11 \/ 11/);
  assert.match(html,/LAPORAN HARIAN REGU JAGA/);
  assert.match(html,/CLOSING &amp; SIGNATURES/);
});

test('daily guard report lifecycle allows only the controlled workflow path',()=>{
  const api2=api;
  assert.equal(api2.canTransition(api2.WORKFLOW.DRAFT,api2.WORKFLOW.VALIDATED),true);
  assert.equal(api2.canTransition(api2.WORKFLOW.VALIDATED,api2.WORKFLOW.GENERATED),true);
  assert.equal(api2.canTransition(api2.WORKFLOW.GENERATED,api2.WORKFLOW.IN_REVIEW),true);
  assert.equal(api2.canTransition(api2.WORKFLOW.IN_REVIEW,api2.WORKFLOW.APPROVED),true);
  assert.equal(api2.canTransition(api2.WORKFLOW.APPROVED,api2.WORKFLOW.FINAL),true);
  assert.equal(api2.canTransition(api2.WORKFLOW.FINAL,api2.WORKFLOW.DRAFT),false);
  assert.equal(api2.canTransition(api2.WORKFLOW.GENERATED,api2.WORKFLOW.FINAL),false);
});

test('daily guard report lifecycle supports request-changes and revision loop',()=>{
  const r=fixture();
  r.status=api.WORKFLOW.GENERATED;
  api.transitionStatus(r,api.WORKFLOW.IN_REVIEW);
  api.transitionStatus(r,api.WORKFLOW.CHANGES_REQUESTED);
  assert.equal(r.status,api.WORKFLOW.CHANGES_REQUESTED);
  api.transitionStatus(r,api.WORKFLOW.DRAFT);
  assert.equal(r.status,api.WORKFLOW.DRAFT);
});

test('daily guard report lifecycle action contract exposes the expected next action',()=>{
  assert.deepEqual(api.lifecycleAction(api.WORKFLOW.DRAFT),{label:'Validate',next:api.WORKFLOW.VALIDATED});
  assert.deepEqual(api.lifecycleAction(api.WORKFLOW.VALIDATED),{label:'Generate',next:api.WORKFLOW.GENERATED});
  assert.deepEqual(api.lifecycleAction(api.WORKFLOW.GENERATED),{label:'Start Review',next:api.WORKFLOW.IN_REVIEW});
  assert.deepEqual(api.lifecycleAction(api.WORKFLOW.APPROVED),{label:'Finalize',next:api.WORKFLOW.FINAL});
  assert.equal(api.lifecycleAction(api.WORKFLOW.FINAL).next,null);
});
