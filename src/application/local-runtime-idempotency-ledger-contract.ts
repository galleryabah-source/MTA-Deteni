export type IdempotencyLedgerStatus = 'IN_FLIGHT' | 'APPLIED' | 'REJECTED' | 'CONFLICT';

export type IdempotencyLedgerEntry = Readonly<{
  idempotencyKey: string;
  mutationId: string;
  payloadFingerprint: string;
  aggregateType: string;
  aggregateId: string;
  status: IdempotencyLedgerStatus;
  resultingVersion?: string;
  receiptId?: string;
  recordedAt: string;
  syntheticOnly: true;
}>;

export type IdempotencyLedgerDisposition = Readonly<{
  status: 'NEW' | 'REPLAYED' | 'CONFLICT';
  effectAllowed: boolean;
  reasonCode?: 'IDEMPOTENT_REPLAY' | 'FINGERPRINT_CONFLICT';
  syntheticOnly: true;
}>;

export function assertIdempotencyLedgerEntry(entry: IdempotencyLedgerEntry): void {
  const required = [entry.idempotencyKey, entry.mutationId, entry.payloadFingerprint, entry.aggregateType, entry.aggregateId, entry.recordedAt];
  if (required.some((value) => !value.trim())) throw new Error('Idempotency ledger identity is required.');
  if (entry.syntheticOnly !== true) throw new Error('Idempotency ledger must remain synthetic-only.');
}

export function classifyIdempotency(existing: IdempotencyLedgerEntry | undefined, incoming: Pick<IdempotencyLedgerEntry, 'idempotencyKey' | 'payloadFingerprint'>): IdempotencyLedgerDisposition {
  if (!existing) return Object.freeze({ status: 'NEW', effectAllowed: true, syntheticOnly: true });
  if (existing.idempotencyKey !== incoming.idempotencyKey) throw new Error('Idempotency key mismatch.');
  if (existing.payloadFingerprint === incoming.payloadFingerprint) return Object.freeze({ status: 'REPLAYED', effectAllowed: false, reasonCode: 'IDEMPOTENT_REPLAY', syntheticOnly: true });
  return Object.freeze({ status: 'CONFLICT', effectAllowed: false, reasonCode: 'FINGERPRINT_CONFLICT', syntheticOnly: true });
}
