import type { LifecycleCertification } from "./lifecycle-certification.js";
import type { RecoveryCertification } from "./recovery-certification.js";
import type { RuntimeExecutionContext } from "./runtime-execution-boundary.js";
import type { RuntimeContinuityAssessment } from "./runtime-continuity-coordinator.js";
import type { BackupContinuityAssessment } from "./runtime-backup-continuity.js";

export type ContinuityCertification = Readonly<{
  certificationId: string;
  journeyId: string;
  executionId: string;
  lifecycleJourneyId: string;
  recoveryJourneyId: string;
  runtimeDecision: RuntimeContinuityAssessment["decision"];
  backupDecision: BackupContinuityAssessment["decision"];
  projectionVersion: number;
  lifecycleVersion: number;
  certified: true;
  syntheticOnly: true;
}>;

export function certifyContinuity(input: {
  certificationId: string;
  context: RuntimeExecutionContext;
  lifecycle: LifecycleCertification;
  recovery: RecoveryCertification;
  runtime: RuntimeContinuityAssessment;
  backup: BackupContinuityAssessment;
}): ContinuityCertification {
  for (const value of [input.certificationId, input.context.executionId, input.context.certificationJourneyId]) if (!value.trim()) throw new Error("Continuity certification identity is required.");
  if (!input.context.syntheticOnly || !input.lifecycle.syntheticOnly || !input.recovery.syntheticOnly || !input.runtime.syntheticOnly || !input.backup.syntheticOnly) throw new Error("Continuity certification is synthetic-only.");
  if (input.context.certificationJourneyId !== input.lifecycle.journeyId || input.context.certificationJourneyId !== input.recovery.journeyId) throw new Error("Continuity certification journey drift detected.");
  const lifecycleVersion = input.lifecycle.projectionVersion;
  if (!Number.isInteger(lifecycleVersion) || lifecycleVersion < 0) throw new Error("Lifecycle certification version is invalid.");
  if (input.runtime.decision !== "READY") throw new Error("Runtime continuity must be READY before certification.");
  if (input.backup.decision !== "READY") throw new Error("Backup continuity must be READY before certification.");
  if (input.recovery.outcome === "RECONNECT_REVIEW" || input.recovery.outcome === "REVIEW_REQUIRED") throw new Error("Unresolved recovery review cannot be certified as continuous.");
  if (input.runtime.queueState !== "SYNCED") throw new Error("Continuity certification requires synchronized queue state.");
  return Object.freeze({ certificationId: input.certificationId, journeyId: input.context.certificationJourneyId, executionId: input.context.executionId, lifecycleJourneyId: input.lifecycle.journeyId, recoveryJourneyId: input.recovery.journeyId, runtimeDecision: input.runtime.decision, backupDecision: input.backup.decision, projectionVersion: lifecycleVersion, lifecycleVersion, certified: true, syntheticOnly: true });
}

export function assertContinuityCertification(input: ContinuityCertification): void {
  if (!input.certified || !input.syntheticOnly) throw new Error("Continuity certification is invalid.");
  if (input.journeyId !== input.lifecycleJourneyId || input.journeyId !== input.recoveryJourneyId) throw new Error("Continuity journey binding mismatch.");
  if (input.runtimeDecision !== "READY" || input.backupDecision !== "READY") throw new Error("Certified continuity cannot contain blocked readiness state.");
  if (input.projectionVersion !== input.lifecycleVersion) throw new Error("Continuity projection/version mismatch.");
}
