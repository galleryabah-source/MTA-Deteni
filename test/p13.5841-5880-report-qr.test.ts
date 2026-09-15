import { test } from "node:test";
import assert from "node:assert/strict";
import { assertQrOperation, createQrPayload } from "../src/domain/qr/contracts.js";
import { canonicalizeReportingSnapshot, createReportingSnapshot } from "../src/domain/reporting/snapshot.js";

test("P13.5841 QR contexts cannot be confused across operational actions", () => {
  const detaineeQr = createQrPayload({ context: "DETAINEE", subjectId: "SYN-DET-0001", detaineeId: "SYN-DET-0001", issuedAt: "2026-09-15T08:00:00.000Z" });
  const blockQr = createQrPayload({ context: "BLOCK", subjectId: "SYN-BLOCK-A", detaineeId: "SYN-DET-0001", issuedAt: "2026-09-15T08:00:00.000Z" });
  const exitQr = createQrPayload({ context: "TEMPORARY_EXIT", subjectId: "SYN-EXIT-0001", detaineeId: "SYN-DET-0001", issuedAt: "2026-09-15T08:00:00.000Z" });
  const deportationQr = createQrPayload({ context: "DEPORTATION", subjectId: "SYN-DEP-0001", detaineeId: "SYN-DET-0001", issuedAt: "2026-09-15T08:00:00.000Z" });

  assert.doesNotThrow(() => assertQrOperation(detaineeQr, "DISPLAY"));
  assert.doesNotThrow(() => assertQrOperation(blockQr, "DISPLAY"));
  assert.doesNotThrow(() => assertQrOperation(exitQr, "TEMPORARY_EXIT_SCAN"));
  assert.doesNotThrow(() => assertQrOperation(deportationQr, "DEPORTATION_SCAN"));
  assert.throws(() => assertQrOperation(detaineeQr, "TEMPORARY_EXIT_SCAN"));
  assert.throws(() => assertQrOperation(exitQr, "DEPORTATION_SCAN"));
});

test("P13.5841 reporting snapshot is immutable and deterministic for identical input", () => {
  const input = {
    snapshotId: "SYN-SNAPSHOT-0001",
    generatedAt: "2026-09-15T08:00:00.000Z",
    sourceRevision: "SYN-REV-0001",
    rows: [{ detaineeId: "SYN-DET-0001", state: "ACTIVE", count: 1 }],
  } as const;
  const first = createReportingSnapshot(input);
  const second = createReportingSnapshot(input);
  assert.equal(canonicalizeReportingSnapshot(first), canonicalizeReportingSnapshot(second));
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.rows), true);
});
