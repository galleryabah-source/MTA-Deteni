import { describe, expect, it } from "vitest";
import { InMemoryDocumentPersistenceAdapter, validatePersistenceTransaction } from "../../src/lib/document-engine/persistence";

const base = {
  documentId: "DOC-SYN-TX-001",
  from: "APPROVED" as const,
  to: "ISSUED" as const,
  audit: {
    eventId: "AUD-SYN-TX-001",
    documentId: "DOC-SYN-TX-001",
    documentKind: "SURAT_IZIN_KELUAR_SEMENTARA" as const,
    action: "ISSUE" as const,
    fromLifecycle: "APPROVED" as const,
    toLifecycle: "ISSUED" as const,
    actorUserId: "USER-SYN-001",
    occurredAt: "2026-09-14T08:00:00Z",
    correlationId: "CORR-SYN-TX-001",
  },
  idempotencyKey: "IDEM-SYN-TX-001",
  requestFingerprint: "a".repeat(64),
};

describe("document persistence transaction", () => {
  it("accepts a consistent transaction envelope", () => {
    expect(() => validatePersistenceTransaction(base)).not.toThrow();
  });

  it("rejects mismatched numbering register and reservation", () => {
    expect(() => validatePersistenceTransaction({
      ...base,
      numberingReservation: { registerKey: "A", number: "A/0001/2026", sequence: 1, reservedAt: "2026-09-14T08:00:00Z" },
      numberingRegister: { registerKey: "B", documentId: base.documentId, number: "B/0001/2026", issuedAt: "2026-09-14T08:01:00Z" },
    })).toThrow("NUMBERING_REGISTER_MISMATCH");
  });

  it("allows only one commit in the reference adapter", async () => {
    const adapter = new InMemoryDocumentPersistenceAdapter();
    await adapter.executeAtomic(base);
    await expect(adapter.executeAtomic(base)).rejects.toThrow("PERSISTENCE_TRANSACTION_ALREADY_COMMITTED");
  });
});
