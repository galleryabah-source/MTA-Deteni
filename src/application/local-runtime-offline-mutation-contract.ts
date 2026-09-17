export type OfflineMutationStatus = 'QUEUED' | 'APPLYING' | 'APPLIED' | 'CONFLICT' | 'REJECTED';

export type OfflineMutation<TPayload = unknown> = Readonly<{
  mutationId: string;
  idempotencyKey: string;
  aggregateType: string;
  aggregateId: string;
  operation: string;
  payload: TPayload;
  baseVersion: string;
  payloadFingerprint: string;
  status: OfflineMutationStatus;
  createdAt: string;
  syntheticOnly: true;
}>;

export type OfflineMutationDisposition = Readonly<{
  mutationId: string;
  idempotencyKey: string;
  status: 'APPLIED' | 'REPLAYED' | 'CONFLICT' | 'REJECTED';
  effectApplied: boolean;
  reasonCode?: 'IDEMPOTENT_REPLAY' | 'FINGERPRINT_CONFLICT' | 'BASE_VERSION_CONFLICT' | 'INVALID_MUTATION';
  resultingVersion?: string;
  syntheticOnly: true;
}>;

export function assertOfflineMutationContract(mutation: OfflineMutation): void {
  if (!mutation.mutationId.trim() || !mutation.idempotencyKey.trim()) throw new Error('Offline mutation identity is required.');
  if (!mutation.aggregateType.trim() || !mutation.aggregateId.trim() || !mutation.operation.trim()) throw new Error('Offline mutation aggregate identity is required.');
  if (!mutation.baseVersion.trim() || !mutation.payloadFingerprint.trim()) throw new Error('Offline mutation version/fingerprint is required.');
  if (mutation.syntheticOnly !== true) throw new Error('Offline mutation must remain synthetic-only.');
}

export function classifyOfflineMutationReplay(existing: OfflineMutation, incoming: OfflineMutation): OfflineMutationDisposition {
  assertOfflineMutationContract(existing);
  assertOfflineMutationContract(incoming);
  if (existing.idempotencyKey !== incoming.idempotencyKey) throw new Error('Offline mutation idempotency identity mismatch.');
  if (existing.payloadFingerprint === incoming.payloadFingerprint) {
    return Object.freeze({ mutationId: incoming.mutationId, idempotencyKey: incoming.idempotencyKey, status: 'REPLAYED', effectApplied: false, reasonCode: 'IDEMPOTENT_REPLAY', syntheticOnly: true });
  }
  return Object.freeze({ mutationId: incoming.mutationId, idempotencyKey: incoming.idempotencyKey, status: 'CONFLICT', effectApplied: false, reasonCode: 'FINGERPRINT_CONFLICT', syntheticOnly: true });
}

export function classifyOfflineMutationBaseVersion(mutation: OfflineMutation, currentVersion: string): OfflineMutationDisposition {
  assertOfflineMutationContract(mutation);
  if (!currentVersion.trim()) throw new Error('Current aggregate version is required.');
  if (mutation.baseVersion !== currentVersion) return Object.freeze({ mutationId: mutation.mutationId, idempotencyKey: mutation.idempotencyKey, status: 'CONFLICT', effectApplied: false, reasonCode: 'BASE_VERSION_CONFLICT', syntheticOnly: true });
  return Object.freeze({ mutationId: mutation.mutationId, idempotencyKey: mutation.idempotencyKey, status: 'APPLIED', effectApplied: true, resultingVersion: currentVersion, syntheticOnly: true });
}
