import type { LifecycleCertification, LifecycleStep } from "./lifecycle-certification.js";
import type { RecoveryEvidence } from "./recovery-evidence.js";

export function assertRecoveryEvidenceLifecycleBinding(certification: LifecycleCertification, evidence: readonly RecoveryEvidence[], expectedRequestHashes?: Readonly<Record<string, string>>): void {
  if (!certification.journeyId.trim()) throw new Error("Lifecycle certification identity is required.");
  if (evidence.some((item) => !item.syntheticOnly)) throw new Error("Recovery evidence must remain synthetic-only.");
  for (const item of evidence) {
    const matching = certification.steps.find((step) => step.commandId === item.commandId);
    if (!matching) throw new Error("Recovery evidence command is absent from lifecycle certification.");
    assertRecoveryEvidenceStepBinding(matching, item, expectedRequestHashes?.[item.commandId]);
  }
}

export function assertRecoveryEvidenceStepBinding(step: LifecycleStep, evidence: RecoveryEvidence, expectedRequestHash?: string): void {
  if (step.commandId !== evidence.commandId || step.eventId !== evidence.eventId || step.correlationId !== evidence.correlationId || step.aggregateId !== evidence.aggregateId) throw new Error("Recovery evidence/lifecycle step identity drift detected.");
  if (expectedRequestHash !== undefined && evidence.requestHash !== expectedRequestHash) throw new Error("Recovery requestHash/lifecycle command binding drift detected.");
  if (evidence.requestHash === evidence.commandId) throw new Error("Recovery requestHash must remain distinct from commandId.");
  if (evidence.mutationCommitted) {
    if (step.beforeVersion !== evidence.expectedVersion || step.afterVersion !== evidence.resultingVersion) throw new Error("Committed recovery version binding mismatch.");
    if (step.status !== "COMMITTED") throw new Error("Committed recovery evidence requires a committed lifecycle step.");
  } else if (evidence.expectedVersion !== evidence.resultingVersion) {
    throw new Error("Rejected recovery evidence cannot advance lifecycle version.");
  }
}
