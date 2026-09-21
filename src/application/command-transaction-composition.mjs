export const COMMAND_TRANSACTION_VERSION='P9.16-v1';
export async function executeCommand(input){
 for(const k of ['kernel','command','requestId','idempotencyKey'])if(!input?.[k])throw new Error('COMMAND_EXECUTION_FIELD_REQUIRED:'+k);
 const {kernel}=input;
 const idem=kernel.idempotencyStore.begin(input.idempotencyKey,input.requestHash||'');
 if(idem.status==='REPLAY')return {status:'REPLAY',responseHash:idem.responseHash};
 if(idem.status!=='ACQUIRED')throw new Error('COMMAND_IDEMPOTENCY_NOT_ACQUIRED');
 if(kernel.authorizationDecision?.allowed!==true)throw new Error('COMMAND_AUTHZ_DENIED');
 let response;
 try{response=await kernel.transactionRunner.transaction(async tx=>{const result=await input.command(tx);if(kernel.audit?.record)await kernel.audit.record({requestId:input.requestId,transactionId:tx.transactionId,result:'SUCCESS'});return result});kernel.idempotencyStore.complete(input.idempotencyKey,input.responseHash||'PENDING');return {status:'COMPLETED',response}}catch(error){throw error}
}