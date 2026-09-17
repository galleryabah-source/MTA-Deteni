import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyIdempotency } from '../src/application/local-runtime-idempotency-ledger-contract.js';
import { createOfflineConflictResolution } from '../src/application/local-runtime-conflict-resolution-contract.js';
import { createOfflineConflictRecord, transitionOfflineConflict } from '../src/application/local-runtime-conflict-state-machine.js';
import { createLanRuntimeHealth, assertLanRuntimeHealth } from '../src/application/local-runtime-lan-health-contract.js';

test('idempotency ledger blocks fingerprint conflict and replay effect',()=>{
  const entry={idempotencyKey:'I-1',mutationId:'M-1',payloadFingerprint:'FP-1',aggregateType:'DETAINEE',aggregateId:'D-1',status:'APPLIED' as const,recordedAt:'2026-09-17T00:00:00.000Z',syntheticOnly:true as const};
  assert.deepEqual(classifyIdempotency(entry,{idempotencyKey:'I-1',payloadFingerprint:'FP-1'}).status,'REPLAYED');
  assert.deepEqual(classifyIdempotency(entry,{idempotencyKey:'I-1',payloadFingerprint:'FP-2'}).status,'CONFLICT');
});

test('conflict state machine requires review before resolution',()=>{
  const record=createOfflineConflictRecord({conflictId:'C-1',mutationId:'M-1',baseVersion:'v1',currentVersion:'v2'});
  const reviewed=transitionOfflineConflict(record,'UNDER_REVIEW');
  const resolution=createOfflineConflictResolution({conflictId:'C-1',mutationId:'M-1',idempotencyKey:'I-1',aggregateType:'DETAINEE',aggregateId:'D-1',baseVersion:'v1',currentVersion:'v2',action:'ACCEPT_REMOTE',reviewerId:'R-1',rationale:'Synthetic review evidence.',resolvedVersion:'v2',resolvedAt:'2026-09-17T00:00:00.000Z',auditEventId:'A-1'});
  assert.equal(transitionOfflineConflict(reviewed,'RESOLVED',resolution).state,'RESOLVED');
});

test('LAN health remains bounded to local network and deny-by-default',()=>{
  const health=createLanRuntimeHealth('LAN-1','LOCAL_POSTGRESQL_NONPRODUCTION_ONLY');
  assertLanRuntimeHealth(health);
  assert.equal(health.scope,'LOCAL_NETWORK_ONLY');
  assert.equal(health.authorization,'DENY_BY_DEFAULT');
});
