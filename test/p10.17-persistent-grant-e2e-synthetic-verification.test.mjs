import test from 'node:test';
import assert from 'node:assert/strict';
import { createArtifactHandoff, consumeArtifactHandoff, revokeArtifactHandoff } from '../src/domain/artifact-handoff.mjs';
import { issuePersistentArtifactGrant } from '../src/runtime/persistent-artifact-grant-transaction.mjs';

const grant = {
  grantId: 'grant-syn-001', documentId: 'doc-syn-001', artifactId: 'artifact-syn-001', artifactSha256: 'a'.repeat(64),
  objectId: 'object-syn-001', actorId: 'actor-syn-001', scopeId: 'scope-syn-001',
  issuedAt: '2026-09-15T10:00:00.000Z', expiresAt: '2026-09-15T10:01:00.000Z',
};

function fakeDb() {
  const calls = [];
  return { calls, async transaction(fn) { const client = { id: 'tx-syn-001', async query() { return { rowCount: 1 }; } }; const result = await fn(client); calls.push(client.id); return result; } };
}

test('P10.17 synthetic handoff consumes exactly once', () => {
  const document = { documentId: grant.documentId, state: 'ISSUED', artifactId: grant.artifactId, artifactSha256: grant.artifactSha256 };
  const handoff = createArtifactHandoff({ document, objectId: grant.objectId, actorId: grant.actorId, scopeId: grant.scopeId, now: new Date(grant.issuedAt), ttlMs: 60_000 });
  const consumed = consumeArtifactHandoff(handoff, { actorId: grant.actorId, scopeId: grant.scopeId, objectId: grant.objectId, now: new Date('2026-09-15T10:00:30.000Z') });
  assert.equal(consumed.status, 'CONSUMED');
  assert.throws(() => consumeArtifactHandoff(consumed, { actorId: grant.actorId, scopeId: grant.scopeId, objectId: grant.objectId, now: new Date('2026-09-15T10:00:31.000Z') }), /not active/);
});

test('P10.17 wrong context, expiry and revoke fail closed', () => {
  const document = { documentId: grant.documentId, state: 'ISSUED', artifactId: grant.artifactId, artifactSha256: grant.artifactSha256 };
  const handoff = createArtifactHandoff({ document, objectId: grant.objectId, actorId: grant.actorId, scopeId: grant.scopeId, now: new Date(grant.issuedAt), ttlMs: 60_000 });
  assert.throws(() => consumeArtifactHandoff(handoff, { actorId: 'actor-other', scopeId: grant.scopeId, objectId: grant.objectId, now: new Date('2026-09-15T10:00:30.000Z') }), /Actor/);
  assert.throws(() => consumeArtifactHandoff(handoff, { actorId: grant.actorId, scopeId: 'scope-other', objectId: grant.objectId, now: new Date('2026-09-15T10:00:30.000Z') }), /Scope/);
  assert.throws(() => consumeArtifactHandoff(handoff, { actorId: grant.actorId, scopeId: grant.scopeId, objectId: grant.objectId, now: new Date('2026-09-15T10:01:00.000Z') }), /expired/);
  const revoked = revokeArtifactHandoff(handoff, { actorId: grant.actorId, scopeId: grant.scopeId, now: new Date('2026-09-15T10:00:20.000Z') });
  assert.equal(revoked.status, 'REVOKED');
  assert.throws(() => consumeArtifactHandoff(revoked, { actorId: grant.actorId, scopeId: grant.scopeId, objectId: grant.objectId }), /not active/);
});

test('P10.17 transaction orchestration keeps grant/audit/outbox on one client and has no provider boundary', async () => {
  const db = fakeDb();
  const seen = [];
  const result = await issuePersistentArtifactGrant({
    db, grant,
    appendAudit: async (client) => seen.push(['audit', client.id]),
    enqueueOutbox: async (client) => seen.push(['outbox', client.id]),
  });
  assert.equal(result.grant.grantId, grant.grantId);
  assert.deepEqual(seen, [['audit', 'tx-syn-001'], ['outbox', 'tx-syn-001']]);
  assert.deepEqual(db.calls, ['tx-syn-001']);
});
