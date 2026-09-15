import { strict as assert } from "node:assert";
import { composeLocalDeviceRuntime } from "../src/application/p13-2201-2240-local-device-runtime.js";
import { evaluateSyncQueueItem } from "../src/application/p13-2241-2280-sync-queue-integrity.js";
import { assertRestoreVerified } from "../src/application/p13-2281-2320-backup-restore-evidence.js";
import { composeMultiDeviceAcceptance } from "../src/application/p13-2321-2360-multi-device-acceptance.js";
import { evaluateContinuityGate } from "../src/application/p13-2361-2400-continuity-gate.js";

const pc = composeLocalDeviceRuntime({ deviceId: "synthetic-pc", deviceClass: "PC", mode: "LOCAL", applicationVersion: "synthetic", offlineCapable: true, syntheticOnly: true });
const tablet = composeLocalDeviceRuntime({ deviceId: "synthetic-tablet", deviceClass: "TABLET", mode: "CLIENT", applicationVersion: "synthetic", offlineCapable: true, syntheticOnly: true });
const phone = composeLocalDeviceRuntime({ deviceId: "synthetic-phone", deviceClass: "SMARTPHONE", mode: "CLIENT", applicationVersion: "synthetic", offlineCapable: true, syntheticOnly: true });

const queue = evaluateSyncQueueItem({ queueId: "q-1", recordId: "r-1", sourceEvidenceId: "e-1", localVersion: 1, status: "FAILED", attempt: 3, enqueuedAt: "2026-09-15T00:00:00Z" });
assert.equal(queue.status, "BLOCKED");

const backup = { evidenceId: "be-1", backupId: "b-1", kind: "LOCAL" as const, createdAt: "2026-09-15T00:00:00Z", sourceVersion: "synthetic", restoreVerification: "VERIFIED" as const, syntheticOnly: true as const };
assertRestoreVerified(backup);

const acceptance = composeMultiDeviceAcceptance({ acceptanceId: "mda-1", devices: [pc, tablet, phone], requiredClasses: ["PC", "TABLET", "SMARTPHONE"], syntheticOnly: true });
assert.equal(evaluateContinuityGate({ runtimePackaged: true, queueIntegrityCertified: true, backupRestore: backup, multiDeviceAcceptance: acceptance, productionAuthorized: false, migrationFreeze: true }), "READY");
