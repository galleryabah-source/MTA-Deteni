import { strict as assert } from "node:assert";
import { assertLocalServerReady } from "../src/application/p13-2441-2480-local-server-bootstrap.js";
import { assertTrustedLanClient } from "../src/application/p13-2481-2520-lan-client-discovery.js";
import { assertJournalMayApply } from "../src/application/p13-2521-2560-durable-sync-journal.js";
import { evaluateBackupRotation } from "../src/application/p13-2561-2600-backup-rotation.js";
import { evaluateContinuityRuntime } from "../src/application/p13-2601-2640-continuity-runtime-gate.js";

const server = { serverId: "server-1", bindAddress: "127.0.0.1", port: 3100, state: "READY" as const, databaseMode: "LOCAL_NONPROD" as const, internetRequired: false as const, syntheticOnly: true as const };
const client = { clientId: "client-1", deviceId: "device-1", address: "192.168.1.20", discoveredAt: "2026-09-15T00:00:00Z", trusted: true };
const journal = { sequence: 1, queueId: "q-1", recordId: "r-1", sourceEvidenceId: "e-1", operationFingerprint: "fp-1", state: "APPENDED" as const, createdAt: "2026-09-15T00:00:00Z" };
const policy = { maxRetained: 3, requireVerifiedRestoreBeforeRotation: true as const, syntheticOnly: true as const };

assertLocalServerReady(server);
assertTrustedLanClient(client);
assertJournalMayApply(journal);
assert.equal(evaluateBackupRotation(policy, true, 2), "ALLOW");
assert.equal(evaluateContinuityRuntime({ server, clients: [client], journalEntries: [journal], backupPolicy: policy, verifiedRestoreAvailable: true }), "READY");
assert.equal(evaluateContinuityRuntime({ ...({ server, clients: [{ ...client, trusted: false }], journalEntries: [journal], backupPolicy: policy, verifiedRestoreAvailable: true }) }), "BLOCKED");
