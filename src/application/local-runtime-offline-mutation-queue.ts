import type { OfflineMutation, OfflineMutationDisposition } from './local-runtime-offline-mutation-contract.js';
import { assertOfflineMutationContract, classifyOfflineMutationReplay, classifyOfflineMutationBaseVersion } from './local-runtime-offline-mutation-contract.js';

export class LocalRuntimeOfflineMutationQueue {
  private readonly items = new Map<string, OfflineMutation>();

  enqueue(mutation: OfflineMutation): void {
    assertOfflineMutationContract(mutation);
    const existing = this.items.get(mutation.idempotencyKey);
    if (existing) {
      const disposition = classifyOfflineMutationReplay(existing, mutation);
      if (disposition.status === 'CONFLICT') throw new Error('Offline mutation conflict: same idempotency key has a different fingerprint.');
      return;
    }
    this.items.set(mutation.idempotencyKey, mutation);
  }

  get(idempotencyKey: string): OfflineMutation | undefined { return this.items.get(idempotencyKey); }

  admit(mutation: OfflineMutation, currentVersion: string): OfflineMutationDisposition {
    const existing = this.items.get(mutation.idempotencyKey);
    if (existing) return classifyOfflineMutationReplay(existing, mutation);
    return classifyOfflineMutationBaseVersion(mutation, currentVersion);
  }

  markApplied(idempotencyKey: string, resultingVersion: string): void {
    const existing = this.items.get(idempotencyKey);
    if (!existing) throw new Error('Offline mutation does not exist.');
    this.items.set(idempotencyKey, Object.freeze({ ...existing, status: 'APPLIED' }));
    void resultingVersion;
  }

  list(): readonly OfflineMutation[] { return Object.freeze([...this.items.values()]); }
}
