import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('web/mta-unified-shell-v2.js','utf8');
const state={
  detainees:[
    {id:'DET-F5-001',code:'SYN-F5-001',name:'Synthetic Deteni',status:'AKTIF',createdAt:'2026-09-22T00:00:00.000Z'},
    {id:'DET-F5-002',code:'SYN-F5-002',name:'Synthetic Inactive',status:'NONAKTIF',createdAt:'2026-09-22T00:00:00.000Z'}
  ],
  rooms:[
    {id:'ROOM-F5-001',block:'B1',room:'101',capacity:2,status:'ACTIVE',createdAt:'2026-09-22T00:00:00.000Z'},
    {id:'ROOM-F5-002',block:'B1',room:'102',capacity:2,status:'ACTIVE',createdAt:'2026-09-22T00:00:00.000Z'},
    {id:'ROOM-F5-X',block:'B1',room:'999',capacity:2,status:'INACTIVE',createdAt:'2026-09-22T00:00:00.000Z'}
  ],
  blocks:[],
  placements:[{id:'PLC-F5-001',detaineeId:'DET-F5-001',roomId:'ROOM-F5-001',blockId:'B1',source:'MASTER_ROOM',since:'2026-09-22T00:00:00.000Z'}],
  movements:[],
  leaves:[{id:'LV-F5-001',detaineeId:'DET-F5-001',status:'DRAFT',startAt:'2026-09-22T12:00:00.000Z'}],
  documents:[],
  audit:[{id:'AUD-F5-SEED',action:'SEED',resourceType:'DETAINEE',resourceId:'DET-F5-001',result:'SUCCESS',occurredAt:'2026-09-22T00:00:00.000Z'}],
  qr:{
    detainee:{
      'DET-F5-001':{token:'SYNTH-QR-DET-F5-001',status:'ACTIVE',issuedAt:'2026-09-22T00:00:00.000Z',expiresAt:null},
      'DET-F5-002':{token:'SYNTH-QR-DET-F5-002',status:'SUSPENDED',issuedAt:'2026-09-22T00:00:00.000Z',expiresAt:null}
    },
    room:{
      'ROOM-F5-001':{token:'SYNTH-QR-ROOM-F5-001',status:'ACTIVE',issuedAt:'2026-09-22T00:00:00.000Z',expiresAt:null},
      'ROOM-F5-002':{token:'SYNTH-QR-ROOM-F5-002',status:'ACTIVE',issuedAt:'2026-09-22T00:00:00.000Z',expiresAt:null},
      'ROOM-F5-X':{token:'SYNTH-QR-ROOM-F5-X',status:'SUSPENDED',issuedAt:'2026-09-22T00:00:00.000Z',expiresAt:null}
    },
    leave:{}
  },
  lastMutation:null
};
class LS{constructor(v){this.v=new Map([['mta-deteni-demo-v2',JSON.stringify(v)]])}getItem(k){return this.v.get(k)||null}setItem(k,v){this.v.set(k,String(v))}}
const localStorage=new LS(state),listeners=new Map();
const window={addEventListener(t,f){listeners.set(t,f)},dispatchEvent(e){listeners.get(e.type)?.(e);return true}};
const document={readyState:'loading',getElementById:id=>({id,innerHTML:'',style:{},classList:{toggle(){}}}),querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},createElement:()=>({dataset:{},setAttribute(){},appendChild(){}}),head:{appendChild(){}}};
const context={window,document,localStorage,console,Date,Math,JSON,Map,Set,Array,Object,String,Number,Boolean,RegExp,Promise,structuredClone,CustomEvent:class CustomEvent{constructor(type,init={}){this.type=type;Object.assign(this,init)}},setTimeout,clearTimeout};
context.globalThis=context; context.db=structuredClone(state); context.KEY='mta-deteni-demo-v2';
context.save=function save(){localStorage.setItem(KEY,JSON.stringify(db));window.dispatchEvent(new CustomEvent('mta:data-changed'))};
context.window.mtaQrCameraV2={open(){},close(){}};
context.window.MTAQrContext={verify(x){if(x.context!==x.expectedContext)return{outcome:'CONTEXT_MISMATCH'};if(x.expiresAt&&Date.parse(x.expiresAt)<=Date.now())return{outcome:'EXPIRED'};if(x.issuedAt&&Date.parse(x.issuedAt)>Date.now())return{outcome:'FUTURE'};return{outcome:'ACCEPTED'}}};
context.window.MTADeteniOfflineQueue={}; context.window.p9refreshRooms=()=>{}; context.window.p6printQR=()=>{}; context.window.p9addRoom=()=>{}; context.window.documents=()=>{}; context.window.mtaUnifiedAction=()=>{};
context.window.buildReportEvidence=r=>r.evidence;
context.validateReportEvidence=function validateReportEvidence(r){const e=r?.evidence;if(!e||!Array.isArray(e.sourceRecords)||!Array.isArray(e.auditIds))throw Error('REPORT_EVIDENCE_REQUIRED');for(const s of e.sourceRecords){const a={DETAINEE:db.detainees,MOVEMENT:db.movements,LEAVE:db.leaves,PLACEMENT:db.placements,ROOM:db.rooms}[s.type];if(!(a||[]).some(v=>v?.id===s.id))throw Error('REPORT_SOURCE_MISSING:'+s.type+':'+s.id)}return true};
context.window.validateReportEvidence=context.validateReportEvidence;
vm.createContext(context); vm.runInContext(source,context,{filename:'web/mta-unified-shell-v2.js'});
if(typeof context.window.mtaUnifiedFinalIntegrityGate!=='function')throw Error('FINAL_GATE_NOT_EXPOSED');
const result=context.window.mtaUnifiedFinalIntegrityGate();
const evidence={version:'F5.4',certification:'DIRECT_FINAL_INTEGRITY_CERTIFICATION',executionId:process.env.GITHUB_RUN_ID??'local',commitSha:process.env.GITHUB_SHA??'local',syntheticOnly:true,productionAccessAuthorized:false,migrationExecuted:false,aiEnabled:false,finalGate:result};
fs.mkdirSync('artifacts/mta-evidence',{recursive:true});
fs.writeFileSync('artifacts/mta-evidence/f5-final-integrity-certification.json',JSON.stringify(evidence,null,2)+'\n');
if(result.status!=='PASS'||result.ok!==true){console.error(JSON.stringify(result,null,2));process.exit(1)}
console.log('F5_FINAL_INTEGRITY_CERTIFICATION=PASS');
console.log('FINAL_INTEGRITY=PASS');
