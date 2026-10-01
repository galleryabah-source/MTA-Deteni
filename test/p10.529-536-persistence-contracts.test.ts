import test from "node:test";
import assert from "node:assert/strict";
import { InMemoryAppendOnlyRepository, InMemoryOutboxRepository, InMemoryVersionedRepository } from "../src/infrastructure/persistence/in-memory.js";

const event = {
  eventId: "EVT-SYN-1",
  eventType: "exit.requested",
  aggregateType: "exit",
  aggregateId: "exit-1",
  payload: { synthetic: true },
  idempotencyKey: "IDEMP-SYN-1",
  occurredAt: "2026-09-15T00:00:00.000Z",
  executionContext: { requestId: "REQ-SYN-1", correlationId: "CORR-SYN-1", transactionId: "TX-SYN-1", idempotencyKey: "IDEMP-SYN-1" },
  payloadFingerprint: "FP-SYN-1",
  status: "PENDING",
  attempts: 0,
  availableAt: "2026-09-15T00:00:00.000Z",
  createdAt: "2026-09-15T00:00:00.000Z",
} as const;

test("P10.529-536 versioned repository rejects stale writes", async () => {
  const repository = new InMemoryVersionedRepository<{ id: string; version: number; value: string }>();
  assert.equal(await repository.insert({ id: "x", version: 1, value: "one" }), "CREATED");
  assert.equal(await repository.update({ id: "x", version: 2, value: "two" }, 1), "UPDATED");
  assert.equal(await repository.update({ id: "x", version: 3, value: "stale" }, 1), "CONFLICT");
  assert.equal((await repository.get("x"))?.value, "two");
});

test("P10.529-536 append-only repository rejects duplicate event IDs", async () => {
  const repository = new InMemoryAppendOnlyRepository<{ id: string; aggregateId: string; type: string }>();
  const event = { id: "evt-1", aggregateId: "exit-1", type: "REQUESTED" };
  assert.equal(await repository.append(event), "APPENDED");
  assert.equal(await repository.append(event), "DUPLICATE");
  assert.equal((await repository.list("exit-1")).length, 1);
});

test("P10.529-536 canonical outbox is claimable and acknowledgeable", async () => {
  const repository = new InMemoryOutboxRepository();
  assert.equal(await repository.enqueue(event), "ENQUEUED");
  assert.equal(await repository.enqueue(event), "DUPLICATE");
  assert.equal((await repository.claim(10)).length, 1);
  await repository.acknowledge("EVT-SYN-1");
  assert.equal((await repository.claim(10)).length, 0);
});
