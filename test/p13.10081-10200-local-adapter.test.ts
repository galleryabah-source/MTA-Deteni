import assert from "node:assert/strict";
import test from "node:test";
import { MemoryLocalRuntimeAdapter, assertLocalRuntimeRequest } from "../src/application/local-runtime-adapter.js";
import { DEFAULT_LOCAL_SERVICE_BOUNDARY } from "../src/application/runtime-surface.js";
import type { LocalRuntimeRequest } from "../src/application/local-runtime-adapter.js";

const device = { deviceId: "DEV-TABLET-01", installationId: "INST-LOCAL-01", networkScopeId: "NET-RUDENIM-01", deviceClass: "TABLET" as const };
const base = { requestId: "REQ-01", actorId: "ACTOR-01", device, method: "POST" as const, path: "/mta-local/movement", idempotencyKey: "IDEMP-01", boundary: DEFAULT_LOCAL_SERVICE_BOUNDARY } satisfies LocalRuntimeRequest;

test("P13.10081-10200: local adapter accepts authenticated synthetic LAN mutation", async () => {
  assert.doesNotThrow(() => assertLocalRuntimeRequest(base));
  const response = await new MemoryLocalRuntimeAdapter().execute(base);
  assert.equal(response.status, "ACCEPTED");
  assert.equal(response.requestId, base.requestId);
  assert.equal(response.syntheticOnly, true);
});

test("P13.10081-10200: mutation without idempotency is rejected", () => {
  assert.throws(() => assertLocalRuntimeRequest({ ...base, idempotencyKey: undefined }), /idempotency/i);
});

test("P13.10201-10320: external and non-local paths are rejected", () => {
  assert.throws(() => assertLocalRuntimeRequest({ ...base, path: "https://example.invalid/mta-local/movement" }), /absolute|local service/i);
  assert.throws(() => assertLocalRuntimeRequest({ ...base, path: "/api/movement" }), /local service/i);
});

test("P13.10321-10440: unauthenticated-device boundary cannot be admitted", () => {
  const unsafeBoundary = { ...DEFAULT_LOCAL_SERVICE_BOUNDARY, requiresAuthenticatedDevice: false as const } as never;
  assert.throws(() => assertLocalRuntimeRequest({ ...base, boundary: unsafeBoundary }), /authenticated/i);
});
