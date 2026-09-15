import type { ContinuityCertification } from "./continuity-certification.js";
import type { OperationalSession } from "./offline-operational-session.js";
import type { SessionReconciliationProof } from "./session-reconciliation.js";
import type { RuntimeHandoff } from "./runtime-execution-boundary.js";
import type { BackupContinuityAssessment } from "./runtime-backup-continuity.js";

export type UnifiedContinuityEnvelope = Readonly<{
  envelopeId: string;
  certification: ContinuityCertification;
  reconciliation: SessionReconciliationProof;
  sessionId: string;
  executionId: string;
  deviceId: string;
  installationId: string;
  networkScopeId: string;
  journeyId: string;
  handoffKey: string;
  backupDecision: BackupContinuityAssessment["decision"];
  certified: true;
  syntheticOnly: true;
}>;

export function createUnifiedContinuityEnvelope(input: { envelopeId: string; certification: ContinuityCertification; session: OperationalSession; reconciliation: SessionReconciliationProof; handoff: RuntimeHandoff; backup: BackupContinuityAssessment; }): UnifiedContinuityEnvelope {
  const values = [input.envelopeId, input.certification.certificationId, input.session.sessionId, input.session.executionId, input.session.deviceId, input.session.installationId, input.session.networkScopeId, input.certification.journeyId, input.handoff.executionId];
  if (values.some((value) => !value.trim())) throw new Error("Unified continuity envelope identity is required.");
  if (!input.certification.certified || !input.certification.syntheticOnly || !input.session.syntheticOnly || !input.reconciliation.syntheticOnly || !input.handoff.syntheticOnly || !input.backup.syntheticOnly) throw new Error("Unified continuity envelope is synthetic-only.");
  if (input.certification.sessionId !== input.session.sessionId || input.certification.executionId !== input.session.executionId || input.certification.deviceId !== input.session.deviceId || input.certification.installationId !== input.session.installationId || input.certification.networkScopeId !== input.session.networkScopeId) throw new Error("Unified continuity identity drift detected.");
  if (input.reconciliation.sessionId !== input.session.sessionId || input.reconciliation.executionId !== input.session.executionId || !input.reconciliation.complete || input.reconciliation.admittedCount !== input.reconciliation.reconciledCount) throw new Error("Reconciliation identity or completeness drift detected.");
  if (input.handoff.executionId !== input.session.executionId || !input.handoff.authorizationRequired || !input.handoff.certificationBound) throw new Error("Runtime handoff authorization/certification binding is invalid.");
  if (input.backup.decision !== "READY" || input.certification.backupDecision !== "READY") throw new Error("Unified continuity requires READY backup continuity.");
  if (input.session.state !== "CLOSED") throw new Error("Unified continuity envelope requires a cleanly closed session.");
  return Object.freeze({ envelopeId: input.envelopeId, certification: input.certification, reconciliation: input.reconciliation, sessionId: input.session.sessionId, executionId: input.session.executionId, deviceId: input.session.deviceId, installationId: input.session.installationId, networkScopeId: input.session.networkScopeId, journeyId: input.certification.journeyId, handoffKey: `${input.handoff.fromMode}->${input.handoff.toMode}:${input.handoff.executionId}`, backupDecision: input.backup.decision, certified: true, syntheticOnly: true });
}

export function assertUnifiedContinuityEnvelope(input: UnifiedContinuityEnvelope): void {
  const values = [input.envelopeId, input.certification.certificationId, input.sessionId, input.executionId, input.deviceId, input.installationId, input.networkScopeId, input.journeyId, input.handoffKey];
  if (values.some((value) => !value.trim())) throw new Error("Unified continuity envelope identity is invalid.");
  if (!input.certified || !input.syntheticOnly) throw new Error("Unified continuity envelope is invalid.");
  if (input.certification.certificationId !== input.certification.certificationId || input.certification.sessionId !== input.sessionId || input.certification.executionId !== input.executionId || input.certification.deviceId !== input.deviceId || input.certification.installationId !== input.installationId || input.certification.networkScopeId !== input.networkScopeId) throw new Error("Unified continuity certification binding mismatch.");
  if (input.journeyId !== input.certification.journeyId || input.reconciliation.sessionId !== input.sessionId || input.reconciliation.executionId !== input.executionId || !input.reconciliation.complete) throw new Error("Unified continuity evidence binding mismatch.");
  if (input.certification.runtimeDecision !== "READY" || input.backupDecision !== "READY" || input.certification.backupDecision !== "READY") throw new Error("Unified continuity readiness binding mismatch.");
  if (input.reconciliation.admittedCount !== input.reconciliation.reconciledCount || input.reconciliation.receiptIds.length !== input.reconciliation.reconciledCount) throw new Error("Unified continuity command/receipt cardinality mismatch.");
}
