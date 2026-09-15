import { createHash } from 'node:crypto';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');

export function buildReleaseEvidenceManifest({ commitSha, checkpoint, safety, tests, files = [] } = {}) {
  if (!commitSha || !checkpoint) throw new Error('EVIDENCE_IDENTITY_REQUIRED');
  if (safety?.migrationFreeze !== true || safety?.aiEnabled !== false) throw new Error('EVIDENCE_SAFETY_GATE_FAILED');
  if (!Array.isArray(tests) || tests.length === 0 || tests.some((t) => t?.status !== 'PASS')) throw new Error('EVIDENCE_TEST_GATE_FAILED');
  if (!Array.isArray(files) || files.some((f) => !f?.path || !f?.sha256)) throw new Error('EVIDENCE_FILE_DIGEST_REQUIRED');

  const payload = { schemaVersion: 'MTA-EVIDENCE-V1', commitSha, checkpoint, safety, tests, files };
  const canonical = JSON.stringify(payload);
  return Object.freeze({ ...payload, manifestSha256: sha256(canonical) });
}

export function assertReleaseEvidence(manifest) {
  if (!manifest?.manifestSha256) throw new Error('EVIDENCE_MANIFEST_UNSIGNED');
  const { manifestSha256, ...payload } = manifest;
  if (sha256(JSON.stringify(payload)) !== manifestSha256) throw new Error('EVIDENCE_MANIFEST_TAMPERED');
  return true;
}
