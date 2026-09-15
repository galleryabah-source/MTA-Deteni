import { test } from "node:test";
import assert from "node:assert/strict";
import { DomainError } from "../src/domain/shared/errors.js";
import { assertSafeIntegration, assertReadPermission } from "../src/application/integration-guard.js";
import { authorizeTransport } from "../src/application/transport-guard.js";
import type { ActorContext } from "../src/domain/shared/contracts.js";

const actor: ActorContext = { actorId: "SYN-KAMTIB-001", role: "EDITOR", domain: "KAMTIB", scope: { site: "SYN-RUDENIM" }, correlationId: "SYN-CORR-001", idempotencyKey: "SYN-IDEMP-001" };

test("integration guard blocks production, AI, migration and non-approved targets", () => {
  assert.throws(() => assertSafeIntegration({ mode: "PRODUCTION", migrationFreeze: true, productionAccessAuthorized: false, approvedNonProductionTarget: false, aiEnabled: false, syntheticDataOnly: true }), DomainError);
  assert.throws(() => assertSafeIntegration({ mode: "NONPROD", migrationFreeze: true, productionAccessAuthorized: false, approvedNonProductionTarget: false, aiEnabled: false, syntheticDataOnly: true }), DomainError);
  assert.throws(() => assertSafeIntegration({ mode: "CI", migrationFreeze: true, productionAccessAuthorized: false, approvedNonProductionTarget: false, aiEnabled: true, syntheticDataOnly: true }), DomainError);
  assert.doesNotThrow(() => assertSafeIntegration({ mode: "NONPROD", migrationFreeze: true, productionAccessAuthorized: false, approvedNonProductionTarget: true, aiEnabled: false, syntheticDataOnly: true }));
});

test("read-model access remains deny-by-default", () => {
  assert.doesNotThrow(() => assertReadPermission({ ...actor, role: "EDITOR" }, "dashboard.read"));
  assert.throws(() => assertReadPermission({ ...actor, role: "EDITOR" }, "audit.read"), DomainError);
});

test("transport mutations require authorization and idempotency", async () => {
  const calls: string[] = [];
  const deps = {
    authorization: { authorize: async () => true },
    audit: { append: async () => undefined, enqueue: async (topic: string) => { calls.push(topic); } },
    idempotency: { replay: async () => null, begin: async () => "ACQUIRED" as const, complete: async () => undefined },
  };
  await authorizeTransport({ method: "POST", route: "/api/temporary-exit", actor, body: { synthetic: true }, idempotencyKey: "SYN-IDEMP-002", correlationId: "SYN-CORR-002" }, deps);
  assert.equal(calls.length, 0);
  await assert.rejects(() => authorizeTransport({ method: "POST", route: "/api/temporary-exit", actor, body: { synthetic: true }, correlationId: "SYN-CORR-003" }, deps), DomainError);
});
