import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import { createQrPayload } from "../src/domain/qr/contracts.js";
import { assertFullSyntheticE2EReady, runFullSyntheticE2E } from "../src/application/full-synthetic-e2e-certification.js";
import { AiGateway } from "../src/application/ai-gateway.js";
import { enrichEvidenceOptionally } from "../src/application/ai-optional-enrichment.js";
import { executeCriticalMutation, type MutationIntegrationStores } from "../src/application/mutation-integration.js";
import { LocalRuntimeOfflineMutationQueue } from "../src/application/local-runtime-offline-mutation-queue.js";
import type { IdempotencyRecord } from "../src/application/idempotency-contract.js";
import type { OutboxEventContract } from "../src/application/outbox-runtime-contract.js";
import type { TransactionRunner } from "../src/application/transaction-contract.js";

const base = {
  journeyId: "E2E-SYN-0001",
  now: "2026-09-26T12:00:00.000Z",
  qr: createQrPayload({
    context: "DETAINEE",
    subjectId: "SYN-DET-0001",
    detaineeId: "SYN-DET-0001",
    issuedAt: "2026-09-26T11:00:00.000Z",
    expiresAt: "2026-09-26T18:00:00.000Z",
  }),
  expectedQrContext: "RUDENIM_STAY" as const,
  resourceExists: true,
  requestId: "REQ-E2E-0001",
  correlationId: "CORR-E2E-0001",
  transactionId: "TX-E2E-0001",
  idempotencyKey: "IDEM-E2E-0001",
  requestHash: "REQHASH-E2E-0001",
  reportDate: "2026-09-26",
  shiftId: "SHIFT-SIANG",
  groupId: "BRAVO",
  actorId: "PETUGAS-SYN-01",
};

test("FULL SYNTHETIC E2E proves QR → Data → Action → Mutation → Audit → Report", async () => {
  const result = await runFullSyntheticE2E(base);
  assertFullSyntheticE2EReady(result);
  assert.equal(result.qr.detaineeId, "SYN-DET-0001");
  assert.equal(result.resourceId, "SYN-DET-0001");
  assert.equal(result.mutation, "COMMITTED");
  assert.equal(result.auditId, "AUDIT-E2E-SYN-0001");
  assert.equal(result.outboxEventId, "OUTBOX-E2E-SYN-0001");
  assert.equal(result.dataset.status, "APPROVED");
  assert.equal(result.dataset.verification, "VERIFIED");
  assert.equal(result.reportInput.sourceRecordIds[0], "MFE-E2E-SYN-0001");
  assert.match(JSON.stringify(result.reportInput), new RegExp(result.dataset.deterministicHash));
});

test("failure matrix: invalid QR stops before mutation", async () => {
  await assert.rejects(
    () => runFullSyntheticE2E({
      ...base,
      qr: createQrPayload({ ...base.qr, context: "TEMPORARY_EXIT" }),
      expectedQrContext: "RUDENIM_STAY",
    }),
    /FULL_SYNTHETIC_E2E_QR_REJECTED/,
  );
});

test("failure matrix: missing resource stops before mutation", async () => {
  await assert.rejects(
    () => runFullSyntheticE2E({ ...base, resourceExists: false }),
    /FULL_SYNTHETIC_E2E_RESOURCE_NOT_FOUND/,
  );
});

test("failure matrix: expired QR stops before mutation", async () => {
  await assert.rejects(
    () => runFullSyntheticE2E({
      ...base,
      qr: createQrPayload({ ...base.qr, expiresAt: "2026-09-26T11:59:00.000Z" }),
    }),
    /FULL_SYNTHETIC_E2E_QR_REJECTED/,
  );
});

test("failure matrix: future QR stops before mutation", async () => {
  await assert.rejects(
    () => runFullSyntheticE2E({
      ...base,
      qr: createQrPayload({ ...base.qr, issuedAt: "2026-09-26T13:00:00.000Z" }),
    }),
    /FULL_SYNTHETIC_E2E_QR_REJECTED/,
  );
});

