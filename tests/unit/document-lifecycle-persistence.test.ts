import { describe, expect, it } from "vitest";
import { InMemoryDocumentLifecycleRepository } from "../../src/lib/document-engine/lifecycle-persistence";
import type { DocumentAuditEvent } from "../../src/lib/document-engine/audit-hook";

const audit = (from: "DRAFT" | "GENERATED", to: "GENERATED" | "REVIEWED"): DocumentAuditEvent => ({
  eventId: `AUD-${from}-${to}`,
  documentId: "DOC-SYN-LIFE-001",
  documentKind: "SURAT_IZIN_KELUAR_SEMENTARA",
  action: to === "GENERATED" ? "GENERATE" : "REVIEW",
  fromLifecycle: from,
  toLifecycle: to,
  actorUserId: "USER-SYN-001",
  occurredAt: "2026-09-14T08:00:00Z",
  correlationId: "CORR-SYN-001",
});

describe("document lifecycle persistence", () => {
  it("couples a transition to matching audit identity", async () => {
    const repository = new InMemoryDocumentLifecycleRepository();
    await repository.transition({
      documentId: "DOC-SYN-LIFE-001",
      from: "DRAFT",
      to: "GENERATED",
      actorUserId: "USER-SYN-001",
      occurredAt: "2026-09-14T08:00:00Z",
      correlationId: "CORR-SYN-001",
    }, audit("DRAFT", "GENERATED"));
    expect(await repository.getLifecycle("DOC-SYN-LIFE-001")).toBe("GENERATED");
  });

  it("rejects stale transitions", async () => {
    const repository = new InMemoryDocumentLifecycleRepository();
    const input = {
      documentId: "DOC-SYN-LIFE-002",
      from: "DRAFT" as const,
      to: "GENERATED" as const,
      actorUserId: "USER-SYN-001",
      occurredAt: "2026-09-14T08:00:00Z",
      correlationId: "CORR-SYN-002",
    };
    await repository.transition(input, { ...audit("DRAFT", "GENERATED"), documentId: input.documentId, correlationId: input.correlationId });
    await expect(repository.transition(input, { ...audit("DRAFT", "GENERATED"), documentId: input.documentId, correlationId: input.correlationId }))
      .rejects.toThrow("STALE_DOCUMENT_LIFECYCLE");
  });

  it("rejects audit mismatch before changing state", async () => {
    const repository = new InMemoryDocumentLifecycleRepository();
    await expect(repository.transition({
      documentId: "DOC-SYN-LIFE-003",
      from: "DRAFT",
      to: "GENERATED",
      actorUserId: "USER-SYN-001",
      occurredAt: "2026-09-14T08:00:00Z",
      correlationId: "CORR-SYN-003",
    }, { ...audit("DRAFT", "GENERATED"), correlationId: "WRONG" })).rejects.toThrow("AUDIT_TRANSITION_MISMATCH");
    expect(await repository.getLifecycle("DOC-SYN-LIFE-003")).toBeUndefined();
  });
});
