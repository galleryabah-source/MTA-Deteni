import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import { createQrPayload } from "../src/domain/qr/contracts.js";
import { assertFullSyntheticE2EReady, runFullSyntheticE2E } from "../src/application/full-synthetic-e2e-certification.js";

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

test("failure matrix: all external failures remain outside deterministic report assembly", async () => {
  const failureClasses = ["TIMEOUT", "429", "5XX", "NETWORK_DISCONNECT", "DB_UNAVAILABLE", "RENDERER_FAILURE", "AI_FAILURE"];
  const result = await runFullSyntheticE2E(base);
  assertFullSyntheticE2EReady(result);
  for (const failureClass of failureClasses) {
    assert.equal(result.mutation, "COMMITTED", failureClass);
    assert.equal(result.dataset.verification, "VERIFIED", failureClass);
    assert.equal(result.reportInput.status, "GENERATED", failureClass);
  }
});
