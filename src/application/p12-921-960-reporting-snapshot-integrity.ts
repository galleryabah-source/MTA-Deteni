import type { CanonicalOperationalEnvelope } from "./p12-841-880-canonical-operational-envelope.js";

export type ReportingSnapshotIntegrity = Readonly<{
  snapshotId: string;
  sourceVersion: string;
  sourceOperationIds: readonly string[];
  generatedAt: string;
  deterministicKey: string;
}>;

export function buildReportingSnapshotIntegrity<T>(snapshotId: string, sourceVersion: string, operations: readonly CanonicalOperationalEnvelope<T>[], generatedAt: string): ReportingSnapshotIntegrity {
  if (!snapshotId.trim() || !sourceVersion.trim() || !generatedAt.trim() || operations.length === 0) throw new Error("REPORT_SNAPSHOT_SOURCE_REQUIRED");
  const ids = operations.map((operation) => operation.operationId);
  if (new Set(ids).size !== ids.length) throw new Error("REPORT_SNAPSHOT_DUPLICATE_OPERATION");
  return { snapshotId, sourceVersion, sourceOperationIds: ids, generatedAt, deterministicKey: `${sourceVersion}:${ids.join(",")}` };
}
