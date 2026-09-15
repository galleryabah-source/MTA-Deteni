import { createHash } from 'node:crypto';

const REQUIRED_SCHEMA = 'MTA-NONPROD-EVIDENCE-V1';
const REQUIRED_PACKET_FIELDS = Object.freeze(['planId','approvalRef','targetRef','migrationArtifact','rlsPolicy','regressionEvidence','integrityEvidence','releaseManifest','rollbackPlan','independentReview']);
const requiredString = (value, name) => { if (typeof value !== 'string' || !value.trim()) throw new Error(`${name}_REQUIRED`); return value.trim(); };
const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const syntheticRef = (value, name) => { const ref = requiredString(value, name); if (!/^synthetic:[A-Za-z0-9._:-]+$/.test(ref)) throw new Error(`${name}_MUST_BE_SYNTHETIC_REF`); return ref; };
const validEvidenceIdentity = (value, name) => { if (!value || value.syntheticOnly !== true || typeof value.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(value.sha256)) throw new Error(`${name}_INVALID`); };

export function buildNonProductionEvidencePacket({ planId, checkpoint = 'P10.180', approvalRef = null, targetRef = null, migrationArtifact = null, rlsPolicy = null, regressionEvidence = null, integrityEvidence = null, releaseManifest = null, rollbackPlan = null, independentReview = null } = {}) {
  requiredString(planId, 'PLAN_ID');
  const packet = {
    schemaVersion: REQUIRED_SCHEMA, packetVersion: '1.0', planId: planId.trim(), checkpoint: requiredString(checkpoint, 'CHECKPOINT'),
    status: approvalRef && targetRef ? 'READY_FOR_GOVERNED_REVIEW' : 'BLOCKED_PENDING_GOVERNANCE', syntheticOnly: true,
    safety: { migrationFreeze: true, aiEnabled: false },
    approvalRef: approvalRef === null ? null : syntheticRef(approvalRef, 'APPROVAL_REF'), targetRef: targetRef === null ? null : syntheticRef(targetRef, 'TARGET_REF'),
    migrationArtifact: migrationArtifact === null ? null : structuredClone(migrationArtifact), rlsPolicy: rlsPolicy === null ? null : structuredClone(rlsPolicy),
    regressionEvidence: regressionEvidence === null ? null : structuredClone(regressionEvidence), integrityEvidence: integrityEvidence === null ? null : structuredClone(integrityEvidence),
    releaseManifest: releaseManifest === null ? null : structuredClone(releaseManifest), rollbackPlan: rollbackPlan === null ? null : structuredClone(rollbackPlan), independentReview: independentReview === null ? null : structuredClone(independentReview),
  };
  return Object.freeze({ ...packet, packetSha256: digest(packet) });
}

export function assertNonProductionEvidencePacket(packet) {
  if (!packet || packet.schemaVersion !== REQUIRED_SCHEMA) throw new Error('PACKET_SCHEMA_UNSUPPORTED');
  for (const field of REQUIRED_PACKET_FIELDS) if (packet[field] === null || packet[field] === undefined) throw new Error(`PACKET_${field.toUpperCase()}_REQUIRED`);
  if (packet.syntheticOnly !== true) throw new Error('PACKET_NOT_SYNTHETIC');
  if (packet.safety?.migrationFreeze !== true || packet.safety?.aiEnabled !== false) throw new Error('PACKET_SAFETY_GATE_FAILED');
  if (packet.status !== 'READY_FOR_GOVERNED_REVIEW') throw new Error('PACKET_GOVERNANCE_NOT_READY');
  syntheticRef(packet.approvalRef, 'APPROVAL_REF'); syntheticRef(packet.targetRef, 'TARGET_REF');
  validEvidenceIdentity(packet.migrationArtifact, 'PACKET_MIGRATION_ARTIFACT'); validEvidenceIdentity(packet.rlsPolicy, 'PACKET_RLS_POLICY');
  validEvidenceIdentity(packet.regressionEvidence, 'PACKET_REGRESSION_EVIDENCE'); validEvidenceIdentity(packet.integrityEvidence, 'PACKET_INTEGRITY_EVIDENCE'); validEvidenceIdentity(packet.releaseManifest, 'PACKET_RELEASE_MANIFEST'); validEvidenceIdentity(packet.rollbackPlan, 'PACKET_ROLLBACK_PLAN');
  if (packet.regressionEvidence.classification !== 'PASS' || packet.integrityEvidence.classification !== 'PASS') throw new Error('PACKET_GATE_EVIDENCE_NOT_PASS');
  if (!packet.independentReview?.syntheticOnly || !packet.independentReview.reviewerRef || !packet.independentReview.role) throw new Error('PACKET_INDEPENDENT_REVIEW_INVALID');
  syntheticRef(packet.independentReview.reviewerRef, 'REVIEWER_REF'); requiredString(packet.independentReview.role, 'REVIEWER_ROLE');
  const { packetSha256, ...payload } = packet;
  if (digest(payload) !== packetSha256) throw new Error('PACKET_TAMPERED');
  return true;
}

export function classifyNonProductionEvidencePacket(packet) {
  try { assertNonProductionEvidencePacket(packet); return Object.freeze({ classification: 'PASS', executionAuthorized: false, reason: 'EVIDENCE_PACKET_VALIDATED_ONLY' }); }
  catch (error) { return Object.freeze({ classification: 'BLOCKED', executionAuthorized: false, reason: error instanceof Error ? error.message : 'PACKET_VALIDATION_FAILED' }); }
}

export { REQUIRED_SCHEMA, REQUIRED_PACKET_FIELDS };
