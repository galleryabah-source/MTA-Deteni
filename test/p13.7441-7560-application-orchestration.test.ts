import test from "node:test";
import assert from "node:assert/strict";
import { createMemoryRepository } from "../src/application/repository-contract.js";
import { MtaApplicationServices } from "../src/application/mta-application-services.js";
import { orchestrateAggregateCommand, assertAggregateCommandResult } from "../src/application/application-orchestration.js";
import type { MutationIntegrationStores } from "../src/application/mutation-integration.js";
import type { TransactionRunner } from "../src/application/transaction-contract.js";

const stores: MutationIntegrationStores = {
  findIdempotency: () => undefined,
  saveIdempotency: () => undefined,
  appendAudit: () => undefined,
  appendPending: async () => "ADMIT",
};
const transactionRunner: TransactionRunner = async (_context, work) => work();
const service = new MtaApplicationServices({ stores, transactionRunner, authorize: () => undefined });

test("repository-backed orchestration propagates aggregate identity and version", async () => {
  const repository = createMemoryRepository<{ id: string; version: number; status: string }>();
  const result = await orchestrateAggregateCommand(service, repository, {
    actor: { actorId: "A1", role: "ADMIN", domain: "RAP", scope: {}, correlationId: "C1" },
    context: { transactionId: "T1", requestId: "R1", correlationId: "C1", idempotencyKey: "I1" },
    auditId: "AUD1", eventId: "EV1", occurredAt: "2026-09-15T00:00:00Z",
  }, {
    commandType: "DETAINEE_REGISTER", entity: { id: "DET-SYN-002", version: 1, status: "ACTIVE" }, requestHash: "H1", payload: { value: "P1" }, payloadFingerprint: "PF1", responseFingerprint: "RF1",
  });
  assert.equal(result.outcome, "COMMITTED");
  assertAggregateCommandResult(result);
  assert.equal(result.repositoryResult?.entity.id, "DET-SYN-002");
  assert.equal(result.repositoryResult?.entity.version, 1);
  assert.equal(repository.get("DET-SYN-002")?.entity.status, "ACTIVE");
});
