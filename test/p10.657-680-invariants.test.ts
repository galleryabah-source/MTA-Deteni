import assert from "node:assert/strict";
import test from "node:test";
import { assertReportSnapshot, isOperationalQrUsable } from "../src/application/qr-report-invariants.js";
import { CANONICAL_TEMPORARY_EXIT_OPERATOR_FLOW, hasDuplicateWorkflowStepIds } from "../src/application/operator-workflow.js";

test("temporary-exit QR is usable only in its operational context and validity window", () => {
  const qr = { detaineeId: "SYN-001", issuedAt: "2026-09-15T00:00:00Z", validUntil: "2026-09-16T00:00:00Z", context: "TEMPORARY_EXIT" as const, active: true };
  assert.equal(isOperationalQrUsable(qr, "2026-09-15T08:00:00Z", "TEMPORARY_EXIT"), true);
  assert.equal(isOperationalQrUsable(qr, "2026-09-15T08:00:00Z", "DEPORTATION"), false);
  assert.equal(isOperationalQrUsable(qr, "2026-09-17T08:00:00Z", "TEMPORARY_EXIT"), false);
});

test("report snapshots require stable identity and non-negative counts", () => {
  assert.doesNotThrow(() => assertReportSnapshot({ snapshotId: "SYN-SNAP-001", capturedAt: "2026-09-15T00:00:00Z", detaineeCount: 3, sourceVersion: "v1" }));
  assert.throws(() => assertReportSnapshot({ snapshotId: "", capturedAt: "2026-09-15T00:00:00Z", detaineeCount: 3, sourceVersion: "v1" }), /REPORT_SNAPSHOT_METADATA_REQUIRED/);
});

test("canonical operator workflow has unique steps and preserves leadership oversight as read-only", () => {
  assert.equal(hasDuplicateWorkflowStepIds(CANONICAL_TEMPORARY_EXIT_OPERATOR_FLOW), false);
  const oversight = CANONICAL_TEMPORARY_EXIT_OPERATOR_FLOW.find((step) => step.id === "oversight");
  assert.equal(oversight?.domain, "LEADERSHIP");
  assert.equal(oversight?.readOnly, true);
});
