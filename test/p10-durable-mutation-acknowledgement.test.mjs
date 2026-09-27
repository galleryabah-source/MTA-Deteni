import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

const kernelSource=fs.readFileSync(new URL('../web/mta-state-kernel-v1.js',import.meta.url),'utf8');
const apiSource=fs.readFileSync(new URL('../web/mta-production-api.js',import.meta.url),'utf8');

function makeContext({createImpl,failAfterCreate=false}={}){
  const store=new Map();
  const listeners=new Map();
  const window={
    dispatchEvent(e){listeners.get(e.type)?.forEach(fn=>fn(e));},
    addEventListener(t,fn){const a=listeners.get(t)||[];a.push(fn);listeners.set(t,a);}
  };
  const context={
    window,
    localStorage:{
      getItem:k=>store.has(k)?store.get(k):null,
      setItem(k,v){store.set(k,String(v));},
      removeItem(k){store.delete(k);}
    },
    CustomEvent:class{constructor(type,init={}){this.type=type;this.detail=init.detail;}},
    crypto,
    TextEncoder,
    console,
    structuredClone,
    fetch:async(url)=>{
      assert.equal(url,'/api/runtime');
      return {ok:true,json:async()=>({mode:'PRODUCTION',productionAccessAuthorized:true,livePostgresqlExecution:true})};
    }
  };
  vm.runInNewContext(kernelSource,context,{filename:'mta-state-kernel-v1.js'});
  let calls=0;
  context.window.mtaProductionApi={
    async list(resource){
      if(resource==='audit')return {ok:true,data:[]};
      return {ok:true,data:[]};
    },
    async create(resource,body){
      calls++;
      if(failAfterCreate)throw Object.assign(new Error('REMOTE_MUTATION_FAILED'),{status:503});
      return {ok:true,row:{id:body.id||'REMOTE-001',...body}};
    },
    async update(){calls++;return {ok:true};},
    async remove(){calls++;return {ok:true};}
  };
  return {context,calls:()=>calls};
}

{
  const {context,calls}=makeContext();
  await context.window.MTADeteniStateKernel.ready();
  const state=context.window.MTADeteniStateKernel.read();
  state.detainees.push({id:'DET-A',code:'DET-A',name:'SYNTHETIC A',status:'AKTIF'});
  const result=await context.window.MTADeteniStateKernel.write(state);
  assert.equal(result,true,'write must acknowledge only after remote completion');
  assert.equal(calls(),1,'one logical mutation must produce exactly one remote mutation');
  assert.equal(state.detainees[0].id,'REMOTE-001','server canonical ID must replace the client-only ID after acknowledgement');
  await context.window.MTADeteniStateKernel.write(state);
  assert.equal(calls(),1,'replaying the same acknowledged state must not create a duplicate mutation');
  assert.equal(context.window.MTADeteniStateKernel.getSyncState().status,'SYNCED');
}

{
  const {context}=makeContext({failAfterCreate:true});
  await context.window.MTADeteniStateKernel.ready();
  const state=context.window.MTADeteniStateKernel.read();
  state.detainees.push({id:'DET-FAIL',code:'DET-FAIL',name:'SYNTHETIC FAIL',status:'AKTIF'});
  await assert.rejects(()=>context.window.MTADeteniStateKernel.write(state),/REMOTE_MUTATION_FAILED/);
  assert.equal(context.window.MTADeteniStateKernel.getSyncState().status,'ERROR');
}

{
  const ids=[];
  const headers=[];
  const fetchImpl=async(_url,opts)=>{
    headers.push(Object.fromEntries(Object.entries(opts.headers).map(([k,v])=>[k.toLowerCase(),v])));
    return {ok:true,json:async()=>({ok:true,row:{id:'DET-IDEMP'}})};
  };
  const context={window:{},crypto,TextEncoder,console,fetch:fetchImpl};
  vm.runInNewContext(apiSource,context,{filename:'mta-production-api.js'});
  const api=context.window.mtaProductionApi;
  const a=await api.create('detainees',{code:'DET-IDEMP',name:'SYNTHETIC'});
  const b=await api.create('detainees',{code:'DET-IDEMP',name:'SYNTHETIC'});
  assert.equal(a.ok,true);assert.equal(b.ok,true);
  assert.equal(headers[0]['idempotency-key'],headers[1]['idempotency-key'],'same logical request must reuse deterministic idempotency key');
  ids.push(headers[0]['idempotency-key']);
  assert.equal(ids.length,1);
}

{
  const edge=fs.readFileSync(new URL('../supabase/functions/mta-api/index.ts',import.meta.url),'utf8');
  assert.match(edge,/mta_execute_idempotent_mutation/);
  assert.match(edge,/p_idempotency_key:idempotencyKey/);
  assert.match(edge,/p_request_hash:requestHash/);
  assert.match(edge,/p_audit:/);
  assert.match(edge,/requestId/);
  assert.match(edge,/correlationId/);
}

console.log('P10 durable mutation acknowledgement regression: PASS — certification contract');
console.log('Verified:');
console.log('- success waits for remote mutation completion');
console.log('- remote failure rejects and is not reported as success');
console.log('- one logical mutation produces one remote mutation');
console.log('- deterministic Idempotency-Key is reused for identical logical requests');
console.log('- backend mutation contract includes idempotency, request hash, request/correlation IDs and audit payload');
