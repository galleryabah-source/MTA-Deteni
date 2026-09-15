import test from "node:test";
import assert from "node:assert/strict";
import { InMemoryGovernedTransaction, InMemoryPersistentIdempotency } from "../src/infrastructure/persistence/p12-281-320-nonprod-transaction.js";
import { OutboxReadModelProjector, projectOutboxBatch } from "../src/application/p12-321-344-outbox-read-model-projector.js";
import { executeControlledCommand } from "../src/application/p12-345-360-controlled-api-boundary.js";
import type { OutboxMessage } from "../src/infrastructure/persistence/contracts.js";
import type { ActorContext } from "../src/domain/shared/contracts.js";

const actor: ActorContext = { actorId: "synthetic-operator", role: "OPERATOR", domain: "KAMTIB", scope: { rudenim: "synthetic" }, correlationId: "corr-001", idempotencyKey: "idem-001" };
const outbox: OutboxMessage = { id: "msg-001", topic: "temporary-exit.requested", aggregateId: "exit-001", payload: { synthetic: true }, createdAt: "2026-09-15T00:00:00.000Z" };

test("P12.281-320 transaction stages side effects and commits on success", async () => {
  const tx = new InMemoryGovernedTransaction();
  const result = await tx.run({ transactionId: "tx-001", actorId: actor.actorId, correlationId: actor.correlationId, aggregateId: "exit-001" }, async (context) => {
    await context.persistOutbox({ messageId: outbox.id, topic: outbox.topic, aggregateId: outbox.aggregateId, payload: outbox.payload });
    return "OK";
  });
  assert.equal(result, "OK");
  assert.equal(tx.journal("tx-001").outbox.length, 1);
});

test("P12.281-320 persistent idempotency replays only the same mutation identity", async () => {
  const store = new InMemoryPersistentIdempotency();
  assert.equal(await store.acquire("idem", "fp", "actor", "corr", "agg"), "ACQUIRED");
  await store.complete("idem", { ok: true, synthetic: true });
  assert.equal(await store.acquire("idem", "fp", "actor", "corr", "agg"), "REPLAY");
  assert.equal(await store.acquire("idem", "different", "actor", "corr", "agg"), "CONFLICT");
});

test("P12.321-344 projection consumes committed outbox messages", async () => {
  const seen: string[] = [];
  const projector = new OutboxReadModelProjector({ project: async (message) => { seen.push(message.id); return { applied: true }; } });
  const results = await projectOutboxBatch([outbox], projector);
  assert.deepEqual(seen, ["msg-001"]);
  assert.deepEqual(results[0], { messageId: "msg-001", aggregateId: "exit-001", projected: true });
});

test("P12.345-360 API boundary rejects incomplete identity before mutation", async () => {
  const surface = { execute: async () => { throw new Error("MUST_NOT_EXECUTE"); }, dashboard: async () => ({}) } as never;
  const response = await executeControlledCommand(surface, { commandId: "", permission: "X", fingerprint: "fp", payload: {}, actor: { ...actor, idempotencyKey: undefined } });
  assert.deepEqual(response, { ok: false, code: "INVALID_REQUEST" });
});
