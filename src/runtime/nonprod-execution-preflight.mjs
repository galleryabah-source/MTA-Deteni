const REQUIRED_SCHEMA = 'MTA-NONPROD-PREFLIGHT-V1';
const requiredString = (value, name) => { if (typeof value !== 'string' || !value.trim()) throw new Error(`${name}_REQUIRED`); return value.trim(); };
const syntheticRef = (value, name) => { const ref = requiredString(value, name); if (!/^synthetic:[A-Za-z0-9._:-]+$/.test(ref)) throw new Error(`${name}_MUST_BE_SYNTHETIC_REF`); return ref; };

export function buildExecutionPreflight({ packetId, checkpoint = 'P10.188', packetStatus = 'VALIDATED', governanceApproved = false, targetApproved = false, migrationFreeze = true, aiEnabled = false, rollbackReady = false, independentReviewComplete = false } = {}) {
  requiredString(packetId, 'PACKET_ID');
  return Object.freeze({ schemaVersion: REQUIRED_SCHEMA, packetId: syntheticRef(packetId, 'PACKET_ID'), checkpoint: requiredString(checkpoint, 'CHECKPOINT'), packetStatus, governanceApproved, targetApproved, migrationFreeze, aiEnabled, rollbackReady, independentReviewComplete });
}

export function assertExecutionPreflight(preflight) {
  if (!preflight || preflight.schemaVersion !== REQUIRED_SCHEMA) throw new Error('PREFLIGHT_SCHEMA_INVALID');
  if (preflight.packetStatus !== 'VALIDATED') throw new Error('PREFLIGHT_PACKET_NOT_VALIDATED');
  syntheticRef(preflight.packetId, 'PACKET_ID');
  if (preflight.migrationFreeze !== false || preflight.aiEnabled !== false) throw new Error('PREFLIGHT_SAFETY_GATE_FAILED');
  if (preflight.governanceApproved !== true) throw new Error('PREFLIGHT_GOVERNANCE_REQUIRED');
  if (preflight.targetApproved !== true) throw new Error('PREFLIGHT_TARGET_REQUIRED');
  if (preflight.rollbackReady !== true) throw new Error('PREFLIGHT_ROLLBACK_NOT_READY');
  if (preflight.independentReviewComplete !== true) throw new Error('PREFLIGHT_INDEPENDENT_REVIEW_REQUIRED');
  return true;
}

export function classifyExecutionPreflight(preflight) {
  try { assertExecutionPreflight(preflight); return Object.freeze({ classification: 'PASS', executionAuthorized: false, reason: 'PREFLIGHT_ONLY_NO_EXECUTION' }); }
  catch (error) { return Object.freeze({ classification: 'BLOCKED', executionAuthorized: false, reason: error instanceof Error ? error.message : 'PREFLIGHT_BLOCKED' }); }
}

export { REQUIRED_SCHEMA };
