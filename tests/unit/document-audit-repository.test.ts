import { describe, expect, it } from "vitest";
import { InMemoryDocumentAuditRepository } from "../../src/lib/document-engine/audit-repository";
import type { DocumentAuditEvent } from "../../src/lib/document-engine/audit-hook";

const makeEvent = (eventId: string, action: DocumentAuditEvent["action"] = "GENERATE"): DocumentAuditEvent => ({
  eventId,
  documentId: "DOC-SYN-001",
  documentKind: "SURAT_IZIN_KELUAR_SEMENTARA",
  action,
  actorUserId: "USER-SYN-001",
  occurredAt: "2026-09-14T08:00:00Z",
  correlationId: "CORR-SYN-001",
  documentContentHash: "a".repeat(64),
});

describe("document audit repository", () => {
  it("is append-only and rejects duplicate event IDs", async () => {
    const repository = new InMemoryDocumentAuditRepository();
    await repository.append(makeEvent("EVT-SYN-001"));
    await expect(repository.append(makeEvent("EVT-SYN-001", "REVIEW"))).rejects.toThrow("AUDIT_EVENT_IMMUTABLE");
    const events = await repository.getAll();
    expect(events).toHaveLength(1);
    expect(events[0].action).toBe("GENERATE");
  });

  it("creates and verifies a tamper-evident event chain", async () => {
    const repository = new InMemoryDocumentAuditRepository();
    await repository.append(makeEvent("EVT-SYN-002"));
    await repository.append(makeEvent("EVT-SYN-003", "REVIEW"));
    expect(await repository.verifyIntegrity()).toBe(true);

    const events = await repository.getAll();
    expect(events[0].previousEventHash).toBe("GENESIS");
    expect(events[1].previousEventHash).toBe(events[0].eventHash);
    expect(events[0].eventHash).toHaveLength(64);
  });
});
