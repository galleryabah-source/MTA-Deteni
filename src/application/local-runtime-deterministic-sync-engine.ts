import type { OfflineMutationDisposition, OfflineMutation } from './local-runtime-offline-mutation-contract.js';
import { LocalRuntimeOfflineMutationQueue } from './local-runtime-offline-mutation-queue.js';
import type { OfflineSyncBatch, OfflineSyncItemResult, OfflineSyncResult } from './local-runtime-offline-sync-contract.js';
import { assertOfflineSyncBatch } from './local-runtime-offline-sync-contract.js';

export class LocalRuntimeDeterministicSyncEngine {
  constructor(private readonly queue = new LocalRuntimeOfflineMutationQueue()) {}

  enqueue(mutation: OfflineMutation): void { this.queue.enqueue(mutation); }

  buildResult(batch: OfflineSyncBatch, currentVersions: ReadonlyMap<string, string>): OfflineSyncResult {
    assertOfflineSyncBatch(batch);
    const results: OfflineSyncItemResult[] = [];
    let acceptedThroughSequence = batch.sequenceStart - 1;
    for (let index = 0; index < batch.mutations.length; index += 1) {
      const mutation = batch.mutations[index]!;
      const currentVersion = currentVersions.get(mutation.aggregateId);
      if (!currentVersion) throw new Error(`Missing current version for aggregate ${mutation.aggregateId}.`);
      const disposition: OfflineMutationDisposition = this.queue.admit(mutation, currentVersion);
      results.push(Object.freeze({ sequence: batch.sequenceStart + index, mutationId: mutation.mutationId, idempotencyKey: mutation.idempotencyKey, disposition, syntheticOnly: true }));
      if (disposition.status === 'APPLIED' || disposition.status === 'REPLAYED') acceptedThroughSequence = batch.sequenceStart + index;
      else break;
    }
    return Object.freeze({ syncId: batch.syncId, deviceId: batch.deviceId, acceptedThroughSequence, results: Object.freeze(results), nextCursor: `${batch.cursor}:${acceptedThroughSequence + 1}`, syntheticOnly: true });
  }
}
