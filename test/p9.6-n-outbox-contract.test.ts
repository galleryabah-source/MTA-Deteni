import test from "node:test";
import assert from "node:assert/strict";
import { InMemoryOutboxRepository } from "../src/infrastructure/persistence/in-memory.js";
import { assertOutboxCompatibility } from "../src/infrastructure/persistence/p12-521-560-persistence-repository-contract.js";

const context = {
  transactionId: "tx-p96n",
  actorId: "actor-p96n",
  correlationId: "corr-p96n",
};

const message = {
  id: "evt-p96n-1",
  topic: "mta.test",
  aggregateId: "agg-p96n",
  payload: { synthetic: true },
  createdAt: "2026-09-24T00:00:00.000Z",
};

test("P9.6-N outbox contract exposes enqueue/claim/acknowledge/release", async () => {
  const repository = new InMemoryOutboxRepository();
  const contract = assertOutboxCompatibility(repository);

  assert.equal(await contract.enqueue(message, context), "ENQUEUED");
  assert.equal((await contract.claim("consumer-1", 10, context)).length, 1);
  await contract.release("consumer-1", message.id, context, "synthetic failure", 30);
  assert.equal((await contract.claim("consumer-1", 10, context)).length, 1);
  await contract.acknowledge("consumer-1", message.id, context);
  assert.equal((await contract.claim("consumer-1", 10, context)).length, 0);
});

test("P9.6-N rejects invalid outbox lifecycle context", async () => {
  const contract = assertOutboxCompatibility(new InMemoryOutboxRepository());
  await assert.rejects(
    () => contract.release("", message.id, context),
    /PERSISTENCE_CONTEXT_INVALID/
  );
  await assert.rejects(
    () => contract.release("consumer-1", "", context),
    /PERSISTENCE_CONTEXT_INVALID/
  );
});
