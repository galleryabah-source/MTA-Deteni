import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../web/mta-detainee-identity-resolution-v1.js',import.meta.url),'utf8');
global.window={};
eval(source);
const resolver=global.window.MTADeteniIdentityResolutionV1;

const state={
  detainees:[
    {id:'1',nid:'RDM-PTK-26-000001',name:'Eman Samir Almorsallal',dateOfBirth:'1985-03-10',passportNumber:'P1234567',nationality:'XXX',status:'NONAKTIF'},
    {id:'2',nid:'RDM-PTK-26-000002',name:'Eman Samir Almorsallal',dateOfBirth:'1985-03-10',passportNumber:'P7654321',nationality:'XXX',status:'AKTIF'},
    {id:'3',nid:'RDM-PTK-26-000003',name:'Ali Hassan',dateOfBirth:'1990-01-01',passportNumber:'',nationality:'YYY',status:'NONAKTIF'}
  ]
};

test('IRR-001 exact passport + DOB returns strong candidate without auto-link',()=>{
  const r=resolver.resolve(state,{name:'Eman Samir Almorsallal',dateOfBirth:'1985-03-10',passportNumber:'P1234567',nationality:'XXX'});
  assert.equal(r.status,'CANDIDATES_FOUND');
  assert.equal(r.candidates[0].nid,'RDM-PTK-26-000001');
  assert.equal(r.candidates[0].confidence,'STRONG');
  assert.deepEqual(r.candidates[0].matchBasis,['PASSPORT_EXACT','DATE_OF_BIRTH_EXACT','NAME_EXACT','NATIONALITY_EXACT']);
  assert.equal(r.autoLinked,false);
  assert.equal(r.requiresHumanConfirmation,true);
});

test('IRR-002 name only is discovery evidence and never automatic identity binding',()=>{
  const r=resolver.resolve(state,{name:'Eman Samir Almorsallal'});
  assert.equal(r.candidates.length,2);
  assert.ok(r.candidates.every(x=>x.confidence==='NAME_ONLY'));
  assert.equal(r.autoLinked,false);
  assert.equal(r.requiresHumanConfirmation,true);
});

test('IRR-003 DOB + name + nationality can produce probable candidate',()=>{
  const r=resolver.resolve(state,{name:'Ali Hassan',dateOfBirth:'1990-01-01',nationality:'YYY'});
  assert.equal(r.candidates.length,1);
  assert.equal(r.candidates[0].confidence,'PROBABLE');
  assert.ok(r.candidates[0].matchBasis.includes('DATE_OF_BIRTH_EXACT'));
});

test('IRR-004 different passport prevents passport evidence but does not create a new identity automatically',()=>{
  const r=resolver.resolve(state,{name:'Eman Samir Almorsallal',dateOfBirth:'1985-03-10',passportNumber:'UNKNOWN',nationality:'XXX'});
  assert.equal(r.candidates.length,2);
  assert.equal(r.autoLinked,false);
});

test('IRR-005 no matching identity permits canonical new-person flow',()=>{
  const r=resolver.resolve(state,{name:'New Person',dateOfBirth:'2000-01-01',passportNumber:'NEW123',nationality:'ZZZ'});
  assert.equal(r.status,'NO_MATCH');
  assert.equal(resolver.canCreateNewPerson(r),true);
});

test('IRR-006 resolver is read-only and never changes detainee records',()=>{
  const before=JSON.stringify(state);
  resolver.resolve(state,{name:'Eman Samir Almorsallal',dateOfBirth:'1985-03-10'});
  assert.equal(JSON.stringify(state),before);
});

test('IRR-007 NID remains the returned canonical identity',()=>{
  const r=resolver.resolve(state,{name:'Eman Samir Almorsallal',passportNumber:'P1234567'});
  assert.equal(r.candidates[0].nid,'RDM-PTK-26-000001');
  assert.match(r.candidates[0].nid,/^RDM-PTK-[0-9]{2}-[0-9]{6}$/);
});

test('IRR-008 resolver does not introduce episode or NID generation',()=>{
  assert.equal(typeof resolver.resolve,'function');
  assert.equal('createEpisode' in resolver,false);
  assert.equal('generateNid' in resolver,false);
});
