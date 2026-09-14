import test from 'node:test';
import assert from 'node:assert/strict';
import { createArtifactHandoff, consumeArtifactHandoff, revokeArtifactHandoff, verifyArtifactBinding } from '../src/domain/artifact-handoff.mjs';

const document = {
  documentId: 'doc-syn-001',
  state: 'ISSUED',
  artifactId: 'docx-syn-001',
  artifactSha256: 'a'.repeat(64),
};
const base = { document, objectId: 'private/mta/docx-syn-001', actorId: 'actor-kamtib', scopeId: 'scope-rudenim-01' };

test('issued document creates a scoped single-use grant', () => {
  const grant = createArtifactHandoff({ ...base, now: '2026-09-14T10:00:00.000Z', ttlMs: 300000 });
  assert.equal(grant.status, 'ACTIVE');
  assert.equal(grant.singleUse, true);
  assert.equal(grant.expiresAt, '2026-09-14T10:05:00.000Z');
  assert.equal(verifyArtifactBinding(grant, document), true);
});

test('consume enforces actor, scope, object and expiry, then prevents replay', () => {
  const grant = createArtifactHandoff({ ...base, now: '2026-09-14T10:00:00.000Z' });
  const consumed = consumeArtifactHandoff(grant, { actorId: base.actorId, scopeId: base.scopeId, objectId: base.objectId, now: '2026-09-14T10:01:00.000Z' });
  assert.equal(consumed.status, 'CONSUMED');
  assert.throws(() => consumeArtifactHandoff(consumed, { actorId: base.actorId, scopeId: base.scopeId, objectId: base.objectId, now: '2026-09-14T10:01:01.000Z' }), /not active/);
  assert.throws(() => consumeArtifactHandoff(grant, { actorId: 'other', scopeId: base.scopeId, objectId: base.objectId, now: '2026-09-14T10:01:00.000Z' }), /Actor/);
  assert.throws(() => consumeArtifactHandoff(grant, { actorId: base.actorId, scopeId: 'other-scope', objectId: base.objectId, now: '2026-09-14T10:01:00.000Z' }), /Scope/);
  assert.throws(() => consumeArtifactHandoff(grant, { actorId: base.actorId, scopeId: base.scopeId, objectId: 'other-object', now: '2026-09-14T10:01:00.000Z' }), /Object/);
});

test('expired and revoked grants fail closed', () => {
  const expired = createArtifactHandoff({ ...base, now: '2026-09-14T10:00:00.000Z', ttlMs: 1000 });
  assert.throws(() => consumeArtifactHandoff(expired, { actorId: base.actorId, scopeId: base.scopeId, objectId: base.objectId, now: '2026-09-14T10:00:01.000Z' }), /expired/);
  const active = createArtifactHandoff({ ...base, now: '2026-09-14T10:00:00.000Z' });
  const revoked = revokeArtifactHandoff(active, { actorId: base.actorId, scopeId: base.scopeId, now: '2026-09-14T10:00:30.000Z' });
  assert.equal(revoked.status, 'REVOKED');
  assert.throws(() => consumeArtifactHandoff(revoked, { actorId: base.actorId, scopeId: base.scopeId, objectId: base.objectId, now: '2026-09-14T10:00:31.000Z' }), /not active/);
});

test('non-issued document cannot create a download grant', () => {
  assert.throws(() => createArtifactHandoff({ ...base, document: { ...document, state: 'APPROVED' } }), /ISSUED/);
});
