import assert from "node:assert/strict";
import test from "node:test";
import { evaluateIntegrityGate } from "../src/application/p11-097-128-integrity-gate.js";

test("P11.097-104 requires complete synthetic evidence identity", () => {
  const base = { checkpoint: "P11.097", control: "negative-path", status: "PASS" as const, identity: "OBS-001", digest: "sha256:synthetic", details: "observed" };
  assert.equal(evaluateIntegrityGate({ gateId: "IG-001", target: "SYNTHETIC", observations: [base] }), "READY");
  assert.equal(evaluateIntegrityGate({ gateId: "IG-001", target: "SYNTHETIC", observations: [{ ...base, identity: " " }] }), "BLOCKED");
});

test("P11.105-112 blocks failed or incomplete cross-boundary observations", () => {
  const base = { checkpoint: "P11.105", control: "cross-boundary", status: "PASS" as const, identity: "OBS-002", digest: "sha256:synthetic", details: "observed" };
  assert.equal(evaluateIntegrityGate({ gateId: "IG-002", target: "SYNTHETIC", observations: [{ ...base, status: "FAIL" }] }), "BLOCKED");
  assert.equal(evaluateIntegrityGate({ gateId: "IG-002", target: "SYNTHETIC", observations: [{ ...base, digest: "" }] }), "BLOCKED");
});

test("P11.113-128 remains synthetic-only and fail-closed", () => {
  const base = { checkpoint: "P11.113", control: "boundary", status: "PASS" as const, identity: "OBS-003", digest: "sha256:synthetic", details: "synthetic observation" };
  assert.equal(evaluateIntegrityGate({ gateId: "IG-003", target: "SYNTHETIC", observations: [base] }), "READY");
  assert.equal(evaluateIntegrityGate({ gateId: "IG-003", target: "NON_PRODUCTION" as never, observations: [base] }), "BLOCKED");
  assert.equal(evaluateIntegrityGate({ gateId: "IG-003", target: "SYNTHETIC", observations: [] }), "BLOCKED");
});