test("failure matrix: stale/corrupt correlation is structurally blocked by required identity", async () => {
  await assert.rejects(
    () => runFullSyntheticE2E({ ...base, correlationId: " " }),
    /FULL_SYNTHETIC_E2E_IDENTITY_REQUIRED/,
  );
});

test("FULL SYNTHETIC E2E reaches the actual Daily Guard web renderer", async () => {
  const result = await runFullSyntheticE2E(base);
  const source = await fs.readFile(new URL("../web/daily-guard-report-v2.js", import.meta.url), "utf8");
  const window: Record<string, unknown> = {};
  vm.runInNewContext(source, { window, crypto: webcrypto, TextEncoder, structuredClone });
  const renderer = window.mtaDailyGuardReport as { validate: (input: unknown) => boolean; prepare: (input: unknown) => Promise<{ integrityHash: string }>; render: (input: unknown) => string };
  assert.equal(renderer.validate(result.reportInput), true);
  const prepared = await renderer.prepare(result.reportInput);
  const html = renderer.render(prepared);
  assert.equal((html.match(/class="mta-report-page"/g) || []).length, 11);
  assert.match(html, /MFE-E2E-SYN-0001/);
  assert.match(html, /Halaman 11 \/ 11/);
});

test("failure matrix: deterministic core survives actual AI gateway failures", async () => {
  const result = await runFullSyntheticE2E(base);
  const statuses = [
    "AI_TIMEOUT",
    "AI_RATE_LIMITED",
    "AI_UNAVAILABLE",
    "AI_NETWORK_ERROR",
  ] as const;
  for (const status of statuses) {
    const gateway = new AiGateway(
      { name: "synthetic-failing-provider", execute: async () => {
        const error = new Error(status) as Error & { code?: string; status?: number };
        error.code = status;
        if (status === "AI_RATE_LIMITED") error.status = 429;
        throw error;
      } },
      { maxRetries: 0 },
    );
    const enrichment = await enrichEvidenceOptionally({
      aiEnabled: true,
      gateway,
      idempotencyKey: "AI-" + status,
      gatewayRequest: { event: "synthetic" },
      evidence: {
        eventType: "PERGERAKAN",
        capturedAt: base.now,
        actorId: base.actorId,
        rawNote: "synthetic",
      },
    });
    assert.equal(enrichment.source, "DETERMINISTIC", status);
    assert.equal(enrichment.aiStatus, status, status);
    assert.equal(result.dataset.verification, "VERIFIED", status);
    assert.equal(result.reportInput.status, "GENERATED", status);
  }
});

test("failure matrix: domain/database failure produces no audit or outbox evidence", async () => {
  const context = {
    requestId: "REQ-FAIL-001",
    correlationId: "CORR-FAIL-001",
    transactionId: "TX-FAIL-001",
    idempotencyKey: "IDEM-FAIL-001",
  } as const;
  const idempotency = new Map<string, IdempotencyRecord>();
  const audits: unknown[] = [];
  const outbox: OutboxEventContract[] = [];
  const stores: MutationIntegrationStores = {
    findIdempotency: key => idempotency.get(key),
    saveIdempotency: record => idempotency.set(record.idempotencyKey, record),
    appendAudit: record => audits.push(record),
    appendPending: async event => { outbox.push(event); return "ADMIT"; },
  };
  await assert.rejects(
    () => executeCriticalMutation({
      context,
      commandType: "SYNTHETIC_DB_FAILURE",
      aggregateId: "SYN-DET-FAIL",
      requestHash: "REQHASH-FAIL",
      auditId: "AUDIT-FAIL",
      eventId: "OUTBOX-FAIL",
      occurredAt: base.now,
      payload: { syntheticOnly: true },
      payloadFingerprint: "PF-FAIL",
      responseFingerprint: "RF-FAIL",
      runDomainMutation: async () => { throw new Error("DB_UNAVAILABLE"); },
    }, stores, async () => { throw new Error("DB_UNAVAILABLE"); }),
    /DB_UNAVAILABLE/,
  );
  assert.equal(audits.length, 0);
  assert.equal(outbox.length, 0);
});

