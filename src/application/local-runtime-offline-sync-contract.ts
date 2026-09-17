import type { OfflineMutation, OfflineMutationDisposition, OfflineMutationReceipt } from './local-runtime-offline-mutation-contract.js';
import { assertOfflineMutationContract } from './local-runtime-offline-mutation-contract.js';

export type OfflineSyncItemResult = Readonly<{
  sequence: number;
  mutationId: string;
  idempotencyKey: string;
  disposition: OfflineMutationDisposition;
  receipt?: OfflineMutationReceipt;
  syntheticOnly: true;
}>;

export type OfflineSyncBatch<TPayload = unknown> = Readonly<{
  syncId: string;
  deviceId: string;
  cursor: string;
  sequenceStart: number;
  mutations: readonly OfflineMutation<TPayload>[];
  syntheticOnly: true;
}>;

export type OfflineSyncResult = Readonly<{
  syncId: string;
  deviceId: string;
  acceptedThroughSequence: number;
  results: readonly OfflineSyncItemResult[];
  nextCursor: string;
  syntheticOnly: true;
}>;

export function assertOfflineSyncBatch(batch: OfflineSyncBatch): void {
  if (!batch.syncId.trim() || !batch.deviceId.trim() || !batch.cursor.trim()) throw new Error('Offline sync identity/cursor is required.');
  if (!Number.isInteger(batch.sequenceStart) || batch.sequenceStart < 1) throw new Error('Offline sync sequenceStart must be a positive integer.');
  if (batch.syntheticOnly !== true) throw new Error('Offline sync must remain synthetic-only.');
  let expected = batch.sequenceStart;
  for (const mutation of batch.mutations) {
    assertOfflineMutationContract(mutation);
    expected += 1;
  }
}

export function orderOfflineSyncMutations<TPayload>(mutations: readonly OfflineMutation<TPayload>[]): readonly OfflineMutation<TPayload>[] {
  return Object.freeze([...mutations]);
}
