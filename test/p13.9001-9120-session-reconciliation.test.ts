import test from "node:test";
import assert from "node:assert/strict";
import { openOperationalSession, markSessionReconciliationRequired, interruptOperationalSession } from "../src/application/offline-operational-session.js";
import { createReconciliationReceipt, certifySessionReconciliation, markSessionReconciliationComplete } from "../src/application/session-reconciliation.js";

const context = { executionId: "EXEC-R", runtimeMode: "LAN" as const, deviceClass: "SMARTPHONE" as const, networkScopeId: "NET-R", certificationJourneyId: "J-R", authenticated: true, syntheticOnly: true as const };
const commandA = { commandId: "CMD-R-A", aggregateId: "DET-R", commandType: "PLACEMENT_RECORD", payloadHash: "FP-A", idempotencyKey: "ID-A", createdAt: "2026-09-16T00:00:00Z", state: "PENDING" as const };
const commandB = { commandId: "CMD-R-B", aggregateId: "DET-R", commandType: "MOVEMENT_RECORD", payloadHash: "FP-B", idempotencyKey: "ID-B", createdAt: "2026-09-16T00:01:00Z", state: "PENDING" as const };
const applyA = { commandId: "CMD-R-A", action: "APPLY" as const };
const applyB = { commandId: "CMD-R-B", action: "SKIP_DUPLICATE" as const };

test("full reconciliation proves every admitted command", () => {
  const opened = openOperationalSession({ sessionId: "SES-R", context, deviceId: "DEV-R", installationId: "INST-R" });
  const session = markSessionReconciliationRequired(opened);
  const receiptA = createReconciliationReceipt({ session, context, command: commandA, decision: applyA });
  const receiptB = createReconciliationReceipt({ session, context, command: commandB, decision: applyB });
  const proof = certifySessionReconciliation({ session, context, admittedCommands: [commandA, commandB], receipts: [receiptA, receiptB] });
  const active = markSessionReconciliationComplete(session, proof);
  assert.equal(proof.complete, true);
  assert.equal(proof.admittedCount, 2);
  assert.equal(active.state, "ACTIVE");
});

test("partial reconciliation cannot be certified", () => {
  const opened = openOperationalSession({ sessionId: "SES-P", context, deviceId: "DEV-R", installationId: "INST-R" });
  const session = markSessionReconciliationRequired(opened);
  const receiptA = createReconciliationReceipt({ session, context, command: commandA, decision: applyA });
  assert.throws(() => certifySessionReconciliation({ session, context, admittedCommands: [commandA, commandB], receipts: [receiptA] }));
});

test("conflict cannot produce a completion receipt", () => {
  const opened = openOperationalSession({ sessionId: "SES-X", context, deviceId: "DEV-R", installationId: "INST-R" });
  const session = markSessionReconciliationRequired(opened);
  assert.throws(() => createReconciliationReceipt({ session, context, command: commandA, decision: { commandId: "CMD-R-A", action: "REVIEW_CONFLICT" } }));
});

test("reconciliation command and execution drift fail closed", () => {
  const opened = openOperationalSession({ sessionId: "SES-D", context, deviceId: "DEV-R", installationId: "INST-R" });
  const session = markSessionReconciliationRequired(opened);
  assert.throws(() => createReconciliationReceipt({ session, context: { ...context, executionId: "EXEC-OTHER" }, command: commandA, decision: applyA }));
  assert.throws(() => createReconciliationReceipt({ session, context, command: commandB, decision: applyA }));
});

test("terminated session cannot complete reconciliation", () => {
  const opened = openOperationalSession({ sessionId: "SES-T", context, deviceId: "DEV-R", installationId: "INST-R" });
  const interrupted = interruptOperationalSession(opened);
  assert.throws(() => markSessionReconciliationRequired(interrupted));
  assert.throws(() => createReconciliationReceipt({ session: interrupted, context, command: commandA, decision: applyA }));
});
