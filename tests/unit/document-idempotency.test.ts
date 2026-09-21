import { describe, expect, it } from "vitest";
import { InMemoryDocumentIdempotencyStore } from "../../src/lib/document-engine/idempotency";
import { IdempotentDocumentTransitionOrchestrator } from "../../src/lib/document-engine/idempotent-transition";

const input = {
  documentId: "DOC-SYN-IDEM-001",
  from: "REVIEWED" as const,
  to: "APPROVED" as const,
  audit: {
    eventId: "AUD-SYN-IDEM-001",
    documentId: "DOC-SYN-IDEM-001",
    documentKind: "SURAT_IZIN_KELUAR_SEMENTARA" as const,
    action: "APPROVE" as const,
    fromLifecycle: "REVIEWED" as const,
    toLifecycle: "APPROVED" as const,
    actorUserId: "USER-SYN-001",
    occurredAt: "2026-09-14T08:00:00Z",
    correlationId: "CORR-SYN-IDEM-001",
  },
};

describe("document idempotency", () => {
  it("executes a committed request only once and returns the stored result on retry", async () => {
    const store = new InMemoryDocumentIdempotencyStore();
    let executions = 0;
    const orchestrator = new IdempotentDocumentTransitionOrchestrator({
      execute: async () => { executions += 1; },
    }, store);

    const first = await orchestrator.execute("IDEM-SYN-001", input);
    const second = await orchestrator.execute("IDEM-SYN-001", input);
    expect(first).toEqual(second);
    expect(executions).toBe(1);
  });

  it("rejects reuse of a key for a different request", async () => {
    const store = new InMemoryDocumentIdempotencyStore();
    await store.reserve("IDEM-SYN-002", "a".repeat(64), "2026-09-14T08:00:00Z");
    await expect(store.reserve("IDEM-SYN-002", "b".repeat(64), "2026-09-14T08:00:00Z"))
      .rejects.toThrow("IDEMPOTENCY_KEY_REUSE_MISMATCH");
  });
});
