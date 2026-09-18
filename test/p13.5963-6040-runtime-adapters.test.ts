import { test } from "node:test";
import assert from "node:assert/strict";
import { enqueueOfflineCommand, reconcileOfflineCommand } from "../src/application/offline-continuity.js";
import { assertBackupChain, assertBackupManifest, assertBrowserTransportRequest, assertLanSession, assertLocalAdapterBoundary, MemoryQueueAdapter, type BackupManifest } from "../src/application/runtime-adapters.js";
import { DEFAULT_LOCAL_SERVICE_BOUNDARY, type LanDeviceIdentity } from "../src/application/runtime-surface.js";

test("P13.6041 stable queue identity replaces an equivalent command object", async () => {
  const queue = new MemoryQueueAdapter();
  const original = enqueueOfflineCommand({ commandId: "cmd-identity", aggregateId: "det-identity", commandType: "TEMPORARY_EXIT_REQUEST", payloadHash: "hash-001", idempotencyKey: "idem-identity", createdAt: "2026-09-15T12:00:00Z" });
  const replacement = { ...original, state: "SYNCED" as const };
  await queue.append(original);
  await queue.replaceByIdentity(replacement, (item) => item.commandId);
  assert.equal((await queue.list())[0]?.state, "SYNCED");
  assert.throws(() => queue.replaceByIdentity({ ...replacement, commandId: "missing" }, (item) => item.commandId), /not present/);
});

test("P13.5963 persistent queue preserves offline command identity", async () => {
  const queue = new MemoryQueueAdapter();
  const command = enqueueOfflineCommand({ commandId: "cmd-001", aggregateId: "det-001", commandType: "TEMPORARY_EXIT_REQUEST", payloadHash: "hash-001", idempotencyKey: "idem-001", createdAt: "2026-09-15T12:00:00Z" });
  await queue.append(command);
  const stored = await queue.list();
  assert.equal(stored.length, 1);
  assert.equal(stored[0]?.commandId, "cmd-001");
  assert.equal(reconcileOfflineCommand({ command, existingIdempotencyKeys: [], aggregateRevisionMatches: true }).action, "APPLY");
  assert.equal(reconcileOfflineCommand({ command, existingIdempotencyKeys: ["idem-001"], aggregateRevisionMatches: true }).action, "SKIP_DUPLICATE");
});

const device: LanDeviceIdentity = { deviceId: "tablet-01", installationId: "install-01", networkScopeId: "lan-rudenim-01", deviceClass: "TABLET" };

test("P13.5964 LAN session is bound to device installation and network", () => {
  const session = { sessionId: "session-01", device, authenticatedAt: "2026-09-15T12:00:00Z", expiresAt: "2026-09-15T13:00:00Z" } as const;
  assert.doesNotThrow(() => assertLanSession(session, device, "2026-09-15T12:30:00Z"));
  assert.throws(() => assertLanSession(session, { ...device, networkScopeId: "other-lan" }, "2026-09-15T12:30:00Z"), /binding mismatch/);
  assert.throws(() => assertLanSession(session, device, "2026-09-15T13:00:00Z"), /expired/);
});

test("P13.5965 browser and local adapter boundaries fail closed", () => {
  assert.doesNotThrow(() => assertBrowserTransportRequest({ requestId: "req-01", actorId: "actor-01", device, method: "GET", path: "/api/detainees" }));
  assert.doesNotThrow(() => assertBrowserTransportRequest({ requestId: "req-02", actorId: "actor-01", device, method: "POST", path: "/api/movement", idempotencyKey: "idem-02" }));
  assert.throws(() => assertBrowserTransportRequest({ requestId: "req-03", actorId: "actor-01", device, method: "POST", path: "/api/movement" }), /idempotency/);
  assert.doesNotThrow(() => assertLocalAdapterBoundary(DEFAULT_LOCAL_SERVICE_BOUNDARY, device));
  assert.throws(() => assertLocalAdapterBoundary(({ ...DEFAULT_LOCAL_SERVICE_BOUNDARY, allowsInternetExposure: true } as unknown as typeof DEFAULT_LOCAL_SERVICE_BOUNDARY), device), /unsafe/);
});

test("P13.5966 backup manifest chain is identity-linked and synthetic", () => {
  const first: BackupManifest = { schemaVersion: 1, backupId: "backup-001", sourceRuntime: "LAN", sourceDeviceId: "pc-01", sourceInstallationId: "install-pc-01", createdAt: "2026-09-15T12:00:00Z", payloadFingerprint: "payload-001", syntheticOnly: true };
  const second: BackupManifest = { ...first, backupId: "backup-002", createdAt: "2026-09-15T12:05:00Z", previousBackupId: "backup-001", payloadFingerprint: "payload-002" };
  assert.doesNotThrow(() => assertBackupManifest(first));
  assert.doesNotThrow(() => assertBackupChain(first, second));
  assert.throws(() => assertBackupChain({ ...first, backupId: "other" }, second), /chain reference mismatch/);
});
