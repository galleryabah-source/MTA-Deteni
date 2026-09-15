import { strict as assert } from "node:assert";
import { assertOfflineSessionAllowsMutation } from "../src/application/p13-2681-2720-offline-session-boundary.js";
import { assertPairingAllowsSession } from "../src/application/p13-2721-2760-client-pairing.js";
import { assertReplayIsContiguous } from "../src/application/p13-2761-2800-sync-replay-order.ts";
import { createIntegrityEnvelope, assertIntegrityEnvelope } from "../src/application/p13-2801-2840-integrity-checksum.js";
import { assertDisasterRecoveryReady } from "../src/application/p13-2841-2880-disaster-recovery-rehearsal.js";

const pairing = { pairingId: "p1", serverId: "s1", deviceId: "d1", state: "PAIRED" as const, pairedAt: "2026-09-15T00:00:00Z", pairingFingerprint: "fp" };
const session = { sessionId: "s1", deviceId: "d1", state: "ONLINE" as const, startedAt: "2026-09-15T00:00:00Z", authoritySnapshotId: "a1" };
const journal = [
  { sequence: 1, queueId: "q1", operationFingerprint: "f1", createdAt: "2026-09-15T00:00:00Z" },
  { sequence: 2, queueId: "q2", operationFingerprint: "f2", createdAt: "2026-09-15T00:01:00Z" },
];
const envelope = createIntegrityEnvelope("synthetic-payload");

assertPairingAllowsSession(pairing);
assertOfflineSessionAllowsMutation(session);
assertReplayIsContiguous(journal);
assertIntegrityEnvelope(envelope);
assertDisasterRecoveryReady({ rehearsalId: "dr1", steps: ["BACKUP_SELECTED", "RESTORE_VERIFIED", "INTEGRITY_VERIFIED", "JOURNAL_REPLAYED", "READ_MODEL_REBUILT", "HUMAN_SIGNOFF"], syntheticOnly: true, productionAuthorized: false });
assert.equal(envelope.checksum.length, 8);
