import type { IdempotencyRecord } from "./idempotency-contract.js";
import { resolveIdempotency } from "./idempotency-contract.js";
import type { DatabaseTransaction } from "./database-adapter-contract.js";
import type { TransactionContext } from "./transaction-contract.js";

export type TransactionIdempotencyDecision = "EXECUTE" | "REPLAY" | "CONFLICT";

export type TransactionIdempotencyBoundary = Readonly<{
  transactionId: string;
  idempotencyKey: string;
  requestHash: string;
  decision: TransactionIdempotencyDecision;
}>;

export function resolveTransactionIdempotency(
  context: TransactionContext,
  existing: IdempotencyRecord | undefined,
  requestHash: string,
): TransactionIdempotencyBoundary {
  const transactionId = context.transactionId.trim();
  const idempotencyKey = context.idempotencyKey?.trim() ?? "";
  const normalizedRequestHash = requestHash.trim();

  if (!transactionId) throw new Error("TRANSACTION_ID_REQUIRED");
  if (!idempotencyKey) throw new Error("IDEMPOTENCY_KEY_REQUIRED");
  if (!normalizedRequestHash) throw new Error("REQUEST_HASH_REQUIRED");

  const decision = resolveIdempotency(existing, normalizedRequestHash);
  return Object.freeze({ transactionId, idempotencyKey, requestHash: normalizedRequestHash, decision });
}

export async function withDatabaseTransaction<T>(
  transaction: DatabaseTransaction,
  work: (transaction: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  try {
    const value = await work(transaction);
    await transaction.commit();
    return value;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
