import { assertReportingArtifactIntegrity, type ReportingArtifact } from "./reporting-artifact.js";
import type { ReportingSnapshot } from "../domain/reporting/snapshot.js";

export type ReportingExportEnvelope = Readonly<{
  exportId: string;
  artifactId: string;
  snapshotId: string;
  sourceRevision: string;
  content: string;
  createdAt: string;
  syntheticOnly: true;
}>;

export function createReportingExportEnvelope(input: Readonly<{
  exportId: string;
  artifact: ReportingArtifact;
  snapshot: ReportingSnapshot;
  createdAt: string;
}>): ReportingExportEnvelope {
  if (!input.exportId.trim() || !input.createdAt.trim()) throw new Error("Reporting export identity and timestamp are required.");
  assertReportingArtifactIntegrity(input.artifact, input.snapshot);
  return Object.freeze({
    exportId: input.exportId,
    artifactId: input.artifact.artifactId,
    snapshotId: input.snapshot.snapshotId,
    sourceRevision: input.snapshot.sourceRevision,
    content: input.artifact.canonicalSnapshot,
    createdAt: input.createdAt,
    syntheticOnly: true,
  });
}

export function assertReportingExportEnvelope(envelope: ReportingExportEnvelope, artifact: ReportingArtifact, snapshot: ReportingSnapshot): void {
  if (!envelope.syntheticOnly) throw new Error("Reporting export must be synthetic-only.");
  assertReportingArtifactIntegrity(artifact, snapshot);
  if (envelope.artifactId !== artifact.artifactId || envelope.snapshotId !== snapshot.snapshotId || envelope.sourceRevision !== snapshot.sourceRevision) {
    throw new Error("Reporting export binding mismatch.");
  }
  if (envelope.content !== artifact.canonicalSnapshot) throw new Error("Reporting export content mismatch.");
}
