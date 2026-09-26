import fs from "node:fs";
const app=JSON.parse(fs.readFileSync("artifacts/application/e2e-application-journey.json","utf8"));
if(app.certification!=="E2E-APPLICATION-JOURNEY-v1"||app.syntheticOnly!==true||app.productionAccessAuthorized!==false||app.migrationExecuted!==false||app.aiEnabled!==false) throw new Error("APPLICATION_E2E_GOVERNANCE_INVALID");
for(const [stage,status] of Object.entries(app.stages)) if(status!=="PASS") throw new Error("APPLICATION_E2E_STAGE_NOT_PASS:"+stage);

const expected=new Set(["phone","tablet","desktop","desktop-hd"]);
const files=fs.readdirSync("artifacts/browser").filter(x=>x.endsWith(".json"));
if(files.length!==4) throw new Error("BROWSER_E2E_VIEWPORT_COUNT_INVALID");
for(const file of files){
 const x=JSON.parse(fs.readFileSync("artifacts/browser/"+file,"utf8"));
 if(x.certification!=="E2E-BROWSER-JOURNEY-v1"||x.syntheticOnly!==true||x.productionAccessAuthorized!==false||x.migrationExecuted!==false||x.aiEnabled!==false) throw new Error("BROWSER_E2E_GOVERNANCE_INVALID:"+file);
 if(!expected.has(x.device)) throw new Error("BROWSER_E2E_DEVICE_INVALID:"+file);
 for(const [stage,status] of Object.entries(x.stages)) if(status!=="PASS") throw new Error("BROWSER_E2E_STAGE_NOT_PASS:"+file+":"+stage);
 if(!x.evidence?.movementId||!x.evidence?.placementId||!x.evidence?.leaveId||!x.evidence?.reportId) throw new Error("BROWSER_E2E_EVIDENCE_INCOMPLETE:"+file);
 if(!Array.isArray(x.evidence.sourceCorrelationIds)||x.evidence.sourceCorrelationIds.length<2) throw new Error("BROWSER_E2E_CORRELATION_LINEAGE_MISSING:"+file);
}
if(app.correlationId!==app.bindings.auditCorrelationId||app.correlationId!==app.bindings.outboxCorrelationId) throw new Error("APPLICATION_E2E_CORRELATION_DRIFT");
console.log("E2E_JOURNEY_CERTIFICATION=PASS");
console.log("APPLICATION_E2E=PASS");
console.log("BROWSER_E2E_4_VIEWPORTS=PASS");
console.log("GOVERNANCE_LOCKS=PASS");
