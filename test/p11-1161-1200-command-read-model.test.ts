import assert from "node:assert/strict";
import test from "node:test";
import type { ActorContext } from "../src/domain/shared/contracts.js";
import type { MutationCommand, MutationEnvelope, TransactionalMutationService } from "../src/application/p11-961-1024-transactional-mutation.js";
import { OperatorApplicationFacade } from "../src/application/p11-1161-1200-command-read-model-integration.js";

const actor: ActorContext = { actorId: "ACT-SYN-003", role: "OPERATOR", domain: "KAMTIB", scope: {}, correlationId: "CORR-SYN-003", idempotencyKey: "IDEMP-SYN-003" };

test("P11.1161-1200 projects the committed mutation into the operator read-model boundary", async () => {
  const result = { value: "READY", audit: { eventId: "AUD-SYN-003", eventType: "TEST", aggregateType: "TEMPORARY_EXIT", aggregateId: "EXIT-SYN-003", actorId: actor.actorId, correlationId: actor.correlationId, occurredAt: "2026-01-01T00:00:00.000Z", payloadHash: "hash" }, outbox: { messageId: "OUT-SYN-003", topic: "test", aggregateId: "EXIT-SYN-003", payload: {} } } satisfies MutationEnvelope<string>;
  const calls: string[] = [];
  const mutation = { execute: async (_command: MutationCommand<{ id: string }>) => { calls.push("mutation"); return result; } } as unknown as TransactionalMutationService<string, { id: string }>;
  const facade = new OperatorApplicationFacade(mutation, {
    project: async (value) => { calls.push(`project:${value.audit.aggregateId}`); },
    dashboard: async () => ({ generatedAt: "2026-01-01T00:00:00.000Z", detainees: [], headcount: { capturedAt: "2026-01-01T00:00:00.000Z", totalActive: 0, byBlock: [], reconciliation: "MATCH" }, pendingTemporaryExits: 0, pendingApprovals: 0, operationalAlerts: [] }),
  });
  const output = await facade.execute({ actor, permission: "TEMPORARY_EXIT_VALIDATE", fingerprint: "FP-SYN-003", input: { id: "EXIT-SYN-003" } });
  assert.equal(output.value, "READY");
  assert.deepEqual(calls, ["mutation", "project:EXIT-SYN-003"]);
});
