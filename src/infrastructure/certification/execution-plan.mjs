export const EXECUTION_PLAN_VERSION='P10.437-444-v1';
export function createExecutionPlan(input){
 for(const k of ['boundaryReady','requestId','correlationId','command','resourceType','resourceId'])if(typeof input[k]!=='string'&&input[k]!==true)throw new Error('EXECUTION_PLAN_FIELD_REQUIRED:'+k);
 if(input.boundaryReady!==true)throw new Error('EXECUTION_PLAN_DENIED:boundaryReady');
 return Object.freeze({version:EXECUTION_PLAN_VERSION,requestId:input.requestId,correlationId:input.correlationId,command:input.command,resourceType:input.resourceType,resourceId:input.resourceId,steps:['authorize','begin_transaction','execute_domain_command','write_audit','publish_outbox','commit','emit_evidence'],executionAuthorized:false,productionMutation:false,externalTransport:false});
}