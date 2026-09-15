import { assertCanonicalReportingSnapshot, createReportingSnapshot, type ReportingSnapshot } from "../domain/reporting/snapshot.js";
import type { ReconnectEvidence } from "./reconnect-evidence.js";

export type ReconnectReportingInput = Readonly<{
  snapshotId: string;
  generatedAt: string;
  evidence: ReconnectEvidence;
}>;

export function projectReconnectEvidence(input: ReconnectReportingInput): ReportingSnapshot {
  if (!input.evidence.syntheticOnly) throw new Error("Reporting projection requires synthetic reconnect evidence.");
  if (!input.snapshotId.trim() || !input.generatedAt.trim()) throw new Error("Reporting projection identity is required.");
  const snapshot = createReportingSnapshot({
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
  assertReconnectProjectionIntegrity(snapshot, input.evidence);
  return snapshot;
}

export function assertReconnectProjectionIntegrity(snapshot: ReportingSnapshot, evidence: ReconnectEvidence): void {
  if (!evidence.syntheticOnly) throw new Error("Reconnect projection integrity requires synthetic evidence.");
  if (snapshot.sourceRevision !== evidence.commandId) throw new Error("Reconnect reporting source revision mismatch.");
  if (snapshot.rows.length !== 1) throw new Error("Reconnect reporting projection must contain exactly one evidence row.");
  const row = snapshot.rows[0];
  if (!row || row.evidenceId !== evidence.evidenceId || row.commandId !== evidence.commandId || row.aggregateId !== evidence.aggregateId) {
    throw new Error("Reconnect reporting evidence identity mismatch.");
  }
  if (row.decision !== evidence.decision || row.fromState !== evidence.fromState || row.toState !== evidence.toState) {
    throw new Error("Reconnect reporting decision/state mismatch.");
  }
  if (row.payloadHash !== evidence.payloadHash || row.idempotencyKey !== evidence.idempotencyKey || row.recordedAt !== evidence.recordedAt) {
    throw new Error("Reconnect reporting evidence material mismatch.");
  }
}

export function assertReconnectProjectionCanonical(snapshot: ReportingSnapshot, expectedCanonical: string): void {
  assertCanonicalReportingSnapshot(snapshot, expectedCanonical);
}
