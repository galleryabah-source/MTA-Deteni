export type SyncConflictKind = "SAME_RECORD_DIVERGENT_OPERATION" | "SEQUENCE_COLLISION" | "STALE_VERSION" | "AUTHORITY_CHANGED";
export type SyncConflictState = "DETECTED" | "REVIEW_REQUIRED" | "RESOLVED" | "BLOCKED";

export type SyncConflict = Readonly<{
  conflictId: string;
  recordId: string;
  kind: SyncConflictKind;
  localFingerprint: string;
  remoteFingerprint: string;
  state: SyncConflictState;
  detectedAt: string;
  resolutionNote?: string;
}>;

export function validateSyncConflict(conflict: SyncConflict): void {
  if (!conflict.conflictId.trim() || !conflict.recordId.trim() || !conflict.localFingerprint.trim() || !conflict.remoteFingerprint.trim()) throw new Error("SYNC_CONFLICT_IDENTITY_REQUIRED");
  if (conflict.localFingerprint === conflict.remoteFingerprint) throw new Error("SYNC_CONFLICT_NOT_DIVERGENT");
  if (!conflict.detectedAt.trim()) throw new Error("SYNC_CONFLICT_TIMESTAMP_REQUIRED");
}

export function assertConflictRequiresHumanReview(conflict: SyncConflict): void {
  validateSyncConflict(conflict);
  if (conflict.state !== "DETECTED" && conflict.state !== "REVIEW_REQUIRED") throw new Error("SYNC_CONFLICT_NOT_PENDING_REVIEW");
}

export function resolveSyncConflict(conflict: SyncConflict, resolutionNote: string): SyncConflict {
  validateSyncConflict(conflict);
  if (!resolutionNote.trim()) throw new Error("SYNC_CONFLICT_RESOLUTION_REQUIRED");
  if (conflict.state !== "DETECTED" && conflict.state !== "REVIEW_REQUIRED") throw new Error("SYNC_CONFLICT_NOT_RESOLVABLE");
  return { ...conflict, state: "RESOLVED", resolutionNote };
}
