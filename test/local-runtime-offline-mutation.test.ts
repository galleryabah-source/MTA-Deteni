import test from 'node:test';
import assert from 'node:assert/strict';
import { LocalRuntimeOfflineMutationQueue } from '../src/application/local-runtime-offline-mutation-queue.js';
import type { OfflineMutation } from '../src/application/local-runtime-offline-mutation-contract.js';
import { assertOfflineSyncBatch, orderOfflineSyncMutations } from '../src/application/local-runtime-offline-sync-contract.js';
import { createOfflineConflictResolution } from '../src/application/local-runtime-conflict-resolution-contract.js';

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

test('applied receipt preserves resulting version',()=>{
  const q=new LocalRuntimeOfflineMutationQueue(); q.enqueue(mutation({idempotencyKey:'IDEMP-003'}));
  const receipt=q.markApplied('IDEMP-003','v2','2026-09-17T00:00:00.000Z');
  assert.equal(receipt.resultingVersion,'v2'); assert.equal(receipt.effectApplied,true);
  assert.equal(q.getReceipt('IDEMP-003')?.resultingVersion,'v2');
});

test('sync batch preserves supplied mutation order',()=>{
  const mutations=[mutation(),mutation({mutationId:'MUT-002',idempotencyKey:'IDEMP-002'})];
  const batch={syncId:'SYNC-001',deviceId:'DEVICE-001',cursor:'c0',sequenceStart:1,mutations,syntheticOnly:true as const};
  assert.doesNotThrow(()=>assertOfflineSyncBatch(batch));
  assert.deepEqual(orderOfflineSyncMutations(mutations),mutations);
});

test('conflict resolution requires reviewer and audit evidence',()=>{
  const resolution=createOfflineConflictResolution({conflictId:'CONFLICT-001',mutationId:'MUT-003',idempotencyKey:'IDEMP-003',aggregateType:'DETAINEE',aggregateId:'DET-001',baseVersion:'v1',currentVersion:'v2',action:'ACCEPT_REMOTE',reviewerId:'REVIEWER-001',rationale:'Remote version is the authoritative current state.',resolvedVersion:'v2',resolvedAt:'2026-09-17T00:00:00.000Z',auditEventId:'AUDIT-001'});
  assert.equal(resolution.syntheticOnly,true); assert.equal(resolution.action,'ACCEPT_REMOTE');
});
