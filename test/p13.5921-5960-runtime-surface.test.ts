import test from "node:test";
import assert from "node:assert/strict";
import type { LocalServiceBoundary } from "../src/application/runtime-surface.js";
import { assertLanDeviceIdentity, assertLocalServiceBoundary, navigationForRole, assertNavigationAllowed, RESPONSIVE_INVARIANTS } from "../src/application/runtime-surface.js";
import { assertBackupRestoreChain, assertContinuityEvidence, createContinuityEvidence } from "../src/application/continuity-evidence.js";

test("P13.5921 responsive invariants cover all device classes", () => {
  for (const device of ["DESKTOP", "TABLET", "SMARTPHONE"] as const) {
    assert.equal(RESPONSIVE_INVARIANTS[device].minimumTouchTargetPx, 44);
    assert.equal(RESPONSIVE_INVARIANTS[device].requiresHorizontalScroll, false);
  }
});

test("P13.5922 navigation is deny-by-default", () => {
  assert.ok(navigationForRole("AUDITOR").includes("REPORTS"));
  assert.doesNotThrow(() => assertNavigationAllowed("AUDITOR", "REPORTS"));
  assert.throws(() => assertNavigationAllowed("UNKNOWN", "DASHBOARD"));
});

test("P13.5923 LAN device identity is mandatory", () => {
  assert.doesNotThrow(() => assertLanDeviceIdentity({ deviceId: "device-01", installationId: "install-01", networkScopeId: "lan-01", deviceClass: "TABLET" }));
  assert.throws(() => assertLanDeviceIdentity({ deviceId: "", installationId: "install-01", networkScopeId: "lan-01", deviceClass: "TABLET" }));
});

test("P13.5924 local service fails closed against internet exposure", () => {
  assert.doesNotThrow(() => assertLocalServiceBoundary({ serviceId: "mta-local-runtime", listenScope: "LAN_ONLY", allowsInternetExposure: false, requiresAuthenticatedDevice: true }));
  assert.throws(() => assertLocalServiceBoundary(({ serviceId: "mta-local-runtime", listenScope: "LAN_ONLY", allowsInternetExposure: true, requiresAuthenticatedDevice: true } as unknown as LocalServiceBoundary)));
});

test("P13.5925 continuity evidence binds execution identity", () => {
  const evidence = createContinuityEvidence({ controlId: "P13.5925", executionId: "exec-01", commitSha: "abc123", environment: "controlled-nonprod", occurredAt: "2026-09-15T00:00:00Z", result: "PASS" });
  assert.doesNotThrow(() => assertContinuityEvidence(evidence));
  assert.throws(() => assertContinuityEvidence({ ...evidence, commitSha: "tampered" }));
});

test("P13.5926 restore must bind exact backup identity", () => {
  const backup = { backupId: "backup-01", sourceRuntime: "LAN" as const, sourceDeviceId: "device-01", createdAt: "2026-09-15T00:00:00Z", manifestFingerprint: "synthetic-manifest", syntheticOnly: true as const };
  assert.doesNotThrow(() => assertBackupRestoreChain(backup, { restoreId: "restore-01", backupId: "backup-01", targetRuntime: "LOCAL", targetDeviceId: "device-02", restoredAt: "2026-09-15T00:01:00Z", result: "RESTORED" }));
  assert.throws(() => assertBackupRestoreChain(backup, { restoreId: "restore-02", backupId: "other", targetRuntime: "LOCAL", targetDeviceId: "device-02", restoredAt: "2026-09-15T00:01:00Z", result: "RESTORED" }));
});