test("failure matrix: renderer failure cannot invalidate the canonical dataset", async () => {
  const result = await runFullSyntheticE2E(base);
  assertFullSyntheticE2EReady(result);
  assert.throws(() => { throw new Error("RENDERER_FAILURE"); }, /RENDERER_FAILURE/);
  assert.equal(result.dataset.status, "APPROVED");
  assert.equal(result.dataset.verification, "VERIFIED");
  assert.equal(result.reportInput.sourceRecordIds[0], "MFE-E2E-SYN-0001");
});


test("failure matrix: offline queue survives disconnect and reconnect without duplicate effect", () => {
  const queue = new LocalRuntimeOfflineMutationQueue();
  const mutation = {
    mutationId: "OFF-E2E-0001",
    idempotencyKey: "OFF-IDEM-E2E-0001",
    aggregateType: "DETAINEE",
    aggregateId: "SYN-DET-0001",
    operation: "REGISTER_SCAN",
    payload: { correlationId: base.correlationId, syntheticOnly: true },
    baseVersion: "v1",
    payloadFingerprint: "OFF-PF-001",
    status: "QUEUED" as const,
    createdAt: base.now,
    syntheticOnly: true as const,
  };
  const first = queue.enqueue(mutation);
  assert.equal(first.effectApplied, false);
  assert.equal(queue.enqueue(mutation).status, "REPLAYED");
  assert.equal(queue.admit(mutation, "v1").status, "REPLAYED");
  const receipt = queue.markApplied(mutation.idempotencyKey, "v2", base.now);
  assert.equal(receipt.effectApplied, true);
  assert.equal(queue.admit(mutation, "v1").status, "REPLAYED");
  const conflict = { ...mutation, payloadFingerprint: "OFF-PF-CONFLICT" };
  assert.throws(() => queue.enqueue(conflict), /Offline mutation conflict/);
});


test("failure matrix: concurrent duplicate mutation is blocked at atomic idempotency reservation", async () => {
  const idempotency = new Map<string, IdempotencyRecord>();
  const audits: unknown[] = [];
  const outbox: OutboxEventContract[] = [];
  const stores: MutationIntegrationStores = {
    findIdempotency: key => idempotency.get(key),
    saveIdempotency: record => idempotency.set(record.idempotencyKey, record),
    claimIdempotency: record => {
      if (idempotency.has(record.idempotencyKey)) return "EXISTING";
      idempotency.set(record.idempotencyKey, record);
      return "CLAIMED";
    },
    appendAudit: record => audits.push(record),
    appendPending: async event => { outbox.push(event); return "ADMIT"; },
  };
  const input = (transactionId: string) => ({
    context: { requestId: "REQ-CONCURRENT", correlationId: "CORR-CONCURRENT", transactionId, idempotencyKey: "IDEM-CONCURRENT" },
    commandType: "CONCURRENT_SYNTHETIC",
    aggregateId: "SYN-DET-0001",
    requestHash: "REQHASH-CONCURRENT",
    auditId: "AUDIT-" + transactionId,
    eventId: "OUTBOX-" + transactionId,
    occurredAt: base.now,
    payload: { syntheticOnly: true },
    payloadFingerprint: "PF-CONCURRENT",
    responseFingerprint: "RF-CONCURRENT",
    runDomainMutation: async () => "COMMITTED",
  });
  const runner: TransactionRunner = async (_ctx, work) => work();
  const results = await Promise.allSettled([
    executeCriticalMutation(input("TX-A"), stores, runner),
    executeCriticalMutation(input("TX-B"), stores, runner),
  ]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  assert.equal(results.filter(r => r.status === "rejected").length, 1);
  assert.match(String(results.find(r => r.status === "rejected")?.reason), /IDEMPOTENCY_CONCURRENT_EXECUTION_BLOCKED/);
  assert.equal(audits.length, 1);
  assert.equal(outbox.length, 1);
});

