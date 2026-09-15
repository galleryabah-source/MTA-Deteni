export type JournalEntryState = "APPENDED" | "APPLIED" | "REJECTED" | "BLOCKED";

export type DurableSyncJournalEntry = Readonly<{
  sequence: number;
  queueId: string;
  recordId: string;
  sourceEvidenceId: string;
  operationFingerprint: string;
  state: JournalEntryState;
  createdAt: string;
}>;

export function validateJournalEntry(entry: DurableSyncJournalEntry): void {
  if (!Number.isInteger(entry.sequence) || entry.sequence < 1) throw new Error("SYNC_JOURNAL_SEQUENCE_INVALID");
  if (!entry.queueId.trim() || !entry.recordId.trim() || !entry.sourceEvidenceId.trim() || !entry.operationFingerprint.trim()) {
    throw new Error("SYNC_JOURNAL_IDENTITY_REQUIRED");
  }
  if (!entry.createdAt.trim()) throw new Error("SYNC_JOURNAL_TIMESTAMP_REQUIRED");
}

export function assertJournalMayApply(entry: DurableSyncJournalEntry): void {
  validateJournalEntry(entry);
  if (entry.state !== "APPENDED") throw new Error("SYNC_JOURNAL_APPLY_BLOCKED");
}
