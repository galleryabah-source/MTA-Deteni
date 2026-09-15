import { createReportingSnapshot, type ReportingSnapshot } from "../domain/reporting/snapshot.js";
import type { ReconnectEvidence } from "./reconnect-evidence.js";

export type ReconnectReportingInput = Readonly<{
  snapshotId: string;
  generatedAt: string;
  evidence: ReconnectEvidence;
}>;

export function projectReconnectEvidence(input: ReconnectReportingInput): ReportingSnapshot {
  if (!input.evidence.syntheticOnly) throw new Error("Reporting projection requires synthetic reconnect evidence.");
  if (!input.snapshotId.trim() || !input.generatedAt.trim()) throw new Error("Reporting projection identity is required.");
  return createReportingSnapshot({
    snapshotId: input.snapshotId,
    generatedAt: input.generatedAt,
    sourceRevision: input.evidence.commandId,
    rows: [{
      evidenceId: input.evidence.evidenceId,
      commandId: input.evidence.commandId,
      aggregateId: input.evidence.aggregateId,
      decision: input.evidence.decision,
      fromState: input.evidence.fromState,
      toState: input.evidence.toState,
      payloadHash: input.evidence.payloadHash,
      idempotencyKey: input.evidence.idempotencyKey,
      recordedAt: input.evidence.recordedAt,
    }],
  });
}
