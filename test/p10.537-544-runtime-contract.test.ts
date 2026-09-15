import test from "node:test";
import assert from "node:assert/strict";
import { assertSafeRuntimeConfig, evaluateReadiness } from "../src/application/runtime-contract.js";

test("P10.537-544 readiness is healthy when all dependencies are ready", () => {
  const health = evaluateReadiness(
    { environment: "test", version: "0.1.0", aiEnabled: false, migrationFreeze: true },
    [{ name: "application", ready: true }, { name: "persistence", ready: true }],
  );
  assert.equal(health.status, "ok");
  assert.equal(health.dependencies.length, 2);
});

test("P10.537-544 readiness fails closed when a dependency is unavailable", () => {
  const health = evaluateReadiness(
    { environment: "test", version: "0.1.0", aiEnabled: false, migrationFreeze: true },
    [{ name: "application", ready: true }, { name: "persistence", ready: false, detail: "synthetic failure" }],
  );
  assert.equal(health.status, "failed");
  assert.equal(health.dependencies[1]?.ready, false);
});

test("P10.537-544 production runtime requires migration freeze", () => {
  assert.throws(
    () => assertSafeRuntimeConfig({ environment: "production", version: "0.1.0", aiEnabled: false, migrationFreeze: false }),
    /MIGRATION_FREEZE_REQUIRED/,
  );
});

test("P10.537-544 accepts frozen non-production synthetic runtime", () => {
  assert.doesNotThrow(() => assertSafeRuntimeConfig({ environment: "test", version: "0.1.0", aiEnabled: false, migrationFreeze: true }));
});
