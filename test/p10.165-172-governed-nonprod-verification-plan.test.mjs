import test from 'node:test';
import assert from 'node:assert/strict';
import { createNonProductionVerificationPlan, assertVerificationExecutionAuthorized, classifyVerificationPlan, REQUIRED_STEPS } from '../src/runtime/governed-nonprod-verification-plan.mjs';

test('P10.165: plan identity and bounded step matrix are required', () => {
  const plan = createNonProductionVerificationPlan({ planId: 'PLAN-SYN-172' });
  assert.equal(plan.schemaVersion, 'MTA-NONPROD-VERIFY-V1');
  assert.deepEqual(plan.steps, REQUIRED_STEPS);
  assert.equal(plan.syntheticOnly, true);
});

test('P10.166: incomplete governance remains blocked', () => {
  const plan = createNonProductionVerificationPlan({ planId: 'PLAN-SYN-166' });
  assert.equal(plan.status, 'BLOCKED_PENDING_GOVERNANCE');
  assert.equal(classifyVerificationPlan(plan).classification, 'BLOCKED');
});

test('P10.167: governance and target references are explicit when supplied', () => {
  const plan = createNonProductionVerificationPlan({ planId: 'PLAN-SYN-167', approvalRef: 'APPROVAL-SYN-1', targetRef: 'TARGET-SYN-1' });
  assert.equal(plan.status, 'READY_FOR_GOVERNED_REVIEW');
  assert.equal(plan.approvalRef, 'APPROVAL-SYN-1');
  assert.equal(plan.targetRef, 'TARGET-SYN-1');
});

test('P10.168: Migration Freeze blocks live execution even with approval flags', () => {
  const plan = createNonProductionVerificationPlan({ planId: 'PLAN-SYN-168', approvalRef: 'APPROVAL-SYN-1', targetRef: 'TARGET-SYN-1' });
  assert.throws(() => assertVerificationExecutionAuthorized({ plan, governanceApproved: true, targetApproved: true, migrationFreeze: true, allowLive: true }), /LIVE_EXECUTION_BLOCKED/);
});

test('P10.169: missing governance authorization fails closed', () => {
  const plan = createNonProductionVerificationPlan({ planId: 'PLAN-SYN-169', approvalRef: 'APPROVAL-SYN-1', targetRef: 'TARGET-SYN-1' });
  assert.throws(() => assertVerificationExecutionAuthorized({ plan, governanceApproved: false, targetApproved: true, migrationFreeze: false, allowLive: true }), /GOVERNANCE_AUTHORIZATION_REQUIRED/);
});

test('P10.170: missing target authorization fails closed', () => {
  const plan = createNonProductionVerificationPlan({ planId: 'PLAN-SYN-170', approvalRef: 'APPROVAL-SYN-1', targetRef: 'TARGET-SYN-1' });
  assert.throws(() => assertVerificationExecutionAuthorized({ plan, governanceApproved: true, targetApproved: false, migrationFreeze: false, allowLive: true }), /GOVERNANCE_AUTHORIZATION_REQUIRED/);
});

test('P10.171: invalid plan schema cannot authorize execution', () => {
  assert.throws(() => assertVerificationExecutionAuthorized({ plan: { schemaVersion: 'OLD', syntheticOnly: true }, governanceApproved: true, targetApproved: true, migrationFreeze: false, allowLive: true }), /PLAN_SCHEMA_INVALID/);
});

test('P10.172: classifier never converts a blocked plan into PASS', () => {
  const plan = createNonProductionVerificationPlan({ planId: 'PLAN-SYN-172', approvalRef: 'APPROVAL-SYN-1', targetRef: 'TARGET-SYN-1' });
  const result = classifyVerificationPlan(plan, { governanceApproved: true, targetApproved: true, migrationFreeze: true, allowLive: true });
  assert.equal(result.classification, 'BLOCKED');
  assert.equal(result.executionAuthorized, false);
});
