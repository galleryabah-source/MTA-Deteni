import test from "node:test";
import assert from "node:assert/strict";
import { certifyLifecycleJourney } from "../src/application/lifecycle-certification.js";

test("synthetic lifecycle certification binds correlation, versions and audit/outbox", () => {
  const steps = [
    { name: "REGISTRATION" as const, aggregateId: "DET-1", commandId: "CMD-1", eventId: "EVT-1", correlationId: "CORR-1", beforeVersion: 0, afterVersion: 1, status: "COMMITTED" as const },
    { name: "PLACEMENT" as const, aggregateId: "DET-1", commandId: "CMD-2", eventId: "EVT-2", correlationId: "CORR-1", beforeVersion: 1, afterVersion: 2, status: "COMMITTED" as const },
    { name: "MOVEMENT" as const, aggregateId: "DET-1", commandId: "CMD-3", eventId: "EVT-3", correlationId: "CORR-1", beforeVersion: 2, afterVersion: 3, status: "COMMITTED" as const },
    { name: "TEMPORARY_EXIT" as const, aggregateId: "DET-1", commandId: "CMD-4", eventId: "EVT-4", correlationId: "CORR-1", beforeVersion: 3, afterVersion: 4, status: "COMMITTED" as const },
    { name: "REPORTING" as const, aggregateId: "DET-1", commandId: "CMD-5", eventId: "EVT-5", correlationId: "CORR-1", beforeVersion: 4, afterVersion: 5, status: "COMMITTED" as const },
  ];
  const result = certifyLifecycleJourney({ journeyId: "JRN-1", steps, auditCount: 5, outboxCount: 5, projectionVersion: 5 });
  assert.equal(result.certified, true);
  assert.equal(result.syntheticOnly, true);
});

test("lifecycle certification fails closed on drift or duplicate effects", () => {
  const base = { name: "REGISTRATION" as const, aggregateId: "DET-1", commandId: "CMD-1", eventId: "EVT-1", correlationId: "CORR-1", beforeVersion: 0, afterVersion: 1, status: "COMMITTED" as const };
  assert.throws(() => certifyLifecycleJourney({ journeyId: "JRN-1", steps: [base, { ...base, commandId: "CMD-2", eventId: "EVT-2", correlationId: "CORR-2" }], auditCount: 2, outboxCount: 2, projectionVersion: 1 }));
  assert.throws(() => certifyLifecycleJourney({ journeyId: "JRN-1", steps: [base], auditCount: 2, outboxCount: 1, projectionVersion: 1 }));
});
