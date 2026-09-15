import { canonicalizeReportingSnapshot, type ReportingSnapshot } from "../domain/reporting/snapshot.js";
import { assertReconnectProjectionIntegrity } from "./reconnect-reporting.js";
import type { ReconnectEvidence } from "./reconnect-evidence.js";

export type ReportingArtifact = Readonly<{
  artifactId: string;
  snapshotId: string;
  sourceRevision: string;
  canonicalSnapshot: string;
  createdAt: string;
  syntheticOnly: true;
}>;

export function createReconnectReportingArtifact(input: Readonly<{
  artifactId: string;
  createdAt: string;
  snapshot: ReportingSnapshot;
  evidence: ReconnectEvidence;
}>): ReportingArtifact {
  if (!input.artifactId.trim() || !input.createdAt.trim()) throw new Error("Reporting artifact identity and timestamp are required.");
  assertReconnectProjectionIntegrity(input.snapshot, input.evidence);
  const canonicalSnapshot = canonicalizeReportingSnapshot(input.snapshot);
  return Object.freeze({
    artifactId: input.artifactId,
    snapshotId: input.snapshot.snapshotId,
    sourceRevision: input.snapshot.sourceRevision,
    canonicalSnapshot,
    createdAt: input.createdAt,
    syntheticOnly: true,
  });
}

export function assertReportingArtifactIntegrity(artifact: ReportingArtifact, snapshot: ReportingSnapshot): void {
  if (!artifact.syntheticOnly) throw new Error("Reporting artifact must be synthetic-only.");
  if (artifact.snapshotId !== snapshot.snapshotId || artifact.sourceRevision !== snapshot.sourceRevision) {
    throw new Error("Reporting artifact snapshot binding mismatch.");
  }
  if (artifact.canonicalSnapshot !== canonicalizeReportingSnapshot(snapshot)) {
    throw new Error("Reporting artifact canonical snapshot mismatch.");
  }
}
