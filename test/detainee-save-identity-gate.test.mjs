import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const resolverSource=fs.readFileSync(new URL('../web/mta-detainee-identity-resolution-v1.js',import.meta.url),'utf8');
const domainSource=fs.readFileSync(new URL('../web/mta-domain-commands-v2.js',import.meta.url),'utf8');
const uiSource=fs.readFileSync(new URL('../web/mta-identity-resolution-ui-v1.js',import.meta.url),'utf8');
const runtimeSource=fs.readFileSync(new URL('../web/mta-app-runtime-full.js',import.meta.url),'utf8');
const apiSource=fs.readFileSync(new URL('../supabase/functions/mta-api/index.ts',import.meta.url),'utf8');

test('SIG-001 Save gate blocks existing/near identity before create',async()=>{
  global.window={};
  eval(resolverSource);
  window.MTADeteniDomainCommands={createDetainee:async()=>({ok:true,code:'DETAINEE_CREATED'})};
  eval(domainSource);
  const state={detainees:[{id:'4',nid:'RDM-PTK-26-000004',name:'Eman Samir Almorsallai',dateOfBirth:'1987-12-01',passportNumber:'',nationality:'Suriah',status:'AKTIF'}]};
  const blocked=await window.MTADeteniDomainCommandsV2.createDetainee(state,{name:'Eman Samir Almorsalla',entryYear:2026});
  assert.equal(blocked.ok,false);
  assert.equal(blocked.code,'IDENTITY_REVIEW_REQUIRED');
  assert.equal(blocked.identityResolution.candidates[0].nid,'RDM-PTK-26-000004');
});

test('SIG-002 Save gate permits create only after explicit NOT_SAME_PERSON decision',async()=>{
  global.window={};
  eval(resolverSource);
  let created=0;
  window.MTADeteniDomainCommands={createDetainee:async()=>{created++;return{ok:true,code:'DETAINEE_CREATED'}}};
  eval(domainSource);
  const state={detainees:[{id:'4',nid:'RDM-PTK-26-000004',name:'Eman Samir Almorsallai',dateOfBirth:'1987-12-01',passportNumber:'',nationality:'Suriah',status:'AKTIF'}]};
  const allowed=await window.MTADeteniDomainCommandsV2.createDetainee(state,{name:'Eman Samir Almorsalla',entryYear:2026,identityDecision:'NOT_SAME_PERSON'});
  assert.equal(allowed.ok,true);
  assert.equal(created,1);
});

test('SIG-003 no-match Save continues without a separate search action',async()=>{
  global.window={};
  eval(resolverSource);
  let created=0;
  window.MTADeteniDomainCommands={createDetainee:async()=>{created++;return{ok:true,code:'DETAINEE_CREATED'}}};
  eval(domainSource);
  const result=await window.MTADeteniDomainCommandsV2.createDetainee({detainees:[]},{name:'New Person',entryYear:2026});
  assert.equal(result.ok,true);
  assert.equal(created,1);
});

test('SIG-004 UI has no standalone Cari Riwayat action and runtime forwards Save decision',()=>{
  assert.doesNotMatch(uiSource,/data-ir-search|Cari Riwayat Deteni/);
  assert.match(uiSource,/data-ir-decision/);
  assert.match(runtimeSource,/identityDecision=String\(identityGate\?\.getDecision/);
  assert.match(runtimeSource,/identityDecision\}\)/);
});

test('SIG-005 server identity contract does not treat nationality-only evidence as a match',()=>{
  const apiSource=fs.readFileSync(new URL('../supabase/functions/mta-api/index.ts',import.meta.url),'utf8');
  assert.match(apiSource,/else if\(has\("NAME_EXACT"\)\)confidence="NAME_ONLY"/);
  assert.match(apiSource,/else if\(has\("NAME_NEAR"\)\)confidence="NAME_ONLY"/);
  assert.match(apiSource,/if\(!confidence\)return null/);
});

test('SIG-006 production API contains a server-side identity gate before detainee mutation',()=>{
  assert.match(apiSource,/resolveDetaineeIdentityCandidates/);
  assert.match(apiSource,/IDENTITY_REVIEW_REQUIRED/);
  assert.match(apiSource,/identity_decision/);
  assert.match(apiSource,/resource==="detainees" && req.method==="POST"/);
});
