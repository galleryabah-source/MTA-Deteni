const REQUIRED_STEPS = Object.freeze([
  'governance-approval',
  'target-identity-verification',
  'environment-safety-verification',
  'migration-artifact-verification',
  'rls-policy-verification',
  'transaction-concurrency-verification',
  'rollback-verification',
  'independent-evidence-review',
]);

function requiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${name}_REQUIRED`);
  return value.trim();
}

export function createNonProductionVerificationPlan({ planId, checkpoint = 'P10.172', approvalRef = null, targetRef = null } = {}) {
  requiredString(planId, 'PLAN_ID');
  if (approvalRef !== null) requiredString(approvalRef, 'APPROVAL_REF');
  if (targetRef !== null) requiredString(targetRef, 'TARGET_REF');
  return Object.freeze({
    schemaVersion: 'MTA-NONPROD-VERIFY-V1',
    planId: planId.trim(),
    checkpoint: checkpoint.trim(),
    status: approvalRef && targetRef ? 'READY_FOR_GOVERNED_REVIEW' : 'BLOCKED_PENDING_GOVERNANCE',
    approvalRef: approvalRef?.trim() ?? null,
    targetRef: targetRef?.trim() ?? null,
    syntheticOnly: true,
    safety: Object.freeze({ migrationFreeze: true, aiEnabled: false }),
    steps: Object.freeze([...REQUIRED_STEPS]),
  });
}

export function assertVerificationExecutionAuthorized({ plan, governanceApproved = false, targetApproved = false, migrationFreeze = true, allowLive = false } = {}) {
  if (!plan || plan.schemaVersion !== 'MTA-NONPROD-VERIFY-V1') throw new Error('PLAN_SCHEMA_INVALID');
  if (plan.syntheticOnly !== true) throw new Error('PLAN_NOT_SYNTHETIC');
  if (migrationFreeze === true || allowLive !== true) throw new Error('LIVE_EXECUTION_BLOCKED');
  if (governanceApproved !== true || targetApproved !== true) throw new Error('GOVERNANCE_AUTHORIZATION_REQUIRED');
  return true;
}

export function classifyVerificationPlan(plan, approvals = {}) {
  try {
    if (!plan || plan.status === 'BLOCKED_PENDING_GOVERNANCE') throw new Error('GOVERNANCE_REVIEW_REQUIRED');
    assertVerificationExecutionAuthorized({ plan, ...approvals });
    return Object.freeze({ classification: 'PASS', executionAuthorized: true });
  } catch (error) {
    return Object.freeze({ classification: 'BLOCKED', executionAuthorized: false, reason: error instanceof Error ? error.message : 'VERIFICATION_BLOCKED' });
  }
}

export { REQUIRED_STEPS };
