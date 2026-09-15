import { strict as assert } from "node:assert";
import { assertContinuitySessionCanMutate, assertContinuityTransition } from "../src/application/p13-2881-2920-continuity-session-lifecycle.js";
import { revokePairingState, revokeSessionState, validateDeviceRevocation } from "../src/application/p13-2921-2960-device-revocation.js";
import { assertConflictRequiresHumanReview, resolveSyncConflict } from "../src/application/p13-2961-3000-sync-conflict-resolution.js";
import { appendEvidence, assertEvidenceChainIntact, sealEvidenceChain } from "../src/application/p13-3001-3040-evidence-chain-sealing.js";
import { assertContinuityAcceptanceReady } from "../src/application/p13-3041-3080-continuity-e2e-acceptance.js";
import { assertContinuityReleaseReady } from "../src/application/p13-3081-3120-continuity-release-gate.js";

const session = { sessionId: "s1", deviceId: "d1", state: "ACTIVE" as const, authoritySnapshotId: "a1", startedAt: "2026-09-15T00:00:00Z", updatedAt: "2026-09-15T00:00:00Z" };
assertContinuitySessionCanMutate(session);
assertContinuityTransition("ACTIVE", "RECONNECTING");
assert.throws(() => assertContinuityTransition("CLOSED", "ACTIVE"), /TRANSITION_BLOCKED/);

const revocation = { deviceId: "d1", pairingId: "p1", reason: "synthetic test", revokedAt: "2026-09-15T00:02:00Z", initiatedBy: "operator-1" };
validateDeviceRevocation(revocation);
assert.equal(revokePairingState("PAIRED"), "REVOKED");
assert.equal(revokeSessionState("ACTIVE"), "REVOKED");

let conflict = { conflictId: "c1", recordId: "r1", kind: "SAME_RECORD_DIVERGENT_OPERATION" as const, localFingerprint: "local", remoteFingerprint: "remote", state: "DETECTED" as const, detectedAt: "2026-09-15T00:03:00Z" };
assertConflictRequiresHumanReview(conflict);
conflict = resolveSyncConflict(conflict, "synthetic human review resolution");
assert.equal(conflict.state, "RESOLVED");

let chain = { chainId: "chain-1", items: [], sealed: false };
chain = appendEvidence(chain, { evidenceId: "e1", payloadFingerprint: "payload-1" });
chain = appendEvidence(chain, { evidenceId: "e2", payloadFingerprint: "payload-2" });
assertEvidenceChainIntact(chain);
chain = sealEvidenceChain(chain, "2026-09-15T00:04:00Z");
assert.equal(chain.sealed, true);
assert.throws(() => appendEvidence(chain, { evidenceId: "e3", payloadFingerprint: "payload-3" }), /SEALED/);

assertContinuityAcceptanceReady({ acceptanceId: "a1", steps: ["CLIENT_PAIRED", "SESSION_ACTIVE", "OFFLINE_READ_ONLY", "QUEUE_RECORDED", "REPLAY_ORDERED", "INTEGRITY_VERIFIED", "CONFLICT_REVIEWED", "DEVICE_REVOKED", "RECOVERY_VERIFIED", "HUMAN_SIGNOFF"], syntheticOnly: true, productionAuthorized: false });
assertContinuityReleaseReady({ sessionLifecycle: true, deviceRevocation: true, conflictResolution: true, evidenceChainSealed: true, syntheticE2E: true, migrationFreeze: true, aiEnabled: false, productionAuthorized: false });
