import { describe, expect, it } from "vitest";
import { DocumentOutboxDispatcher } from "../../src/lib/document-engine/outbox-dispatcher";
import { InMemoryDocumentOutboxStore } from "../../src/lib/document-engine/outbox";

const event = {
  eventId: "OUT-SYN-001",
  eventType: "DOCUMENT_ISSUED" as const,
  aggregateId: "DOC-SYN-001",
  idempotencyKey: "IDEM-SYN-001",
  payloadFingerprint: "a".repeat(64),
  status: "PENDING" as const,
  attempts: 0,
  occurredAt: "2026-09-14T08:00:00Z",
};

describe("document outbox", () => {
  it("delivers an event once and does not redeliver completed events", async () => {
    const store = new InMemoryDocumentOutboxStore();
    let handled = 0;
    await store.enqueue(event);
    const dispatcher = new DocumentOutboxDispatcher(store, { handle: async () => { handled += 1; } });
    await dispatcher.dispatch(event.eventId, "2026-09-14T08:01:00Z");
    await dispatcher.dispatch(event.eventId, "2026-09-14T08:02:00Z");
    expect(handled).toBe(1);
    expect((await store.get(event.eventId))?.status).toBe("DELIVERED");
  });

  it("records failed delivery and preserves retry metadata", async () => {
    const store = new InMemoryDocumentOutboxStore();
    await store.enqueue(event);
    const dispatcher = new DocumentOutboxDispatcher(store, { handle: async () => { throw new Error("NETWORK_UNAVAILABLE"); } });
    await expect(dispatcher.dispatch(event.eventId, "2026-09-14T08:01:00Z")).rejects.toThrow("NETWORK_UNAVAILABLE");
    const saved = await store.get(event.eventId);
    expect(saved?.status).toBe("FAILED");
    expect(saved?.attempts).toBe(1);
    expect(saved?.lastErrorCode).toBe("NETWORK_UNAVAILABLE");
  });
});
