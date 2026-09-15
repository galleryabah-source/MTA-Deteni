import { createHash } from 'node:crypto';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const requiredString = (value, name) => { if (typeof value !== 'string' || !value.trim()) throw new Error(`${name}_REQUIRED`); return value.trim(); };
const unique = (values) => new Set(values).size === values.length;

function validateAuditEvidence(auditEvidence) {
  if (auditEvidence === null) return;
  if (!Number.isInteger(auditEvidence.eventCount) || auditEvidence.eventCount < 0) throw new Error('EVIDENCE_AUDIT_ANCHOR_INVALID');
  if (auditEvidence.eventCount > 0 && (!auditEvidence.headHash || typeof auditEvidence.headHash !== 'string')) throw new Error('EVIDENCE_AUDIT_ANCHOR_INVALID');
}

export function buildReleaseEvidenceManifest({ commitSha, checkpoint, safety, tests, files = [], auditEvidence = null } = {}) {
  requiredString(commitSha, 'EVIDENCE_COMMIT_SHA');
  requiredString(checkpoint, 'EVIDENCE_CHECKPOINT');
  if (safety?.migrationFreeze !== true || safety?.aiEnabled !== false) throw new Error('EVIDENCE_SAFETY_GATE_FAILED');
  if (!Array.isArray(tests) || tests.length === 0 || tests.some((t) => t?.status !== 'PASS')) throw new Error('EVIDENCE_TEST_GATE_FAILED');
  if (!Array.isArray(files) || files.some((f) => !f?.path || !f?.sha256)) throw new Error('EVIDENCE_FILE_DIGEST_REQUIRED');
  if (!unique(tests.map((t) => t.name).filter(Boolean))) throw new Error('EVIDENCE_DUPLICATE_TEST');
  if (!unique(files.map((f) => f.path))) throw new Error('EVIDENCE_DUPLICATE_FILE');
  validateAuditEvidence(auditEvidence);
  const payload = { schemaVersion: 'MTA-EVIDENCE-V1', commitSha: commitSha.trim(), checkpoint: checkpoint.trim(), safety: { migrationFreeze: true, aiEnabled: false }, tests: structuredClone(tests), files: structuredClone(files), auditEvidence: auditEvidence === null ? null : structuredClone(auditEvidence) };
  return Object.freeze({ ...payload, manifestSha256: sha256(JSON.stringify(payload)) });
}

export function assertReleaseEvidence(manifest) {
  if (!manifest?.manifestSha256) throw new Error('EVIDENCE_MANIFEST_UNSIGNED');
  if (manifest.schemaVersion !== 'MTA-EVIDENCE-V1') throw new Error('EVIDENCE_SCHEMA_UNSUPPORTED');
  requiredString(manifest.commitSha, 'EVIDENCE_COMMIT_SHA');
  requiredString(manifest.checkpoint, 'EVIDENCE_CHECKPOINT');
  if (manifest.safety?.migrationFreeze !== true || manifest.safety?.aiEnabled !== false) throw new Error('EVIDENCE_SAFETY_GATE_FAILED');
  if (!Array.isArray(manifest.tests) || manifest.tests.length === 0 || manifest.tests.some((t) => t?.status !== 'PASS')) throw new Error('EVIDENCE_TEST_GATE_FAILED');
  if (!unique(manifest.tests.map((t) => t?.name).filter(Boolean))) throw new Error('EVIDENCE_DUPLICATE_TEST');
  if (!Array.isArray(manifest.files) || manifest.files.some((f) => !f?.path || !f?.sha256)) throw new Error('EVIDENCE_FILE_DIGEST_REQUIRED');
  if (!unique(manifest.files.map((f) => f?.path))) throw new Error('EVIDENCE_DUPLICATE_FILE');
  validateAuditEvidence(manifest.auditEvidence ?? null);
  const { manifestSha256, ...payload } = manifest;
  if (sha256(JSON.stringify(payload)) !== manifestSha256) throw new Error('EVIDENCE_MANIFEST_TAMPERED');
  return true;
}
