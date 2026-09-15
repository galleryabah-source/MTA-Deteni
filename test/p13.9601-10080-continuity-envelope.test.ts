import assert from "node:assert/strict";
import test from "node:test";
import { createUnifiedContinuityEnvelope, assertUnifiedContinuityEnvelope } from "../src/application/unified-continuity-envelope.js";
import { assessLocalLanRecovery, assertLocalLanRecoveryProof } from "../src/application/local-lan-recovery.js";
import { createRuntimeHandoff } from "../src/application/runtime-execution-boundary.js";
import type { ContinuityCertification } from "../src/application/continuity-certification.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { SessionReconciliationProof } from "../src/application/session-reconciliation.js";
import type { BackupContinuityAssessment } from "../src/application/runtime-backup-continuity.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

test("P13.9601-9720: unified envelope binds session, certification, reconciliation and handoff", () => {
  const context = { executionId: "EXEC-1", runtimeMode: "LAN", deviceClass: "TABLET", networkScopeId: "NET-1", certificationJourneyId: "J-1", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
  const session = { sessionId: "S-1", executionId: "EXEC-1", deviceId: "DEV-1", installationId: "INST-1", networkScopeId: "NET-1", runtimeMode: "LAN", state: "CLOSED", syntheticOnly: true } as OperationalSession;
  const certification = { certificationId: "CONT-S-1", journeyId: "J-1", executionId: "EXEC-1", sessionId: "S-1", deviceId: "DEV-1", installationId: "INST-1", networkScopeId: "NET-1", lifecycleJourneyId: "J-1", recoveryJourneyId: "J-1", runtimeDecision: "READY", backupDecision: "READY", projectionVersion: 1, lifecycleVersion: 1, certified: true, syntheticOnly: true } as ContinuityCertification;
  const reconciliation = { sessionId: "S-1", executionId: "EXEC-1", admittedCount: 2, reconciledCount: 2, receiptIds: ["R-1", "R-2"], complete: true, syntheticOnly: true } as SessionReconciliationProof;
  const backup = { decision: "READY", syntheticOnly: true } as BackupContinuityAssessment;
  const handoff = createRuntimeHandoff({ executionId: "EXEC-1", fromMode: "CLOUD", toMode: "LAN", queuePending: false });
  const envelope = createUnifiedContinuityEnvelope({ envelopeId: "ENV-1", certification, session, reconciliation, handoff, backup });
  assertUnifiedContinuityEnvelope(envelope);
  assert.equal(envelope.admittedCount, 2);
  assert.equal(envelope.reconciliation.receiptIds.length, 2);
});

test("P13.9721-9840: local LAN recovery blocks installation/network drift", () => {
  const context = { executionId: "EXEC-2", runtimeMode: "LAN", deviceClass: "SMARTPHONE", networkScopeId: "NET-2", certificationJourneyId: "J-2", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
  const session = { sessionId: "S-2", executionId: "EXEC-2", deviceId: "DEV-OLD", installationId: "INST-2", networkScopeId: "NET-2", runtimeMode: "LAN", state: "RECONCILIATION_REQUIRED", syntheticOnly: true } as OperationalSession;
  const ready = assessLocalLanRecovery({ proofId: "LAN-1", session, context, targetDeviceId: "DEV-NEW", targetInstallationId: "INST-2", targetNetworkScopeId: "NET-2" });
  assertLocalLanRecoveryProof(ready);
  assert.equal(ready.decision, "READY");
  const blocked = assessLocalLanRecovery({ proofId: "LAN-2", session, context, targetDeviceId: "DEV-NEW", targetInstallationId: "INST-OTHER", targetNetworkScopeId: "NET-2" });
  assert.equal(blocked.decision, "BLOCKED");
  assert.throws(() => assertLocalLanRecoveryProof(blocked), /blocked/i);
});
