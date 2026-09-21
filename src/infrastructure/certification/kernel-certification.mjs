export const KERNEL_CERTIFICATION_VERSION='P9.13-IMPLEMENTATION-v1';
export function certifyKernel(input){
 for(const k of ['configContract','authContract','authzContract','auditContract','databaseAdapter','transactionIdempotency','outbox','privateStorage','observability','testHarness','ciGate'])if(input?.[k]!==true)throw new Error('KERNEL_CERTIFICATION_MISSING:'+k);
 if(input.migrationFreeze!==true)throw new Error('KERNEL_CERTIFICATION_MIGRATION_FREEZE_REQUIRED');
 if(input.aiEnabled!==false)throw new Error('KERNEL_CERTIFICATION_AI_MUST_BE_DISABLED');
 if(input.productionMutationObserved===true)throw new Error('KERNEL_CERTIFICATION_PRODUCTION_MUTATION_FORBIDDEN');
 return Object.freeze({version:KERNEL_CERTIFICATION_VERSION,status:'CERTIFIED',productionMutation:false,aiEnabled:false,migrationFreeze:true,executionAuthorized:false});
}