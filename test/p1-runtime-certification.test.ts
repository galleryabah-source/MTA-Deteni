import test from "node:test";
import assert from "node:assert/strict";
import {
  REQUIRED_P1_RUNTIME_CONTROLS,
  assertP1RuntimeObservedPass,
  validateP1RuntimeCertificationEvidence,
  type P1RuntimeCertificationEvidence,
} from "../src/application/p1-runtime-certification.js";

function evidence(overrides: Partial<P1RuntimeCertificationEvidence> = {}): P1RuntimeCertificationEvidence {
  return {
    schemaVersion: "mta-p1-runtime-certification/v1",
    executionId: "p1-exec-001",
    commit: "35702ec074279576e769e3543137efb1d2fc7b4d",
    environment: "controlled-nonprod",
    productionAccessAuthorized: false,
    migrationExecuted: false,
    aiEnabled: false,
    status: "OBSERVED_PASS",
    controls: REQUIRED_P1_RUNTIME_CONTROLS.map(controlId => ({ controlId, status: "PASS", exitCode: 0 })),
    ...overrides,
  };
}

test("accepts a complete synthetic P1 observed-pass evidence set", () => {
  const value = evidence();
  validateP1RuntimeCertificationEvidence(value);
  assert.doesNotThrow(() => assertP1RuntimeObservedPass(value));
});

test("rejects incomplete, duplicated or unresolved certification evidence", () => {
  assert.throws(() => validateP1RuntimeCertificationEvidence(evidence({ controls: [] })), /P1_CERTIFICATION_CONTROL_COUNT_INVALID/);
  const duplicate = [...evidence().controls];
  duplicate[1] = duplicate[0];
  assert.throws(() => validateP1RuntimeCertificationEvidence(evidence({ controls: duplicate })), /P1_CERTIFICATION_DUPLICATE_CONTROL/);
  assert.throws(() => validateP1RuntimeCertificationEvidence(evidence({ commit: "unknown" })), /P1_CERTIFICATION_COMMIT_UNRESOLVED/);
});

test("rejects any evidence that would cross governance locks", () => {
  assert.throws(() => validateP1RuntimeCertificationEvidence(evidence({ productionAccessAuthorized: true } as never)), /P1_CERTIFICATION_PRODUCTION_AUTHORIZATION_INVALID/);
  assert.throws(() => validateP1RuntimeCertificationEvidence(evidence({ migrationExecuted: true } as never)), /P1_CERTIFICATION_MIGRATION_STATE_INVALID/);
  assert.throws(() => validateP1RuntimeCertificationEvidence(evidence({ aiEnabled: true } as never)), /P1_CERTIFICATION_AI_STATE_INVALID/);
});

test("does not certify pending or failed controls", () => {
  const pending = [...evidence().controls];
  pending[0] = { ...pending[0], status: "PENDING", exitCode: null };
  const pendingEvidence = evidence({ status: "OBSERVATION_INCOMPLETE", controls: pending });
  assert.throws(() => assertP1RuntimeObservedPass(pendingEvidence), /P1_CERTIFICATION_NOT_OBSERVED_PASS/);

  const failed = [...evidence().controls];
  failed[6] = { ...failed[6], status: "FAIL", exitCode: 1 };
  const failedEvidence = evidence({ controls: failed });
  assert.throws(() => assertP1RuntimeObservedPass(failedEvidence), /P1_CERTIFICATION_CONTROL_NOT_PASS/);
});

test("rejects PASS controls without exit code zero", () => {
  const controls = [...evidence().controls];
  controls[0] = { ...controls[0], exitCode: 1 };
  assert.throws(() => validateP1RuntimeCertificationEvidence(evidence({ controls })), /P1_CERTIFICATION_PASS_EXIT_CODE_INVALID/);
});
