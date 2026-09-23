import test from 'node:test';
import assert from 'node:assert/strict';
import {certifyKernel} from '../src/infrastructure/certification/kernel-certification.mjs';

const complete={configContract:true,authContract:true,authzContract:true,auditContract:true,databaseAdapter:true,transactionIdempotency:true,outbox:true,privateStorage:true,observability:true,testHarness:true,ciGate:true,migrationFreeze:true,aiEnabled:false,productionMutationObserved:false};

test('P9.13 certifies only complete evidence under safety boundary',()=>assert.equal(certifyKernel(complete).status,'CERTIFIED'));
test('P9.13 denies missing evidence',()=>assert.throws(()=>certifyKernel({...complete,ciGate:false}),/KERNEL_CERTIFICATION_MISSING:ciGate/));
test('P9.13 requires migration freeze',()=>assert.throws(()=>certifyKernel({...complete,migrationFreeze:false}),/KERNEL_CERTIFICATION_MIGRATION_FREEZE_REQUIRED/));
test('P9.13 requires AI disabled',()=>assert.throws(()=>certifyKernel({...complete,aiEnabled:true}),/KERNEL_CERTIFICATION_AI_MUST_BE_DISABLED/));
test('P9.13 rejects observed production mutation',()=>assert.throws(()=>certifyKernel({...complete,productionMutationObserved:true}),/KERNEL_CERTIFICATION_PRODUCTION_MUTATION_FORBIDDEN/));
