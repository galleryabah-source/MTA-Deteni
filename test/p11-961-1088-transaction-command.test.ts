import assert from "node:assert/strict";
import test from "node:test";
import type { ActorContext, AuditEvent } from "../src/domain/shared/contracts.js";
import { OperatorCommandSurface } from "../src/application/p11-1025-1088-operator-command-surface.js";
import { TransactionalMutationService, type MutationEnvelope } from "../src/application/p11-961-1024-transactional-mutation.js";

const actor: ActorContext = { actorId: "ACT-SYN-001", role: "OPERATOR", domain: "KAMTIB", scope: {}, correlationId: "CORR-SYN-001", idempotencyKey: "IDEMP-SYN-001" };
const audit: AuditEvent = { eventId: "AUD-SYN-001", eventType: "TEMPORARY_EXIT_VALIDATED", aggregateType: "TEMPORARY_EXIT", aggregateId: "EXIT-SYN-001", actorId: actor.actorId, correlationId: actor.correlationId, occurredAt: "2026-01-01T00:00:00.000Z", payloadHash: "hash-synthetic-001" };

function build() {
  let stored: MutationEnvelope<string> | null = null;
  let fingerprint: string | null = null;
  const order: string[] = [];
  const mutation = new TransactionalMutationService<string, { exitId: string }>({
    authorization: { authorize: async () => { order.push("authorization"); return true; } },
    idempotency: {
      replay: async () => stored,
      begin: async (_key, fp) => { order.push("idempotency.begin"); if (fingerprint && fingerprint !== fp) return "CONFLICT"; if (stored) return "REPLAY"; fingerprint = fp; return "ACQUIRED"; },
      complete: async (_key, value) => { order.push("idempotency.complete"); stored = value; },
    },
    transaction: { run: async (work) => { order.push("transaction.open"); const value = await work(); order.push("transaction.close"); return value; } },
    persistAudit: async () => { order.push("audit"); },
    persistOutbox: async () => { order.push("outbox"); },
    mutate: async (input, currentActor) => { order.push(`mutation:${input.exitId}`); return { value: input.exitId, audit: { ...audit, actorId: currentActor.actorId, correlationId: currentActor.correlationId }, outbox: { messageId: "OUT-SYN-001", topic: "temporary-exit.updated", aggregateId: audit.aggregateId, payload: { exitId: input.exitId } } }; },
  });
  const surface = new OperatorCommandSurface<{ exitId: string }, string>(mutation, { dashboard: async () => ({ generatedAt: "2026-01-01T00:00:00.000Z", detainees: [], headcount: { capturedAt: "2026-01-01T00:00:00.000Z", totalActive: 0, byBlock: [], reconciliation: "MATCH" }, pendingTemporaryExits: 0, pendingApprovals: 0, operationalAlerts: [] }) });
  return { surface, order, mutation };
}

test("P11.961-1024 executes mutation, audit and outbox inside one transaction contract", async () => {
  const { surface, order } = build();
  const result = await surface.execute({ commandId: "CMD-001", permission: "TEMPORARY_EXIT_VALIDATE", fingerprint: "FP-001", payload: { exitId: "EXIT-SYN-001" }, actor });
  assert.equal(result.result.value, "EXIT-SYN-001");
  assert.deepEqual(order, ["authorization", "transaction.open", "idempotency.begin", "mutation:EXIT-SYN-001", "audit", "outbox", "idempotency.complete", "transaction.close"]);
});

test("P11.961-1024 replays without a second mutation transaction", async () => {
  const { surface, order } = build();
  await surface.execute({ commandId: "CMD-001", permission: "TEMPORARY_EXIT_VALIDATE", fingerprint: "FP-001", payload: { exitId: "EXIT-SYN-001" }, actor });
  order.length = 0;
  const replay = await surface.execute({ commandId: "CMD-002", permission: "TEMPORARY_EXIT_VALIDATE", fingerprint: "FP-001", payload: { exitId: "EXIT-SYN-001" }, actor });
  assert.equal(replay.result.value, "EXIT-SYN-001");
  assert.deepEqual(order, ["authorization"]);
});

test("P11.961-1024 rejects idempotency fingerprint conflict", async () => {
  const { surface } = build();
  await surface.execute({ commandId: "CMD-001", permission: "TEMPORARY_EXIT_VALIDATE", fingerprint: "FP-001", payload: { exitId: "EXIT-SYN-001" }, actor });
  await assert.rejects(() => surface.execute({ commandId: "CMD-002", permission: "TEMPORARY_EXIT_VALIDATE", fingerprint: "FP-002", payload: { exitId: "EXIT-SYN-002" }, actor }), /IDEMPOTENCY_CONFLICT/);
});

test("P11.1025-1088 carries operator payload and correlation to the application boundary", async () => {
  const { surface } = build();
  const result = await surface.execute({ commandId: "CMD-003", permission: "TEMPORARY_EXIT_VALIDATE", fingerprint: "FP-003", payload: { exitId: "EXIT-SYN-001" }, actor: { ...actor, idempotencyKey: "IDEMP-SYN-003", correlationId: "CORR-SYN-003" } });
  assert.equal(result.commandId, "CMD-003");
  assert.equal(result.correlationId, "CORR-SYN-003");
  assert.equal(result.aggregateId, "EXIT-SYN-001");
});
