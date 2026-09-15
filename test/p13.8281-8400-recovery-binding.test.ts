import test from "node:test";
import assert from "node:assert/strict";
import { assertRecoveryEvidenceLifecycleBinding } from "../src/application/recovery-lifecycle-binding.js";
import { createRecoveryEvidence } from "../src/application/recovery-evidence.js";
import { createFailureRecoveryCase } from "../src/application/failure-recovery-contract.js";
import { certifyLifecycleJourney, type LifecycleCertification } from "../src/application/lifecycle-certification.js";
import { createLifecycleEvent, assertLifecycleEventEnvelope } from "../src/application/lifecycle-orchestration.js";
import { createRecoveryRetryKey, assertRecoveryRetryKeyBinding } from "../src/application/recovery-retry.js";

function lifecycleCertification(): LifecycleCertification {
  const correlationId = "CORR-BIND";
  const steps = [
    ["REGISTRATION", "DET-BIND", "CMD-BIND-1", "EVT-BIND-1", 0, 1],
    ["PLACEMENT", "DET-BIND", "CMD-BIND-2", "EVT-BIND-2", 1, 2],
    ["MOVEMENT", "DET-BIND", "CMD-BIND-3", "EVT-BIND-3", 2, 3],
    ["TEMPORARY_EXIT", "DET-BIND", "CMD-BIND-4", "EVT-BIND-4", 3, 4],
    ["REPORTING", "DET-BIND", "CMD-BIND-5", "EVT-BIND-5", 4, 5],
  ].map(([name, aggregateId, commandId, eventId, beforeVersion, afterVersion]) => ({ name, aggregateId, commandId, eventId, correlationId, beforeVersion, afterVersion, status: "COMMITTED" as const }));
  return certifyLifecycleJourney({ journeyId: "J-BIND", steps, auditCount: 5, outboxCount: 5, projectionVersion: 5 });
}

test("recovery evidence binds directly to the lifecycle certification step", () => {
  const failure = createFailureRecoveryCase("OUTBOX_FAILURE");
  const evidence = createRecoveryEvidence({ evidenceId: "REC-BIND", commandId: "CMD-BIND-3", eventId: "EVT-BIND-3", correlationId: "CORR-BIND", aggregateId: "DET-BIND", expectedVersion: 2, resultingVersion: 3, failureClass: failure.failureClass, reasonCode: failure.reasonCode, terminalState: failure.terminalState, recovery: failure.recovery, mutationCommitted: true, retrySafe: true, compensationAllowed: false });
  assert.doesNotThrow(() => assertRecoveryEvidenceLifecycleBinding(lifecycleCertification(), [evidence]));
  assert.throws(() => assertRecoveryEvidenceLifecycleBinding(lifecycleCertification(), [{ ...evidence, eventId: "EVT-TAMPER" }]));
});

test("retry key is deterministically bound to command identity and source fingerprint", () => {
  const key = createRecoveryRetryKey("CMD-BIND-3", "FP-123");
  assert.equal(key, "RETRY-CMD-BIND-3-FP-123");
  assert.doesNotThrow(() => assertRecoveryRetryKeyBinding({ retryKey: key, targetId: "EVT-BIND-3", attempt: 1, decision: "RETRY", sourceFingerprint: "FP-123", syntheticOnly: true }, "CMD-BIND-3", "FP-123"));
  assert.throws(() => assertRecoveryRetryKeyBinding({ retryKey: key, targetId: "EVT-BIND-3", attempt: 1, decision: "RETRY", sourceFingerprint: "FP-999", syntheticOnly: true }, "CMD-BIND-3", "FP-999"));
  assert.throws(() => assertRecoveryRetryKeyBinding({ retryKey: key, targetId: "EVT-BIND-3", attempt: 1, decision: "RETRY", sourceFingerprint: "FP-123", syntheticOnly: true }, "CMD-OTHER", "FP-123"));
});

test("lifecycle event validation never substitutes commandId for requestHash", () => {
  assert.doesNotThrow(() => assertLifecycleEventEnvelope({ eventId: "EVT-1", commandId: "CMD-1", correlationId: "CORR-1", aggregateId: "DET-1", resultingVersion: 1, eventType: "REGISTERED", payload: {} }));
  assert.equal(createLifecycleEvent({ eventId: "EVT-1", commandId: "CMD-1", correlationId: "CORR-1", aggregateId: "DET-1", resultingVersion: 1, eventType: "REGISTERED", payload: {} }).commandId, "CMD-1");
});
