import test from "node:test";
import assert from "node:assert/strict";
import { assertLifecycleActorCorrelation, assertReadRefresh, assertVersionPropagation, createLifecycleEvent, assertLifecycleEnvelope } from "../src/application/lifecycle-orchestration.js";

test("lifecycle envelope and version propagation are deterministic", () => {
  const command = { commandId: "CMD-001", correlationId: "CORR-001", aggregateId: "DET-001", expectedVersion: 4, requestHash: "REQ-HASH-001", payload: { state: "ACTIVE" } };
  assertLifecycleEnvelope(command);
  assertVersionPropagation(command.expectedVersion, 5);
  const event = createLifecycleEvent({ eventId: "EVT-001", commandId: command.commandId, correlationId: command.correlationId, aggregateId: command.aggregateId, resultingVersion: 5, eventType: "DETAINEE_REGISTERED", payload: command.payload });
  assert.equal(event.resultingVersion, 5);
  assert.throws(() => assertVersionPropagation(4, 7));
});

test("read refresh and actor correlation fail closed on drift", () => {
  assertReadRefresh({ aggregateId: "DET-001", sourceVersion: 5, projectionVersion: 5, refreshed: true });
  assert.throws(() => assertReadRefresh({ aggregateId: "DET-001", sourceVersion: 5, projectionVersion: 4, refreshed: true }));
  assertLifecycleActorCorrelation({ actorId: "ACT-1", role: "ADMIN", domain: "RAP", scope: {}, correlationId: "CORR-1" }, "CORR-1");
  assert.throws(() => assertLifecycleActorCorrelation({ actorId: "ACT-1", role: "ADMIN", domain: "RAP", scope: {}, correlationId: "CORR-1" }, "CORR-2"));
});
