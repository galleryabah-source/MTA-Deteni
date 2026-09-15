import { assertContinuityEvidence, createContinuityEvidence } from "./continuity-evidence.js";
import { enqueueOfflineCommand, reconcileOfflineCommand, type OfflineCommand } from "./offline-continuity.js";
import { assertBackupChain, assertBackupManifest, assertBrowserTransportRequest, assertLanSession, assertLocalAdapterBoundary, MemoryQueueAdapter, type BackupManifest, type LanSession } from "./runtime-adapters.js";
import { type LanDeviceIdentity, type LocalServiceBoundary } from "./runtime-surface.js";
import { canonicalizeReportingSnapshot, createReportingSnapshot, type ReportingSnapshot } from "../domain/reporting/snapshot.js";

export type ContinuityJourneyInput = Readonly<{
  command: Omit<OfflineCommand, "state">;
  device: LanDeviceIdentity;
  localBoundary: LocalServiceBoundary;
  session: LanSession;
  backup: BackupManifest;
  previousBackup?: BackupManifest;
  now: string;
  executionId: string;
  commitSha: string;
}>;

export type ContinuityJourneyResult = Readonly<{
  command: OfflineCommand;
  reconciliation: "APPLY" | "SKIP_DUPLICATE" | "REVIEW_CONFLICT";
  snapshot: ReportingSnapshot;
  snapshotCanonical: string;
  evidenceResult: "PASS";
}>;

/** Synthetic-only orchestration seam: no network, database, filesystem, or production data access. */
export async function executeSyntheticContinuityJourney(input: ContinuityJourneyInput): Promise<ContinuityJourneyResult> {
  const command = enqueueOfflineCommand(input.command);
  const queue = new MemoryQueueAdapter<OfflineCommand>();
  await queue.append(command);
  const queued = await queue.list();

  assertBrowserTransportRequest({
    requestId: `req-${command.commandId}`,
    actorId: input.device.deviceId,
    device: input.device,
    method: "POST",
    path: "/synthetic/continuity/reconcile",
    idempotencyKey: command.idempotencyKey,
  });
  assertLanSession(input.session, input.device, input.now);
  assertLocalAdapterBoundary(input.localBoundary, input.device);
  assertBackupManifest(input.backup);
  assertBackupChain(input.previousBackup, input.backup);

  const reconciliation = reconcileOfflineCommand({
    command: queued[0],
    existingIdempotencyKeys: [],
    aggregateRevisionMatches: true,
  }).action;
  if (reconciliation !== "APPLY") throw new Error(`Synthetic continuity journey expected APPLY, received ${reconciliation}.`);

  const snapshot = createReportingSnapshot({
    snapshotId: `snapshot-${command.commandId}`,
    generatedAt: input.now,
    sourceRevision: command.payloadHash,
    rows: [{ commandId: command.commandId, aggregateId: command.aggregateId, reconciliation, backupId: input.backup.backupId }],
  });
  const snapshotCanonical = canonicalizeReportingSnapshot(snapshot);
  const evidence = createContinuityEvidence({
    controlId: "P13.5967-6040",
    executionId: input.executionId,
    commitSha: input.commitSha,
    environment: "controlled-nonprod",
    occurredAt: input.now,
    result: "PASS",
  });
  assertContinuityEvidence(evidence);

  return { command, reconciliation, snapshot, snapshotCanonical, evidenceResult: "PASS" };
}
