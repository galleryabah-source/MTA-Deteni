import type { OfflineCommand, QueueState, ReconciliationDecision } from "./offline-continuity.js";
import type { BackupManifest } from "./runtime-adapters.js";
import type { RuntimeExecutionContext, RuntimeHandoff } from "./runtime-execution-boundary.js";

export type RuntimeContinuityDecision = "READY" | "RECONCILIATION_REQUIRED" | "BLOCKED";

export type RuntimeContinuityAssessment = Readonly<{
  executionId: string;
  runtimeMode: RuntimeExecutionContext["runtimeMode"];
  queueState: QueueState;
  reconciliationAction: ReconciliationDecision["action"] | "NONE";
  backupReady: boolean;
  decision: RuntimeContinuityDecision;
  syntheticOnly: true;
}>;

export function assessRuntimeContinuity(input: {
  context: RuntimeExecutionContext;
  queue: readonly OfflineCommand[];
  reconciliation?: ReconciliationDecision;
  backup?: BackupManifest;
  handoff?: RuntimeHandoff;
}): RuntimeContinuityAssessment {
  if (!input.context.executionId.trim() || !input.context.networkScopeId.trim() || !input.context.certificationJourneyId.trim()) throw new Error("Runtime continuity context identity is required.");
  if (!input.context.authenticated || !input.context.syntheticOnly) throw new Error("Runtime continuity requires authenticated synthetic context.");
  if (input.handoff && input.handoff.executionId !== input.context.executionId) throw new Error("Runtime continuity/handoff identity mismatch.");
  const pending = input.queue.some((item) => item.state === "PENDING" || item.state === "SYNCING");
  const reconciliationAction = input.reconciliation?.action ?? "NONE";
  if (pending && reconciliationAction === "REVIEW_CONFLICT") return Object.freeze({ executionId: input.context.executionId, runtimeMode: input.context.runtimeMode, queueState: "CONFLICT", reconciliationAction, backupReady: Boolean(input.backup), decision: "BLOCKED", syntheticOnly: true });
  if (pending) return Object.freeze({ executionId: input.context.executionId, runtimeMode: input.context.runtimeMode, queueState: "SYNCING", reconciliationAction, backupReady: Boolean(input.backup), decision: "RECONCILIATION_REQUIRED", syntheticOnly: true });
  return Object.freeze({ executionId: input.context.executionId, runtimeMode: input.context.runtimeMode, queueState: "SYNCED", reconciliationAction, backupReady: Boolean(input.backup), decision: "READY", syntheticOnly: true });
}

export function assertRuntimeContinuityAssessment(input: RuntimeContinuityAssessment): void {
  if (!input.executionId.trim() || !input.syntheticOnly) throw new Error("Runtime continuity assessment is invalid.");
  if (input.decision === "BLOCKED" && input.reconciliationAction !== "REVIEW_CONFLICT") throw new Error("Blocked continuity requires explicit conflict review.");
  if (input.decision === "RECONCILIATION_REQUIRED" && input.queueState !== "SYNCING") throw new Error("Reconciliation-required state must expose syncing queue state.");
  if (input.decision === "READY" && (input.queueState !== "SYNCED" || input.reconciliationAction === "REVIEW_CONFLICT")) throw new Error("Ready continuity state is not reconciled.");
}
