import { describe, expect, it } from "vitest";
import { InMemoryDocumentNumberAllocator } from "../../src/lib/document-engine/numbering";
import { validateDocumentAuditEvent } from "../../src/lib/document-engine/audit-hook";

describe("document numbering and audit contracts", () => {
  it("prevents duplicate committed numbers", () => {
    const allocator = new InMemoryDocumentNumberAllocator();
    const reservation = allocator.reserve({ prefix: "MTA", year: 2026, sequence: 1 });
    allocator.commit(reservation, "DOC-SYN-001", "2026-09-14T08:00:00Z");
    expect(() => allocator.commit(reservation, "DOC-SYN-002", "2026-09-14T08:01:00Z"))
      .toThrow("DOCUMENT_NUMBER_ALREADY_COMMITTED");
  });

  it("rejects malformed audit integrity metadata", () => {
    expect(() => validateDocumentAuditEvent({
      eventId: "EVT-SYN-001",
      documentId: "DOC-SYN-001",
      documentKind: "SURAT_IZIN_KELUAR_SEMENTARA",
      action: "ISSUE",
      actorUserId: "USER-SYN-001",
      occurredAt: "2026-09-14T08:00:00Z",
      correlationId: "CORR-SYN-001",
      documentContentHash: "not-a-sha256",
    })).toThrow("INVALID_DOCUMENT_AUDIT_HASH");
  });
});
