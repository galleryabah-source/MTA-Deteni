import type { OfflineCommand, QueueState } from "./offline-continuity.js";
import { canonicalizeReportingSnapshot, type ReportingSnapshot } from "../domain/reporting/snapshot.js";
import type { RepositoryEntity } from "./repository-contract.js";

export type ReconciliationStatus = "CONSISTENT" | "REPLAY_REQUIRED" | "CONFLICT" | "MISSING_PROJECTION";

export type ReconciliationInput<T extends RepositoryEntity> = Readonly<{
  entity: T;
  command?: OfflineCommand;
  projection?: ReportingSnapshot;
  expectedProjectionSourceRevision: string;
}>;

export type ReconciliationResult = Readonly<{
  status: ReconciliationStatus;
  entityId: string;
  entityVersion: number;
  commandId?: string;
  projectionSnapshotId?: string;
  canonicalFingerprint: string;
}>;

function canonicalize(value: unknown): string {
  return JSON.stringify(value);
}

export function reconcileRepositoryQueueProjection<T extends RepositoryEntity>(input: ReconciliationInput<T>): ReconciliationResult {
  if (!input.entity.id.trim() || input.entity.version < 1) throw new Error("Repository entity identity/version is invalid.");
  if (!input.expectedProjectionSourceRevision.trim()) throw new Error("Expected projection source revision is required.");

  const command = input.command;
  const projection = input.projection;
  if (!projection) {
    return Object.freeze({
      status: "MISSING_PROJECTION",
      entityId: input.entity.id,
      entityVersion: input.entity.version,
      ...(command ? { commandId: command.commandId } : {}),
      canonicalFingerprint: canonicalize({ entity: input.entity, command: command ?? null, projection: null }),
    });
  }

  const projectionCanonical = canonicalizeReportingSnapshot(projection);
  if (projection.sourceRevision !== input.expectedProjectionSourceRevision) {
    return Object.freeze({
      status: "CONFLICT",
      entityId: input.entity.id,
      entityVersion: input.entity.version,
      ...(command ? { commandId: command.commandId } : {}),
      projectionSnapshotId: projection.snapshotId,
      canonicalFingerprint: projectionCanonical,
    });
  }

  if (!command) {
    return Object.freeze({
      status: "CONSISTENT",
      entityId: input.entity.id,
      entityVersion: input.entity.version,
      projectionSnapshotId: projection.snapshotId,
      canonicalFingerprint: projectionCanonical,
    });
  }

  if (command.aggregateId !== input.entity.id) {
    return Object.freeze({
      status: "CONFLICT",
      entityId: input.entity.id,
      entityVersion: input.entity.version,
      commandId: command.commandId,
      projectionSnapshotId: projection.snapshotId,
      canonicalFingerprint: projectionCanonical,
    });
  }

  const unresolved: readonly QueueState[] = ["PENDING", "SYNCING"];
  const status: ReconciliationStatus = unresolved.includes(command.state) ? "REPLAY_REQUIRED" : command.state === "CONFLICT" || command.state === "FAILED" ? "CONFLICT" : "CONSISTENT";
  return Object.freeze({
    status,
    entityId: input.entity.id,
    entityVersion: input.entity.version,
    commandId: command.commandId,
    projectionSnapshotId: projection.snapshotId,
    canonicalFingerprint: projectionCanonical,
  });
}

export function assertReconciliationSafe(result: ReconciliationResult): void {
  if (result.status === "CONFLICT" || result.status === "MISSING_PROJECTION") throw new Error(`Reconciliation is not safe: ${result.status}.`);
}
