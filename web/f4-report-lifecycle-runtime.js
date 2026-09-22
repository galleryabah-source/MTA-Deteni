(()=>{
const VERSION='F4-DGR-LIFECYCLE-v1';
const STATUS=Object.freeze({DRAFT:'DRAFT',VALIDATED:'VALIDATED',GENERATED:'GENERATED',IN_REVIEW:'IN_REVIEW',CHANGES_REQUESTED:'CHANGES_REQUESTED',APPROVED:'APPROVED',FINAL:'FINAL'});
const ACTIONS=Object.freeze({'DRAFT>VALIDATED':'VALIDATE','VALIDATED>GENERATED':'GENERATE','GENERATED>IN_REVIEW':'START_REVIEW','IN_REVIEW>APPROVED':'APPROVE','IN_REVIEW>CHANGES_REQUESTED':'REQUEST_CHANGES','CHANGES_REQUESTED>DRAFT':'REVISE','APPROVED>FINAL':'FINALIZE'});
const actor={actorId:'DEMO-OPERATOR',role:'OPERATOR'};
const text=v=>String(v??'').trim();
const req=v=>{const x=text(v);if(!x)throw new Error('F4_REQUIRED');return x};
const ctx=()=>({occurredAt:new Date().toISOString(),correlationId:'COR-'+crypto.randomUUID(),requestId:'REQ-'+crypto.randomUUID(),actor});
const event=(report,action,from,to,c)=>({id:'F4EV-'+report.reportId+'-'+action+'-'+c.requestId,action,from,to,actor,occurredAt:c.occurredAt,correlationId:c.correlationId,requestId:c.requestId});
const transition=(report,to,reason)=>{const allowed={DRAFT:['VALIDATED'],VALIDATED:['GENERATED'],GENERATED:['IN_REVIEW'],IN_REVIEW:['APPROVED','CHANGES_REQUESTED'],CHANGES_REQUESTED:['DRAFT'],APPROVED:['FINAL'],FINAL:[]};if(!allowed[report.status]?.includes(to))throw new Error('F4_INVALID_TRANSITION');if(report.status==='FINAL')throw new Error('F4_FINAL_IMMUTABLE');const c=ctx();const action=ACTIONS[report.status+'>'+to];const ev=event(report,action,report.status,to,c);let revision=report.revision;if(to==='DRAFT'&&report.status==='CHANGES_REQUESTED'){revision={revisionId:'REV-'+String(report.events.filter(e=>e.action==='REVISE').length+2).padStart(3,'0'),parentRevisionId:report.revision.revisionId,createdAt:c.occurredAt,reason:req(reason)}};return {...report,status:to,revision,events:[...report.events,ev]}};
const create=(reportId)=>{const c=ctx();const report={version:VERSION,reportId:req(reportId),status:STATUS.DRAFT,revision:{revisionId:'REV-001',parentRevisionId:null,createdAt:c.occurredAt},events:[],integrityHash:null,finalArtifactId:null};report.events.push(event(report,'CREATE',null,STATUS.DRAFT,c));return report};
const canonical=o=>JSON.stringify(o,Object.keys(o).sort());
const sha256=async value=>{const bytes=new TextEncoder().encode(value);const hash=await crypto.subtle.digest('SHA-256',bytes);return 'sha256:'+Array.from(new Uint8Array(hash)).map(x=>x.toString(16).padStart(2,'0')).join('')};
async function integrity(report,snapshot){return sha256(canonical({version:VERSION,reportId:report.reportId,revision:report.revision,snapshot}))}
function validate(report){if(report.version!==VERSION||!report.events.length||report.events[0].action!=='CREATE')throw new Error('F4_LIFECYCLE_INVALID');let p=report.events[0];for(const e of report.events.slice(1)){if(e.from!==p.to)throw new Error('F4_EVENT_CHAIN_BROKEN');p=e}if(report.status==='FINAL'&&(!report.integrityHash||!report.finalArtifactId))throw new Error('F4_FINAL_ARTIFACT_INCOMPLETE');return true}
window.MTAF4Lifecycle={VERSION,STATUS,create,transition,integrity,validate,ctx,actor};
})();