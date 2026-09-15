import test from "node:test";
import assert from "node:assert/strict";
import { reconcileRepositoryQueueProjection, assertReconciliationSafe } from "../src/application/reconciliation-contract.js";
import { enqueueOfflineCommand } from "../src/application/offline-continuity.js";
import { createReportingSnapshot } from "../src/domain/reporting/snapshot.js";
import { MtaApplicationServices } from "../src/application/mta-application-services.js";
import type { MutationIntegrationStores } from "../src/application/mutation-integration.js";
import type { TransactionRunner } from "../src/application/transaction-contract.js";

const entity = Object.freeze({ id: "DET-SYN-001", version: 2, state: "ACTIVE" });
const snapshot = createReportingSnapshot({ snapshotId: "SNP-001", generatedAt: "2026-09-15T00:00:00Z", sourceRevision: "DET-SYN-001", rows: [{ id: entity.id, version: entity.version }] });

function command(state: "PENDING" | "SYNCED" | "CONFLICT" = "PENDING") {
  return enqueueOfflineCommand({ commandId: "CMD-001", aggregateId: entity.id, commandType: "TEST", payloadHash: "PAY-001", idempotencyKey: "IDEM-001", createdAt: "2026-09-15T00:00:00Z" }) as typeof enqueueOfflineCommand extends (...args: never[]) => infer R ? R : never;
}

test("reconciliation is deterministic and identifies replay", () => {
  const pending = command();
  const first = reconcileRepositoryQueueProjection({ entity, command: pending, projection: snapshot, expectedProjectionSourceRevision: entity.id });
  const second = reconcileRepositoryQueueProjection({ entity, command: pending, projection: snapshot, expectedProjectionSourceRevision: entity.id });
  assert.equal(first.status, "REPLAY_REQUIRED");
  assert.equal(first.canonicalFingerprint, second.canonicalFingerprint);
  assertReconciliationSafe(first);
});

test("reconciliation fails closed for missing projection and source conflict", () => {
  const pending = command();
  const missing = reconcileRepositoryQueueProjection({ entity, command: pending, expectedProjectionSourceRevision: entity.id });
  assert.equal(missing.status, "MISSING_PROJECTION");
  assert.throws(() => assertReconciliationSafe(missing));
  const conflict = reconcileRepositoryQueueProjection({ entity, command: pending, projection: snapshot, expectedProjectionSourceRevision: "OTHER" });
  assert.equal(conflict.status, "CONFLICT");
  assert.throws(() => assertReconciliationSafe(conflict));
});

test("application mutation service preserves authorization, idempotency, audit and outbox seams", async () => {
  const idempotency = new Map<string, any>();
  const audits: any[] = [];
  const outbox: any[] = [];
  const stores: MutationIntegrationStores = {
    findIdempotency: (key) => idempotency.get(key),
    saveIdempotency: (record) => idempotency.set(record.idempotencyKey, record),
    appendAudit: (record) => audits.push(record),
    appendOutbox: (event) => outbox.push(event),
  };
  const transactionRunner: TransactionRunner = async (_context, work) => work();
  const service = new MtaApplicationServices({ stores, transactionRunner, authorize: (actor, commandType) => { if (actor.actorId !== "ACTOR-1" || !commandType) throw new Error("FORBIDDEN"); } });
  const actor = { actorId: "ACTOR-1", role: "ADMIN", correlationId: "CORR-1" } as any;
  const context = { actor, context: { transactionId: "TX-1", requestId: "REQ-1", correlationId: "CORR-1", idempotencyKey: "IDEM-SVC-1" }, auditId: "AUD-1", eventId: "EVT-1", occurredAt: "2026-09-15T00:00:00Z" };
  const result = await service.recordMovement({ ...context, movement: { id: "MOV-1", detaineeId: entity.id, type: "IN", occurredAt: "2026-09-15T00:00:00Z", actorId: actor.actorId, correlationId: actor.correlationId }, requestHash: "REQ-HASH" });
  assert.equal(result.outcome, "COMMITTED");
  assert.equal(audits.length, 1);
  assert.equal(outbox.length, 1);
  const replay = await service.recordMovement({ ...context, requestHash: "REQ-HASH", movement: { id: "MOV-1", detaineeId: entity.id, type: "IN", occurredAt: "2026-09-15T00:00:00Z", actorId: actor.actorId, correlationId: actor.correlationId } });
  assert.equal(replay.outcome, "REPLAYED");
  assert.equal(audits.length, 1);
  assert.equal(outbox.length, 1);
});
