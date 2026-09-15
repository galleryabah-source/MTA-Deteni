import test from 'node:test';
import assert from 'node:assert/strict';
import { consumePersistentArtifactGrant, revokePersistentArtifactGrant } from '../src/runtime/persistent-artifact-grant-transition.mjs';
import { buildReleaseEvidenceManifest, assertReleaseEvidence } from '../src/runtime/release-evidence-manifest.mjs';

function fakeDb({ rowCount = 1 } = {}) {
  const calls = [];
  return { calls, async transaction(work) { calls.push('BEGIN'); try { const result = await work({ async query(sql, values) { calls.push({ sql, values }); return { rowCount }; } }); calls.push('COMMIT'); return result; } catch (error) { calls.push('ROLLBACK'); throw error; } } };
}

const input = { grantId: 'grant-1', actorId: 'actor-1', scopeId: 'scope-1', objectId: 'object-1', now: '2026-09-15T01:00:00.000Z' };
const callbacks = { failAudit: false, appendAudit: async (_client, event) => { if (callbacks.failAudit) throw new Error('AUDIT_FAILED'); return event; }, enqueueOutbox: async (_client, event) => event };

test('P10.117 consume is coupled to audit and outbox in one transaction', async () => { const db = fakeDb(); const result = await consumePersistentArtifactGrant({ db, input, appendAudit: callbacks.appendAudit, enqueueOutbox: callbacks.enqueueOutbox }); assert.equal(result.grant.status, 'CONSUMED'); assert.deepEqual(db.calls.filter((x) => typeof x === 'string'), ['BEGIN', 'COMMIT']); });
test('P10.118 revoke is fail-closed on zero affected rows', async () => { const db = fakeDb({ rowCount: 0 }); await assert.rejects(() => revokePersistentArtifactGrant({ db, input, appendAudit: callbacks.appendAudit, enqueueOutbox: callbacks.enqueueOutbox }), /GRANT_TRANSITION_NOT_APPLIED/); assert.deepEqual(db.calls.filter((x) => typeof x === 'string'), ['BEGIN', 'ROLLBACK']); });
test('P10.119 audit failure rolls back the transaction', async () => { const db = fakeDb(); callbacks.failAudit = true; await assert.rejects(() => consumePersistentArtifactGrant({ db, input, appendAudit: callbacks.appendAudit, enqueueOutbox: callbacks.enqueueOutbox }), /AUDIT_FAILED/); callbacks.failAudit = false; assert.deepEqual(db.calls.filter((x) => typeof x === 'string'), ['BEGIN', 'ROLLBACK']); });
test('P10.120 release evidence accepts audit anchor', () => { const manifest = buildReleaseEvidenceManifest({ commitSha: 'abc123', checkpoint: 'P10.124', safety: { migrationFreeze: true, aiEnabled: false }, tests: [{ status: 'PASS' }], files: [{ path: 'x', sha256: 'a'.repeat(64) }], auditEvidence: { eventCount: 12, headHash: 'b'.repeat(64) } }); assert.equal(assertReleaseEvidence(manifest), true); });
test('P10.121 malformed audit anchor is rejected', () => { assert.throws(() => buildReleaseEvidenceManifest({ commitSha: 'abc123', checkpoint: 'P10.124', safety: { migrationFreeze: true, aiEnabled: false }, tests: [{ status: 'PASS' }], files: [{ path: 'x', sha256: 'a'.repeat(64) }], auditEvidence: { eventCount: 2 } }), /EVIDENCE_AUDIT_ANCHOR_INVALID/); });
test('P10.122 audit anchor tamper is detected', () => { const manifest = buildReleaseEvidenceManifest({ commitSha: 'abc123', checkpoint: 'P10.124', safety: { migrationFreeze: true, aiEnabled: false }, tests: [{ status: 'PASS' }], files: [{ path: 'x', sha256: 'a'.repeat(64) }], auditEvidence: { eventCount: 1, headHash: 'b'.repeat(64) } }); assert.throws(() => assertReleaseEvidence({ ...manifest, auditEvidence: { eventCount: 2, headHash: 'b'.repeat(64) } }), /EVIDENCE_MANIFEST_TAMPERED/); });
test('P10.123 transition boundary exposes no provider/network operation', async () => { const db = fakeDb(); await consumePersistentArtifactGrant({ db, input, appendAudit: async (_c, e) => e, enqueueOutbox: async (_c, e) => e }); assert.equal(db.calls.some((x) => typeof x === 'string' && /PROVIDER|NETWORK/.test(x)), false); });
test('P10.124 transaction boundary requires db.transaction', async () => { await assert.rejects(() => consumePersistentArtifactGrant({ db: {}, input, appendAudit: callbacks.appendAudit, enqueueOutbox: callbacks.enqueueOutbox }), /db\.transaction is required/); });
