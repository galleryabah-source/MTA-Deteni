import { mkdir, writeFile } from "node:fs/promises";
import { LocalRuntimeLanAdapter } from "../src/application/local-runtime-lan-adapter.js";
import { LocalRuntimeDeterministicSyncEngine } from "../src/application/local-runtime-deterministic-sync-engine.js";
import type { LocalRuntimeLanAdapterContract } from "../src/application/local-runtime-lan-adapter-contract.js";
import type { OfflineMutation } from "../src/application/local-runtime-offline-mutation-contract.js";
import type { OfflineSyncBatch } from "../src/application/local-runtime-offline-sync-contract.js";

const contract: LocalRuntimeLanAdapterContract = Object.freeze({
  adapterId: "MTA-LAN-SYN-001",
  transport: "LAN_HTTP",
  persistence: "BROWSER_LOCAL_STORAGE",
  hostBoundary: "LOCAL_NETWORK_ONLY",
  databaseBoundary: "NONPRODUCTION_LOCAL_ONLY",
  authentication: "REQUIRED",
  authorization: "DENY_BY_DEFAULT",
  audit: "REQUIRED",
  offlineQueue: "REQUIRED",
  idempotency: "REQUIRED",
  conflictPolicy: "REVIEW_REQUIRED",
  syntheticOnly: true,
});

const adapter = new LocalRuntimeLanAdapter(contract);
const mutation: OfflineMutation = Object.freeze({
  mutationId: "MUT-LAN-SYN-001",
  idempotencyKey: "IDEMP-LAN-SYN-001",
  aggregateType: "DETAINEE",
  aggregateId: "SYN-DET-LAN-001",
  operation: "MOVEMENT_RECORD",
  payload: Object.freeze({ type: "IN" }),
  baseVersion: "v1",
  payloadFingerprint: "FP-LAN-SYN-001",
  status: "QUEUED",
  createdAt: "2026-09-22T02:00:00.000Z",
  syntheticOnly: true,
});

const first = adapter.admitMutation(mutation, "v1");
if (first.status !== "APPLIED" || !first.effectApplied) throw new Error("Local runtime first admission did not APPLY.");

const replay = adapter.admitMutation(mutation, "v1");
if (replay.status !== "REPLAYED" || replay.effectApplied) throw new Error("Local runtime replay did not deduplicate.");

const conflict = adapter.admitMutation(
  Object.freeze({ ...mutation, mutationId: "MUT-LAN-SYN-002", payloadFingerprint: "FP-LAN-SYN-DRIFT" }),
  "v1",
);
if (conflict.status !== "CONFLICT" || conflict.reasonCode !== "FINGERPRINT_CONFLICT") throw new Error("Local runtime fingerprint conflict was not fail-closed.");

const syncEngine = new LocalRuntimeDeterministicSyncEngine();
const batch: OfflineSyncBatch = Object.freeze({
  syncId: "SYNC-LAN-SYN-001",
  deviceId: "DEV-LAN-SYN-001",
  cursor: "cursor-0",
  sequenceStart: 1,
  mutations: Object.freeze([mutation]),
  syntheticOnly: true,
});
const sync = syncEngine.buildResult(batch, new Map([["SYN-DET-LAN-001", "v1"]]));
if (sync.results[0]?.disposition.status !== "APPLIED" || sync.acceptedThroughSequence !== 1) throw new Error("Deterministic sync did not apply the queued mutation.");

await mkdir("artifacts/mta-evidence", { recursive: true });
await writeFile(
  "artifacts/mta-evidence/local-runtime-recovery.json",
  JSON.stringify({
    executionId: process.env.GITHUB_RUN_ID ?? "local",
    commitSha: process.env.GITHUB_SHA ?? "local",
    environment: process.env.MTA_EXECUTION_ENV ?? "controlled-nonprod",
    syntheticOnly: true,
    productionAccessAuthorized: false,
    migrationExecuted: false,
    aiEnabled: false,
    adapter: {
      adapterId: contract.adapterId,
      hostBoundary: contract.hostBoundary,
      databaseBoundary: contract.databaseBoundary,
      authentication: contract.authentication,
      authorization: contract.authorization,
    },
    observations: {
      firstAdmission: first,
      replay: replay,
      fingerprintConflict: conflict,
      deterministicSync: sync,
    },
    result: "PASS",
  }, null, 2) + "\n",
  "utf8",
);
console.log("LOCAL_RUNTIME_RECOVERY=PASS");
