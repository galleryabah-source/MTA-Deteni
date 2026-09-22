import { MemoryLocalRuntimeAdapter } from "../src/application/local-runtime-adapter.js";
import { LocalRuntimeLanAdapter } from "../src/application/local-runtime-lan-adapter.js";
import { LocalRuntimeDeterministicSyncEngine } from "../src/application/local-runtime-deterministic-sync-engine.js";
import type { LocalRuntimeLanAdapterContract } from "../src/application/local-runtime-lan-adapter-contract.js";
import type { OfflineMutation } from "../src/application/local-runtime-offline-mutation-contract.js";

const contract: LocalRuntimeLanAdapterContract = Object.freeze({
  adapterId: "mta-local-runtime-synthetic",
  transport: "BROWSER_LOCAL",
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
const device = Object.freeze({
  deviceId: "SYN-LOCAL-DEVICE-0001",
  installationId: "SYN-LOCAL-INSTALL-0001",
  networkScopeId: "SYN-LAN-0001",
  deviceClass: "DESKTOP" as const,
});
const boundary = Object.freeze({
  serviceId: "mta-local-runtime",
  listenScope: "LOOPBACK_ONLY" as const,
  allowsInternetExposure: false as const,
  requiresAuthenticatedDevice: true as const,
});
const adapter = new MemoryLocalRuntimeAdapter();
const response = await adapter.execute({
  requestId: "REQ-LOCAL-RUNTIME-0001",
  actorId: device.deviceId,
  device,
  boundary,
  method: "POST",
  path: "/mta-local/reconcile",
  idempotencyKey: "IDEMP-LOCAL-RUNTIME-0001",
});
if (response.status !== "ACCEPTED") throw new Error("Local runtime adapter did not accept the governed synthetic request.");

const lan = new LocalRuntimeLanAdapter(contract);
const mutation: OfflineMutation = Object.freeze({
  mutationId: "MUT-LOCAL-RUNTIME-0001",
  idempotencyKey: "IDEMP-LOCAL-RUNTIME-0001",
  aggregateType: "DETAINEE",
  aggregateId: "SYN-DET-LOCAL-0001",
  operation: "MOVEMENT_RECORD",
  payload: Object.freeze({ type: "IN" }),
  baseVersion: "v1",
  payloadFingerprint: "FP-LOCAL-RUNTIME-0001",
  status: "QUEUED",
  createdAt: "2026-09-22T02:00:00.000Z",
  syntheticOnly: true,
});
const admitted = lan.admitMutation(mutation, "v1");
if (admitted.status !== "APPLIED") throw new Error(`Local LAN mutation admission failed: ${admitted.status}`);

const sync = new LocalRuntimeDeterministicSyncEngine();
const batch = Object.freeze({
  syncId: "SYNC-LOCAL-RUNTIME-0001",
  deviceId: device.deviceId,
  cursor: "cursor-1",
  sequenceStart: 1,
  mutations: Object.freeze([mutation]),
  syntheticOnly: true as const,
});
const syncResult = sync.buildResult(batch, new Map([["SYN-DET-LOCAL-0001", "v1"]]));
if (syncResult.results[0]?.disposition.status !== "APPLIED") throw new Error("Deterministic local sync did not apply the synthetic mutation.");

console.log(JSON.stringify({
  environment: "controlled-nonprod",
  syntheticOnly: true,
  productionAccessAuthorized: false,
  migrationExecuted: false,
  aiEnabled: false,
  adapter: response,
  mutation: admitted,
  sync: syncResult,
  note: "Executable adapter evidence; physical LAN/PC deployment remains an external acceptance gate."
}, null, 2));
