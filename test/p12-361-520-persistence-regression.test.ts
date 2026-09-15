import assert from "node:assert/strict";
import test from "node:test";
import { runSqlTransaction } from "../src/infrastructure/persistence/p12-361-420-postgres-transaction-contract.js";
import { ControlledDurableOutbox } from "../src/infrastructure/persistence/p12-421-480-durable-outbox.js";
import { RebuildableReadModel } from "../src/application/p12-481-520-projection-replay.js";
import { OutboxReadModelProjector } from "../src/application/p12-321-344-outbox-read-model-projector.js";

const metadata = { transactionId: "TX-SYN", actorId: "ACT-SYN", correlationId: "CORR-SYN", aggregateId: "DET-SYN" };
const message = { id: "MSG-SYN", topic: "detainee.updated", aggregateId: "DET-SYN", payload: { synthetic: true }, createdAt: "2026-09-15T00:00:00Z" } as const;

test("P12.361-420 rolls back when transactional work fails", async () => {
  let committed = false; let rolledBack = false;
  const tx = { transactionId: "TX-SYN", execute: async () => [], commit: async () => { committed = true; }, rollback: async () => { rolledBack = true; } };
  const factory = { begin: async () => tx };
  await assert.rejects(() => runSqlTransaction(factory, metadata, async () => { throw new Error("FAIL"); }), /FAIL/);
  assert.equal(committed, false); assert.equal(rolledBack, true);
});

test("P12.421-480 rejects missing outbox consumer context", async () => {
  const repo = { enqueue: async () => "ENQUEUED" as const, claim: async () => [], acknowledge: async () => {} };
  const outbox = new ControlledDurableOutbox(repo);
  await assert.rejects(() => outbox.claim(1, ""), /OUTBOX_CLAIM_CONTEXT_REQUIRED/);
  await assert.rejects(() => outbox.acknowledge("", "consumer"), /OUTBOX_ACK_CONTEXT_REQUIRED/);
});

test("P12.481-520 replays committed outbox evidence deterministically", async () => {
  const applied: string[] = []; const checkpoints: number[] = [];
  const projector = new OutboxReadModelProjector({ project: async () => undefined });
  const rebuild = new RebuildableReadModel(projector, { apply: async (item) => { applied.push(item.id); }, checkpoint: async (cp) => { checkpoints.push(cp.projectedCount); } });
  const result = await rebuild.replay([message], "consumer-syn");
  assert.deepEqual(applied, ["MSG-SYN"]); assert.deepEqual(checkpoints, [1]); assert.equal(result.lastMessageId, "MSG-SYN");
});
