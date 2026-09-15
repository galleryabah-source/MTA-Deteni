export type SyncState = "LOCAL_ONLY" | "PENDING_SYNC" | "SYNCED" | "CONFLICT" | "BLOCKED";

export type LocalFirstRecord = Readonly<{
  recordId: string;
  sourceEvidenceId: string;
  syncState: SyncState;
  localVersion: number;
  serverVersion?: number;
}>;

export function evaluateLocalFirstSync(record: LocalFirstRecord): LocalFirstRecord {
  if (!record.recordId.trim() || !record.sourceEvidenceId.trim() || record.localVersion < 1) throw new Error("LOCAL_FIRST_IDENTITY_INVALID");
  if (record.syncState === "CONFLICT") return { ...record, syncState: "BLOCKED" };
  return record;
}

export function assertSyncDoesNotAuthorizeMutation(record: LocalFirstRecord): void {
  if (record.syncState !== "SYNCED") throw new Error("SYNC_NOT_CERTIFIED");
}
