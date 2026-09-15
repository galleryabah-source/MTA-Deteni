const ORDER = Object.freeze([
  'REQUEST',
  'VALIDATE',
  'AUTHORIZE',
  'GENERATE_EXIT_DOCUMENT',
  'ASSIGN_ESCORT',
  'APPROVE_DOCUMENT',
  'ISSUE_DOCUMENT',
  'GRANT_DOWNLOAD',
  'DOWNLOAD',
  'EXECUTE_EXIT',
  'RETURN',
  'CLOSE',
]);

const PROVIDER_STEPS = new Set(['WHATSAPP_NOTIFY', 'STORAGE_PUBLISH', 'EXTERNAL_DEVICE_SYNC']);

export function createTemporaryExitPlan({ requestId, detaineeId, scopeId, correlationId }) {
  for (const [value, name] of [[requestId, 'requestId'], [detaineeId, 'detaineeId'], [scopeId, 'scopeId'], [correlationId, 'correlationId']]) {
    if (typeof value !== 'string' || value.trim() === '') throw new Error(`${name} is required`);
  }
  return Object.freeze({ requestId, detaineeId, scopeId, correlationId, steps: ORDER });
}

export function assertTemporaryExitStep(plan, currentStep, completedSteps = []) {
  if (!plan || !Array.isArray(plan.steps)) throw new Error('temporary-exit plan is required');
  if (!plan.steps.includes(currentStep)) throw new Error('Unsupported temporary-exit step');
  const expectedIndex = plan.steps.indexOf(currentStep);
  const completed = new Set(completedSteps);
  for (let i = 0; i < expectedIndex; i += 1) {
    if (!completed.has(plan.steps[i])) throw new Error(`Prerequisite step not completed: ${plan.steps[i]}`);
  }
  return true;
}

export function assertPostCommitProvider(step, { transactionCommitted }) {
  if (!PROVIDER_STEPS.has(step)) throw new Error('Unsupported provider step');
  if (transactionCommitted !== true) throw new Error('Provider activation requires committed transaction');
  return true;
}

export { ORDER as TEMPORARY_EXIT_WORKFLOW_STEPS };
