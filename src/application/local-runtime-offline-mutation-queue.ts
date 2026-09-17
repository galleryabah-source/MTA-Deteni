import type { OfflineMutation, OfflineMutationDisposition, OfflineMutationReceipt } from './local-runtime-offline-mutation-contract.js';
import { assertOfflineMutationContract, classifyOfflineMutationReplay, classifyOfflineMutationBaseVersion } from './local-runtime-offline-mutation-contract.js';

export class LocalRuntimeOfflineMutationQueue {
  private readonly items = new Map<string, OfflineMutation>();
  private readonly receipts = new Map<string, OfflineMutationReceipt>();

  enqueue(mutation: OfflineMutation): OfflineMutationDisposition {
    assertOfflineMutationContract(mutation);
    const existing = this.items.get(mutation.idempotencyKey);
    if (existing) {
      const disposition = classifyOfflineMutationReplay(existing, mutation);
      if (disposition.status === 'CONFLICT') throw new Error('Offline mutation conflict: same idempotency key has a different fingerprint.');
      return disposition;
    }
    this.items.set(mutation.idempotencyKey, mutation);
    return Object.freeze({ mutationId: mutation.mutationId, idempotencyKey: mutation.idempotencyKey, status: 'APPLIED', effectApplied: false, syntheticOnly: true });
  }

  get(idempotencyKey: string): OfflineMutation | undefined { return this.items.get(idempotencyKey); }

  getReceipt(idempotencyKey: string): OfflineMutationReceipt | undefined { return this.receipts.get(idempotencyKey); }

  admit(mutation: OfflineMutation, currentVersion: string): OfflineMutationDisposition {
    const existing = this.items.get(mutation.idempotencyKey);
    if (existing) return classifyOfflineMutationReplay(existing, mutation);
    return classifyOfflineMutationBaseVersion(mutation, currentVersion);
  }

  markApplied(idempotencyKey: string, resultingVersion: string, acknowledgedAt = new Date().toISOString()): OfflineMutationReceipt {
    if (!resultingVersion.trim()) throw new Error('Resulting aggregate version is required.');
    const existing = this.items.get(idempotencyKey);
    if (!existing) throw new Error('Offline mutation does not exist.');
    const updated = Object.freeze({ ...existing, status: 'APPLIED' as const });
    this.items.set(idempotencyKey, updated);
    const receipt = Object.freeze({ mutationId: existing.mutationId, idempotencyKey, status: 'APPLIED' as const, effectApplied: true, resultingVersion, acknowledgedAt, syntheticOnly: true as const });
    this.receipts.set(idempotencyKey, receipt);
    return receipt;
  }

  markConflict(idempotencyKey: string, acknowledgedAt = new Date().toISOString()): OfflineMutationReceipt {
    const existing = this.items.get(idempotencyKey);
    if (!existing) throw new Error('Offline mutation does not exist.');
    this.items.set(idempotencyKey, Object.freeze({ ...existing, status: 'CONFLICT' as const }));
    const receipt = Object.freeze({ mutationId: existing.mutationId, idempotencyKey, status: 'CONFLICT' as const, effectApplied: false, acknowledgedAt, syntheticOnly: true as const });
    this.receipts.set(idempotencyKey, receipt);
    return receipt;
  }

  list(): readonly OfflineMutation[] { return Object.freeze([...this.items.values()]); }
  listReceipts(): readonly OfflineMutationReceipt[] { return Object.freeze([...this.receipts.values()]); }
}
