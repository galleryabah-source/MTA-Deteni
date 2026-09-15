import test from "node:test";
import assert from "node:assert/strict";
import { assertBrowserTransportRequest, assertBackupManifest } from "../src/application/runtime-transport.js";
import { DEFAULT_LOCAL_SERVICE_BOUNDARY } from "../src/application/runtime-surface.js";

test("P13.5961 transport requires idempotency for mutations", () => {
  const base = { requestId: "req-01", device: { deviceId: "dev-01", installationId: "inst-01", networkScopeId: "lan-01", deviceClass: "SMARTPHONE" as const }, path: "/api/detainee" };
  assert.doesNotThrow(() => assertBrowserTransportRequest({ ...base, method: "GET" }, DEFAULT_LOCAL_SERVICE_BOUNDARY));
  assert.doesNotThrow(() => assertBrowserTransportRequest({ ...base, method: "POST", idempotencyKey: "idem-01" }, DEFAULT_LOCAL_SERVICE_BOUNDARY));
  assert.throws(() => assertBrowserTransportRequest({ ...base, method: "POST" }, DEFAULT_LOCAL_SERVICE_BOUNDARY));
});

test("P13.5962 backup manifest is identity-bound and synthetic-only", () => {
  assert.doesNotThrow(() => assertBackupManifest({ manifestVersion: "v1", backupId: "backup-01", sourceRuntime: "LAN", sourceDeviceId: "dev-01", createdAt: "2026-09-15T00:00:00Z", recordCount: 0, syntheticOnly: true }));
  assert.throws(() => assertBackupManifest({ manifestVersion: "v1", backupId: "", sourceRuntime: "LAN", sourceDeviceId: "dev-01", createdAt: "2026-09-15T00:00:00Z", recordCount: 0, syntheticOnly: true }));
  assert.throws(() => assertBackupManifest({ manifestVersion: "v1", backupId: "backup-02", sourceRuntime: "LAN", sourceDeviceId: "dev-01", createdAt: "2026-09-15T00:00:00Z", recordCount: -1, syntheticOnly: true }));
});
