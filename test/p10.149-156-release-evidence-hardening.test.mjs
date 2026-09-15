import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReleaseEvidenceManifest, assertReleaseEvidence } from '../src/runtime/release-evidence-manifest.mjs';

const base = { commitSha: 'abc123', checkpoint: 'P10.149', safety: { migrationFreeze: true, aiEnabled: false }, tests: [{ name: 'gate-a', status: 'PASS' }, { name: 'gate-b', status: 'PASS' }], files: [{ path: 'evidence/a.json', sha256: 'a'.repeat(64) }] };

test('P10.149: release evidence normalizes and preserves safe identity', () => {
  const manifest = buildReleaseEvidenceManifest(base);
  assert.equal(manifest.schemaVersion, 'MTA-EVIDENCE-V1');
  assert.deepEqual(manifest.safety, { migrationFreeze: true, aiEnabled: false });
  assert.equal(assertReleaseEvidence(manifest), true);
});

test('P10.150: duplicate test identities are rejected', () => {
  assert.throws(() => buildReleaseEvidenceManifest({ ...base, tests: [{ name: 'same', status: 'PASS' }, { name: 'same', status: 'PASS' }] }), /EVIDENCE_DUPLICATE_TEST/);
});

test('P10.151: duplicate evidence files are rejected', () => {
  assert.throws(() => buildReleaseEvidenceManifest({ ...base, files: [{ path: 'same', sha256: 'a' }, { path: 'same', sha256: 'b' }] }), /EVIDENCE_DUPLICATE_FILE/);
});

test('P10.152: unsafe manifest cannot be asserted', () => {
  const manifest = buildReleaseEvidenceManifest(base);
  assert.throws(() => assertReleaseEvidence({ ...manifest, safety: { migrationFreeze: false, aiEnabled: false } }), /EVIDENCE_SAFETY_GATE_FAILED/);
});

test('P10.153: schema downgrade or replacement is rejected', () => {
  const manifest = buildReleaseEvidenceManifest(base);
  assert.throws(() => assertReleaseEvidence({ ...manifest, schemaVersion: 'OLD' }), /EVIDENCE_SCHEMA_UNSUPPORTED/);
});

test('P10.154: input arrays are defensively copied', () => {
  const tests = [{ name: 'a', status: 'PASS' }];
  const files = [{ path: 'x', sha256: 'a' }];
  const manifest = buildReleaseEvidenceManifest({ ...base, tests, files });
  tests[0].status = 'FAIL';
  files[0].sha256 = 'tampered';
  assert.equal(manifest.tests[0].status, 'PASS');
  assert.equal(manifest.files[0].sha256, 'a');
});

test('P10.155: audit evidence is defensively copied and validated', () => {
  const auditEvidence = { eventCount: 2, headHash: 'b'.repeat(64) };
  const manifest = buildReleaseEvidenceManifest({ ...base, auditEvidence });
  auditEvidence.eventCount = 999;
  assert.equal(manifest.auditEvidence.eventCount, 2);
  assert.equal(assertReleaseEvidence(manifest), true);
});

test('P10.156: manifest tampering remains detectable after hardening', () => {
  const manifest = buildReleaseEvidenceManifest(base);
  assert.throws(() => assertReleaseEvidence({ ...manifest, files: [{ path: 'evidence/a.json', sha256: 'c'.repeat(64) }] }), /EVIDENCE_MANIFEST_TAMPERED/);
});
