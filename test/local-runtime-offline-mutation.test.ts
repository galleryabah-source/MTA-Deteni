import test from 'node:test';
import assert from 'node:assert/strict';
import { LocalRuntimeOfflineMutationQueue } from '../src/application/local-runtime-offline-mutation-queue.js';
import type { OfflineMutation } from '../src/application/local-runtime-offline-mutation-contract.js';

const mutation=(overrides: Partial<OfflineMutation> = {}): OfflineMutation => ({
  mutationId:'MUT-001', idempotencyKey:'IDEMP-001', aggregateType:'DETAINEE', aggregateId:'DET-001', operation:'UPDATE_STATUS', payload:{status:'ACTIVE'}, baseVersion:'v1', payloadFingerprint:'fp-1', status:'QUEUED', createdAt:new Date(0).toISOString(), syntheticOnly:true, ...overrides,
});

test('identical idempotency replay has no second effect',()=>{
  const q=new LocalRuntimeOfflineMutationQueue(); const m=mutation(); q.enqueue(m);
  const result=q.admit(m,'v1');
  assert.equal(result.status,'REPLAYED'); assert.equal(result.effectApplied,false);
});

test('same idempotency key with different fingerprint is rejected',()=>{
  const q=new LocalRuntimeOfflineMutationQueue(); q.enqueue(mutation());
  assert.throws(()=>q.enqueue(mutation({mutationId:'MUT-002',payloadFingerprint:'fp-2'})),/different fingerprint/);
});

test('base version mismatch becomes review conflict',()=>{
  const q=new LocalRuntimeOfflineMutationQueue(); const m=mutation({idempotencyKey:'IDEMP-002'});
  const result=q.admit(m,'v2');
  assert.equal(result.status,'CONFLICT'); assert.equal(result.reasonCode,'BASE_VERSION_CONFLICT'); assert.equal(result.effectApplied,false);
});
