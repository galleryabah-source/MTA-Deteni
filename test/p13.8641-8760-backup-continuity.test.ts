import test from "node:test";
import assert from "node:assert/strict";
import { assessBackupContinuity, assertBackupContinuityAssessment } from "../src/application/runtime-backup-continuity.js";

test("first synthetic backup is ready without a predecessor", () => {
  const result = assessBackupContinuity({ schemaVersion: 1, backupId: "B-1", sourceRuntime: "LOCAL", sourceDeviceId: "D-1", sourceInstallationId: "I-1", createdAt: "2026-09-16T00:00:00Z", payloadFingerprint: "FP-1", syntheticOnly: true });
  assertBackupContinuityAssessment(result);
  assert.equal(result.decision, "READY");
});

test("chained synthetic backup requires the declared predecessor", () => {
  const previous = { schemaVersion: 1 as const, backupId: "B-1", sourceRuntime: "LOCAL" as const, sourceDeviceId: "D-1", sourceInstallationId: "I-1", createdAt: "2026-09-16T00:00:00Z", payloadFingerprint: "FP-1", syntheticOnly: true as const };
  const current = { schemaVersion: 1 as const, backupId: "B-2", sourceRuntime: "LAN" as const, sourceDeviceId: "D-2", sourceInstallationId: "I-2", createdAt: "2026-09-16T00:01:00Z", previousBackupId: "B-1", payloadFingerprint: "FP-2", syntheticOnly: true as const };
  const result = assessBackupContinuity(current, previous);
  assertBackupContinuityAssessment(result);
  assert.equal(result.decision, "READY");
  assert.throws(() => assessBackupContinuity({ ...current, previousBackupId: "B-TAMPER" }, previous));
});

test("backup predecessor reference without supplied predecessor is blocked", () => {
  const result = assessBackupContinuity({ schemaVersion: 1, backupId: "B-3", sourceRuntime: "LAN", sourceDeviceId: "D-3", sourceInstallationId: "I-3", createdAt: "2026-09-16T00:02:00Z", previousBackupId: "B-MISSING", payloadFingerprint: "FP-3", syntheticOnly: true });
  assert.equal(result.decision, "BLOCKED");
  assert.equal(result.chainValid, false);
});
