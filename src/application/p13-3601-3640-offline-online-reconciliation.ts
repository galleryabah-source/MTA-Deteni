export type ReconciliationItem = Readonly<{
  recordId: string;
  localVersion: number;
  canonicalVersion: number;
  operationFingerprint: string;
  canonicalFingerprint: string;
}>;

export function assertOfflineOnlineReconciliation(items: readonly ReconciliationItem[]): void {
  if (items.length === 0) throw new Error("RECONCILIATION_ITEMS_REQUIRED");
  for (const item of items) {
    if (!item.recordId.trim() || !item.operationFingerprint.trim() || !item.canonicalFingerprint.trim()) throw new Error("RECONCILIATION_IDENTITY_REQUIRED");
    if (item.localVersion !== item.canonicalVersion || item.operationFingerprint !== item.canonicalFingerprint) throw new Error(`RECONCILIATION_MISMATCH:${item.recordId}`);
  }
}
