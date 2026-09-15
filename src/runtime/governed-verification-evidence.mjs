/** P10.141-P10.148 governed verification evidence boundary. Synthetic/readiness only. */
export const VERIFICATION_CLASSIFICATION = Object.freeze({ PASS: 'PASS', FAIL: 'FAIL', BLOCKED: 'BLOCKED' });
export const VERIFICATION_SCENARIOS = Object.freeze([
  'transaction-commit-coupling',
  'transaction-rollback-coupling',
  'concurrent-consume-single-winner',
  'expiry-enforcement',
  'actor-scope-object-isolation',
  'concurrent-revoke-single-winner',
  'provider-post-commit-isolation',
  'migration-freeze-ai-off-safety',
]);

function requiredString(value, name) { if (typeof value !== 'string' || !value.trim()) throw new Error(`${name}_REQUIRED`); return value.trim(); }
function clone(value) { return structuredClone(value); }

export function assertVerificationSafety({ appEnv, aiEnabled, migrationFreeze, syntheticOnly = true } = {}) {
  if (appEnv !== 'test') throw new Error('UNSAFE_APP_ENV');
  if (aiEnabled !== 'false') throw new Error('AI_NOT_DISABLED');
  if (migrationFreeze !== 'true') throw new Error('MIGRATION_FREEZE_NOT_ACTIVE');
  if (syntheticOnly !== true) throw new Error('NON_SYNTHETIC_VERIFICATION');
  return true;
}

export function createVerificationEvidence({ runId, commitSha, safety, scenarios = VERIFICATION_SCENARIOS, classification = VERIFICATION_CLASSIFICATION.BLOCKED, observations = [] } = {}) {
  requiredString(runId, 'RUN_ID');
  requiredString(commitSha, 'COMMIT_SHA');
  assertVerificationSafety({ ...safety, syntheticOnly: true });
  if (!Array.isArray(scenarios) || !scenarios.length) throw new Error('SCENARIO_MATRIX_REQUIRED');
  if (!scenarios.every((scenario) => VERIFICATION_SCENARIOS.includes(scenario))) throw new Error('UNKNOWN_VERIFICATION_SCENARIO');
  if (!Object.values(VERIFICATION_CLASSIFICATION).includes(classification)) throw new Error('INVALID_CLASSIFICATION');
  if (!Array.isArray(observations)) throw new Error('OBSERVATIONS_ARRAY_REQUIRED');
  return Object.freeze({
    schemaVersion: 'p10.141.v1',
    runId: runId.trim(),
    commitSha: commitSha.trim(),
    syntheticOnly: true,
    safety: Object.freeze({ appEnv: safety.appEnv, aiEnabled: safety.aiEnabled, migrationFreeze: safety.migrationFreeze }),
    scenarios: Object.freeze([...scenarios]),
    observations: clone(observations),
    classification,
  });
}

export function assertLiveVerificationBlocked({ migrationFreeze = 'true', allowLive = false } = {}) {
  if (migrationFreeze === 'true' || allowLive !== true) throw new Error('LIVE_VERIFICATION_BLOCKED');
  return true;
}

export function classifyScenarioResults(results = []) {
  if (!Array.isArray(results) || !results.length) return VERIFICATION_CLASSIFICATION.BLOCKED;
  if (results.some((result) => result?.classification === 'FAIL')) return VERIFICATION_CLASSIFICATION.FAIL;
  if (results.some((result) => result?.classification === 'BLOCKED')) return VERIFICATION_CLASSIFICATION.BLOCKED;
  return results.every((result) => result?.classification === 'PASS') ? VERIFICATION_CLASSIFICATION.PASS : VERIFICATION_CLASSIFICATION.BLOCKED;
}
