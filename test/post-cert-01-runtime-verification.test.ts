import { strict as assert } from "node:assert";
import test from "node:test";
import {
  evaluatePostCert01,
  type PostCert01Contract,
} from "../src/application/post-cert-01-runtime-verification";

const base = (overrides = {}) => ({
  checkpoint: "POST-CERT-01-001",
  detaineeId: "DET-SYN-001",
  placement: "MOVED" as const,
  expectedHeadcount: 2,
  actualHeadcount: 2,
  qrContext: "RUDENIM_STAY" as const,
  qrValidity: "ACTIVE" as const,
  movementId: "MOV-SYN-001",
  auditEventId: "AUD-SYN-001",
  ...overrides,
});

const contract = (observation = base()): PostCert01Contract => ({
  contractId: "POST-CERT-01-SYNTHETIC",
  target: "SYNTHETIC",
  observations: [observation],
});

test("POST-CERT-01 accepts a complete canonical evidence observation", () => {
  const result = evaluatePostCert01(contract());
  assert.equal(result.status, "READY");
  assert.deepEqual(result.failedCheckpoints, []);
  assert.deepEqual(result.reasonCodes, []);
});

test("POST-CERT-01 blocks headcount drift", () => {
  const result = evaluatePostCert01(contract(base({ actualHeadcount: 1 })));
  assert.equal(result.status, "BLOCKED");
  assert.ok(result.reasonCodes.includes("HEADCOUNT_STATE_MISMATCH"));
});

test("POST-CERT-01 blocks exited detainee without active temporary-exit QR context", () => {
  const result = evaluatePostCert01(
    contract(
      base({
        placement: "EXITED",
        qrContext: "RUDENIM_STAY",
      }),
    ),
  );
  assert.equal(result.status, "BLOCKED");
  assert.ok(result.reasonCodes.includes("EXITED_QR_CONTEXT_INVALID"));
});

test("POST-CERT-01 blocks returned detainee without active stay QR context", () => {
  const result = evaluatePostCert01(
    contract(
      base({
        placement: "RETURNED",
        qrContext: "TEMPORARY_EXIT",
      }),
    ),
  );
  assert.equal(result.status, "BLOCKED");
  assert.ok(result.reasonCodes.includes("RETURNED_QR_CONTEXT_INVALID"));
});

test("POST-CERT-01 blocks missing movement or audit evidence", () => {
  const result = evaluatePostCert01(
    contract(
      base({
        movementId: "",
        auditEventId: "",
      }),
    ),
  );
  assert.equal(result.status, "BLOCKED");
  assert.ok(result.reasonCodes.includes("MOVEMENT_EVIDENCE_REQUIRED"));
  assert.ok(result.reasonCodes.includes("AUDIT_EVIDENCE_REQUIRED"));
});

test("POST-CERT-01 remains synthetic-only", () => {
  const result = evaluatePostCert01({
    contractId: "POST-CERT-01-PROD",
    target: "PRODUCTION" as never,
    observations: [base()],
  });
  assert.equal(result.status, "BLOCKED");
  assert.ok(result.reasonCodes.includes("SYNTHETIC_TARGET_REQUIRED"));
});
