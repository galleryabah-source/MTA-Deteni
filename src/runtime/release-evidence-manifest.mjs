import { createHash } from 'node:crypto';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');

export function buildReleaseEvidenceManifest({ commitSha, checkpoint, safety, tests, files = [], auditEvidence = null } = {}) {
  if (!commitSha || !checkpoint) throw new Error('EVIDENCE_IDENTITY_REQUIRED');
  if (safety?.migrationFreeze !== true || safety?.aiEnabled !== false) throw new Error('EVIDENCE_SAFETY_GATE_FAILED');
  if (!Array.isArray(tests) || tests.length === 0 || tests.some((t) => t?.status !== 'PASS')) throw new Error('EVIDENCE_TEST_GATE_FAILED');
  if (!Array.isArray(files) || files.some((f) => !f?.path || !f?.sha256)) throw new Error('EVIDENCE_FILE_DIGEST_REQUIRED');
  if (auditEvidence !== null && (!Number.isInteger(auditEvidence.eventCount) || auditEvidence.eventCount < 0 || (auditEvidence.eventCount > 0 && !auditEvidence.headHash))) throw new Error('EVIDENCE_AUDIT_ANCHOR_INVALID');
  const payload = { schemaVersion: 'MTA-EVIDENCE-V1', commitSha, checkpoint, safety, tests, files, auditEvidence };
  return Object.freeze({ ...payload, manifestSha256: sha256(JSON.stringify(payload)) });
}

export function assertReleaseEvidence(manifest) {
  if (!manifest?.manifestSha256) throw new Error('EVIDENCE_MANIFEST_UNSIGNED');
  const { manifestSha256, ...payload } = manifest;
  if (payload.auditEvidence !== null && (!Number.isInteger(payload.auditEvidence?.eventCount) || payload.auditEvidence.eventCount < 0 || (payload.auditEvidence.eventCount > 0 && !payload.auditEvidence.headHash))) throw new Error('EVIDENCE_AUDIT_ANCHOR_INVALID');
  if (sha256(JSON.stringify(payload)) !== manifestSha256) throw new Error('EVIDENCE_MANIFEST_TAMPERED');
  return true;
}
