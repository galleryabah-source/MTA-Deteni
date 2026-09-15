import assert from "node:assert/strict";
import test from "node:test";
import type { ActorContext } from "../src/domain/shared/contracts.js";
import type { TemporaryExit } from "../src/domain/temporary-exit/service.js";
import { createTemporaryExitCommandService } from "../src/application/p11-1089-1160-temporary-exit-command-adapter.js";
import type { MtaWorkflowService } from "../src/application/mta-workflow.js";

const actor: ActorContext = { actorId: "ACT-SYN-002", role: "OPERATOR", domain: "KAMTIB", scope: {}, correlationId: "CORR-SYN-002", idempotencyKey: "IDEMP-SYN-002" };
const exit: TemporaryExit = { id: "EXIT-SYN-002", detaineeId: "DET-SYN-002", state: "REQUESTED", requestedAt: "2026-01-01T00:00:00.000Z", plannedDepartureAt: "2026-01-02T01:00:00.000Z", plannedReturnAt: "2026-01-02T03:00:00.000Z", version: 1 };

test("P11.1089-1160 binds create command to canonical workflow and evidence", async () => {
  let called = false;
  const workflow = { createTemporaryExitCase: async (input: { exitId: string }) => { called = input.exitId === exit.id; return exit; } } as unknown as MtaWorkflowService;
  const service = createTemporaryExitCommandService({ workflow, eventId: () => "AUD-SYN-002", messageId: () => "OUT-SYN-002", now: () => "2026-01-01T00:00:00.000Z", payloadHash: () => "hash-synthetic-002" }, {
    authorization: { authorize: async () => true },
    idempotency: { replay: async () => null, begin: async () => "ACQUIRED", complete: async () => {} },
    transaction: { run: async (work) => work() },
    persistAudit: async () => {},
    persistOutbox: async () => {},
  });
  const result = await service.execute({ actor, permission: "TEMPORARY_EXIT_REQUEST", fingerprint: "FP-SYN-002", input: { exitId: exit.id, detaineeId: exit.detaineeId, departureAt: exit.plannedDepartureAt, returnAt: exit.plannedReturnAt } });
  assert.equal(called, true);
  assert.equal(result.value.id, exit.id);
  assert.equal(result.audit.aggregateId, exit.id);
  assert.equal(result.outbox.aggregateId, exit.id);
});

test("P11.1089-1160 binds state advancement to the same canonical workflow", async () => {
  let called = false;
  const advanced = { ...exit, state: "VALIDATED", version: 2 } as TemporaryExit;
  const workflow = { advanceTemporaryExit: async (input: { exitId: string; to: "VALIDATED" }) => { called = input.exitId === exit.id && input.to === "VALIDATED"; return advanced; } } as unknown as MtaWorkflowService;
  const service = createTemporaryExitCommandService({ workflow, eventId: () => "AUD-SYN-003", messageId: () => "OUT-SYN-003", now: () => "2026-01-01T00:00:00.000Z", payloadHash: () => "hash-synthetic-003" }, {
    authorization: { authorize: async () => true },
    idempotency: { replay: async () => null, begin: async () => "ACQUIRED", complete: async () => {} },
    transaction: { run: async (work) => work() },
    persistAudit: async () => {},
    persistOutbox: async () => {},
  });
  const result = await service.execute({ actor: { ...actor, idempotencyKey: "IDEMP-SYN-003" }, permission: "TEMPORARY_EXIT_VALIDATE", fingerprint: "FP-SYN-003", input: { exitId: exit.id, detaineeId: exit.detaineeId, departureAt: exit.plannedDepartureAt, returnAt: exit.plannedReturnAt, targetState: "VALIDATED" } });
  assert.equal(called, true);
  assert.equal(result.value.state, "VALIDATED");
  assert.equal(result.audit.eventType, "TEMPORARY_EXIT_VALIDATED");
});
