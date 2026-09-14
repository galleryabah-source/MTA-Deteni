import { describe, expect, it } from "vitest";
import {
  assertPersistenceTransactionContext,
  POSTGRES_PERSISTENCE_CONCURRENCY_CONTRACT,
} from "../../src/lib/document-engine/postgres-persistence-contract";

describe("postgres persistence contract", () => {
  it("requires a valid transaction context", () => {
    expect(() => assertPersistenceTransactionContext({ transactionId: "TX-1", correlationId: "CORR-1", isolationLevel: "READ_COMMITTED" })).not.toThrow();
  });

  it("rejects invalid transaction identity", () => {
    expect(() => assertPersistenceTransactionContext({ transactionId: "", correlationId: "CORR-1", isolationLevel: "READ_COMMITTED" })).toThrow("INVALID_TRANSACTION_ID");
  });

  it("declares atomic concurrency requirements", () => {
    expect(POSTGRES_PERSISTENCE_CONCURRENCY_CONTRACT).toEqual({
      optimisticLifecycleCheck: true,
      serializedNumberingCommit: true,
      atomicIdempotencyReservation: true,
      atomicOutboxLinkage: true,
    });
  });
});
