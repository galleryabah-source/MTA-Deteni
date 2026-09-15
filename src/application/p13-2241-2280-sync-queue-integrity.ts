export type SyncQueueStatus = "READY" | "PROCESSING" | "COMPLETED" | "FAILED" | "BLOCKED";

export type SyncQueueItem = Readonly<{
  queueId: string;
  recordId: string;
  sourceEvidenceId: string;
  localVersion: number;
  status: SyncQueueStatus;
  attempt: number;
  enqueuedAt: string;
}>;

export function validateSyncQueueItem(item: SyncQueueItem): void {
  if (!item.queueId.trim() || !item.recordId.trim() || !item.sourceEvidenceId.trim()) {
    throw new Error("SYNC_QUEUE_IDENTITY_REQUIRED");
  }
  if (item.localVersion < 1 || item.attempt < 0) {
    throw new Error("SYNC_QUEUE_VERSION_INVALID");
  }
  if (!item.enqueuedAt.trim()) throw new Error("SYNC_QUEUE_TIMESTAMP_REQUIRED");
}

export function evaluateSyncQueueItem(item: SyncQueueItem): SyncQueueItem {
  validateSyncQueueItem(item);
  if (item.status === "FAILED" && item.attempt >= 3) return { ...item, status: "BLOCKED" };
  return item;
}

export function assertQueueItemMayCommit(item: SyncQueueItem): void {
  validateSyncQueueItem(item);
  if (item.status !== "COMPLETED") throw new Error("SYNC_QUEUE_COMMIT_BLOCKED");
}
