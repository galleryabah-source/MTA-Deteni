export const RUNTIME_KERNEL_COMPOSITION_VERSION='P9.14-v1';
export function composeRuntimeKernel(input){
 const required=['authContext','authorizationDecision','databaseAdapter','transactionRunner','idempotencyStore','outbox','storagePolicy','observability'];
 for(const k of required)if(!input?.[k])throw new Error('RUNTIME_KERNEL_COMPONENT_REQUIRED:'+k);
 if(input.authContext.status!=='ACTIVE')throw new Error('RUNTIME_KERNEL_AUTH_INACTIVE');
 if(input.authorizationDecision.allowed!==true)throw new Error('RUNTIME_KERNEL_AUTHZ_DENIED');
 return Object.freeze({version:RUNTIME_KERNEL_COMPOSITION_VERSION,components:Object.freeze([...required]),ready:true,productionMutation:false,externalTransport:false});
}