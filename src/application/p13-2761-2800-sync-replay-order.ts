export type ReplayItem = Readonly<{
  sequence: number;
  queueId: string;
  operationFingerprint: string;
  createdAt: string;
}>;

export function orderSyncReplay(items: readonly ReplayItem[]): readonly ReplayItem[] {
  for (const item of items) {
    if (!Number.isInteger(item.sequence) || item.sequence < 1 || !item.queueId.trim() || !item.operationFingerprint.trim() || !item.createdAt.trim()) {
      throw new Error("SYNC_REPLAY_ITEM_INVALID");
    }
  }
  const sorted = [...items].sort((a, b) => a.sequence - b.sequence || a.createdAt.localeCompare(b.createdAt) || a.queueId.localeCompare(b.queueId));
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index - 1].sequence === sorted[index].sequence && sorted[index - 1].operationFingerprint !== sorted[index].operationFingerprint) throw new Error("SYNC_REPLAY_SEQUENCE_COLLISION");
  }
  return sorted;
}

export function assertReplayIsContiguous(items: readonly ReplayItem[]): void {
  const ordered = orderSyncReplay(items);
  for (let index = 1; index < ordered.length; index += 1) {
    if (ordered[index].sequence !== ordered[index - 1].sequence + 1) throw new Error("SYNC_REPLAY_SEQUENCE_GAP");
  }
}
