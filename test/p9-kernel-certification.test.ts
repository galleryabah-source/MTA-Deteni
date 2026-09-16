import test from "node:test";
import assert from "node:assert/strict";
import { certifyP9Kernel } from "../src/application/p9-kernel-certification.ts";

test("P9.13 certifies only with the complete required control set", () => {
  const result = certifyP9Kernel("p9-cert-001", [
    { id: "P9.9", status: "PASS" },
    { id: "P9.10", status: "PASS" },
    { id: "P9.11", status: "PASS" },
    { id: "P9.12", status: "PASS" },
  ]);
  assert.equal(result.state, "CERTIFIED");
  assert.equal(result.productionAccessAuthorized, false);
  assert.equal(result.migrationExecuted, false);
  assert.equal(result.aiEnabled, false);
});

test("P9.13 remains not certified when a required control is missing", () => {
  const result = certifyP9Kernel("p9-cert-missing", [
    { id: "P9.9", status: "PASS" },
    { id: "P9.10", status: "PASS" },
    { id: "P9.11", status: "PASS" },
  ]);
  assert.equal(result.state, "NOT_CERTIFIED");
});

test("P9.13 remains not certified when a required control is pending or blocked", () => {
  const result = certifyP9Kernel("p9-cert-002", [
    { id: "P9.9", status: "PASS" },
    { id: "P9.10", status: "PASS" },
    { id: "P9.11", status: "PASS" },
    { id: "P9.12", status: "PENDING" },
  ]);
  assert.equal(result.state, "NOT_CERTIFIED");
});

test("P9.13 rejects duplicate control identities", () => {
  const result = certifyP9Kernel("p9-cert-duplicate", [
    { id: "P9.9", status: "PASS" },
    { id: "P9.9", status: "PASS" },
    { id: "P9.10", status: "PASS" },
    { id: "P9.11", status: "PASS" },
    { id: "P9.12", status: "PASS" },
  ]);
  assert.equal(result.state, "NOT_CERTIFIED");
});

test("P9.13 rejects empty certification identity and controls", () => {
  assert.throws(() => certifyP9Kernel("", [{ id: "P9.9", status: "PASS" }]), /P9_CERTIFICATION_ID_REQUIRED/);
  assert.throws(() => certifyP9Kernel("p9-cert-003", []), /P9_CERTIFICATION_CONTROLS_REQUIRED/);
});
