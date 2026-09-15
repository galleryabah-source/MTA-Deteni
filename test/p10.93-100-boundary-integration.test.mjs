import test from 'node:test';
import assert from 'node:assert/strict';
import { composeAuthenticatedCommand, assertAuthenticatedCommandOwnership } from '../src/application/authenticated-command-composer.mjs';
import { createSyntheticArtifactGrantBoundary } from '../src/runtime/synthetic-artifact-grant-boundary.mjs';
import { buildReleaseEvidenceManifest, assertReleaseEvidence } from '../src/runtime/release-evidence-manifest.mjs';
import { assertProviderAfterCommit, assertMigrationFreezePolicy } from '../src/application/temporary-exit-persistence-readiness.mjs';

test('P10.93 authenticated command derives authority from server principal', () => {
  const command = composeAuthenticatedCommand({
    principal: { actorId: 'A-1', scopeId: 'S-1', dutyId: 'D-1', classification: 'RESTRICTED' },
    input: { operation: 'REQUEST', actorId: 'A-1', scopeId: 'S-1', resourceId: 'E-1', idempotencyKey: ' K-1 ', payload: { x: 1 } },
  });
  assert.equal(command.actorId, 'A-1');
  assert.equal(command.scopeId, 'S-1');
  assert.equal(command.idempotencyKey, 'K-1');
});

test('P10.94 client authority mismatch is denied', () => {
  assert.throws(() => composeAuthenticatedCommand({ principal: { actorId: 'A', scopeId: 'S' }, input: { operation: 'X', actorId: 'ATTACKER', idempotencyKey: 'K' } }), /CLIENT_ACTOR_MISMATCH/);
  assert.throws(() => composeAuthenticatedCommand({ principal: { actorId: 'A', scopeId: 'S' }, input: { operation: 'X', scopeId: 'OTHER', idempotencyKey: 'K' } }), /CLIENT_SCOPE_MISMATCH/);
});

test('P10.95 artifact grant stores only token hash and binds actor/scope', () => {
  let clock = 1000;
  const boundary = createSyntheticArtifactGrantBoundary({ now: () => clock });
  const issued = boundary.issue({ artifactId: 'DOC-1', actorId: 'A', scopeId: 'S', ttlMs: 100 });
  assert.equal(typeof boundary.get(issued.grantId).tokenHash, 'string');
  assert.equal(boundary.get(issued.grantId).tokenHash.includes(issued.token), false);
  assert.throws(() => boundary.consume({ ...issued, actorId: 'OTHER', scopeId: 'S' }), /GRANT_SCOPE_DENIED/);
  assert.deepEqual(boundary.consume({ ...issued, actorId: 'A', scopeId: 'S' }).artifactId, 'DOC-1');
  assert.throws(() => boundary.consume({ ...issued, actorId: 'A', scopeId: 'S' }), /GRANT_ALREADY_CONSUMED/);
  clock = 2000;
  assert.throws(() => boundary.issue({ artifactId: 'DOC-2', actorId: 'A', scopeId: 'S', ttlMs: 0 }), /GRANT_TTL_INVALID/);
});

test('P10.96 artifact grant expiry and revocation are fail-closed', () => {
  let clock = 5000;
  const boundary = createSyntheticArtifactGrantBoundary({ now: () => clock });
  const expiring = boundary.issue({ artifactId: 'DOC-E', actorId: 'A', scopeId: 'S', ttlMs: 10 });
  clock = 5010;
  assert.throws(() => boundary.consume({ ...expiring, actorId: 'A', scopeId: 'S' }), /GRANT_EXPIRED/);
  const revoked = boundary.issue({ artifactId: 'DOC-R', actorId: 'A', scopeId: 'S' });
  boundary.revoke({ grantId: revoked.grantId, actorId: 'A', scopeId: 'S' });
  assert.throws(() => boundary.consume({ ...revoked, actorId: 'A', scopeId: 'S' }), /GRANT_REVOKED/);
});

test('P10.97 provider guard requires an observed commit', () => {
  assert.throws(() => assertProviderAfterCommit({ transactionCommitted: false, provider: 'WHATSAPP' }), /PROVIDER_REQUIRES_COMMITTED_TRANSACTION/);
  assert.equal(assertProviderAfterCommit({ transactionCommitted: true, provider: 'WHATSAPP' }), true);
});

test('P10.98 release evidence binds safety, tests and file digests', () => {
  const manifest = buildReleaseEvidenceManifest({
    commitSha: 'abc123', checkpoint: 'P10.98',
    safety: { migrationFreeze: true, aiEnabled: false },
    tests: [{ name: 'boundary', status: 'PASS' }],
    files: [{ path: 'test/x.mjs', sha256: 'deadbeef' }],
  });
  assert.equal(assertReleaseEvidence(manifest), true);
  assert.throws(() => assertReleaseEvidence({ ...manifest, checkpoint: 'TAMPERED' }), /EVIDENCE_MANIFEST_TAMPERED/);
});

test('P10.99 evidence cannot be promoted with unsafe release state', () => {
  assert.throws(() => buildReleaseEvidenceManifest({ commitSha: 'abc', checkpoint: 'P10.99', safety: { migrationFreeze: false, aiEnabled: false }, tests: [{ status: 'PASS' }], files: [] }), /EVIDENCE_SAFETY_GATE_FAILED/);
  assert.throws(() => buildReleaseEvidenceManifest({ commitSha: 'abc', checkpoint: 'P10.99', safety: { migrationFreeze: true, aiEnabled: false }, tests: [{ status: 'FAIL' }], files: [] }), /EVIDENCE_TEST_GATE_FAILED/);
});

test('P10.100 migration freeze blocks schema change but not ordinary command policy', () => {
  assert.throws(() => assertMigrationFreezePolicy({ migrationFreeze: true, operation: 'SCHEMA_CHANGE' }), /MIGRATION_FREEZE_BLOCKS_SCHEMA_CHANGE/);
  assert.equal(assertMigrationFreezePolicy({ migrationFreeze: true, operation: 'RUNTIME_COMMAND' }), true);
});
