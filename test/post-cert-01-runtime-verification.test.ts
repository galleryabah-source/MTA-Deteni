import { strict as assert } from "node:assert";
import test from "node:test";
import {
  evaluatePostCert01,
  type PostCert01Contract,
  type PostCert01Observation,
} from "../src/application/post-cert-01-runtime-verification.js";

const base = (
  overrides: Partial<PostCert01Observation> = {},
): PostCert01Observation => ({
  checkpoint: "POST-CERT-01-001",
  detaineeId: "DET-SYN-001",
  placement: "MOVED",
  expectedHeadcount: 2,
  actualHeadcount: 2,
  qrContext: "RUDENIM_STAY",
  qrValidity: "ACTIVE",
  movementId: "MOV-SYN-001",
  auditEventId: "AUD-SYN-001",
  ...overrides,
});

const contract = (
  observation: PostCert01Observation = base(),
): PostCert01Contract => ({
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

import {
  verifyPostCert01Runtime,
  type PostCert01RuntimeState,
} from "../src/application/post-cert-01-runtime-verification.js";

const runtimeState = (): PostCert01RuntimeState => ({
  target: "SYNTHETIC",
  detainees: [
    { id: "DET-SYN-001", status: "AKTIF" },
    { id: "DET-SYN-002", status: "AKTIF" },
    { id: "DET-SYN-003", status: "NONAKTIF" },
  ],
  placements: [
    {
      id: "PLC-SYN-001",
      detaineeId: "DET-SYN-001",
      roomId: "ROOM-SYN-01",
      since: "2026-09-27T08:00:00.000Z",
      movementId: "MOV-SYN-001",
      correlationId: "COR-SYN-001",
    },
    {
      id: "PLC-SYN-002",
      detaineeId: "DET-SYN-002",
      roomId: "ROOM-SYN-01",
      since: "2026-09-27T08:05:00.000Z",
      movementId: "MOV-SYN-002",
      correlationId: "COR-SYN-002",
    },
  ],
  movements: [
    {
      id: "MOV-SYN-001",
      detaineeId: "DET-SYN-001",
      toRoomId: "ROOM-SYN-01",
      correlationId: "COR-SYN-001",
    },
    {
      id: "MOV-SYN-002",
      detaineeId: "DET-SYN-002",
      toRoomId: "ROOM-SYN-01",
      correlationId: "COR-SYN-002",
    },
  ],
  rooms: [{ id: "ROOM-SYN-01", status: "ACTIVE" }],
  qr: {
    "DET-SYN-001": { context: "RUDENIM_STAY", validity: "ACTIVE" },
  },
  audit: [
    {
      id: "AUD-SYN-001",
      action: "MOVEMENT_CREATE",
      resourceType: "MOVEMENT",
      resourceId: "MOV-SYN-001",
      result: "SUCCESS",
      correlationId: "COR-SYN-001",
    },
  ],
});

test("POST-CERT-01 derives headcount from placement state and closes movement→audit chain", () => {
  const result = verifyPostCert01Runtime(runtimeState(), {
    checkpoint: "POST-CERT-01-RUNTIME-001",
    detaineeId: "DET-SYN-001",
    roomId: "ROOM-SYN-01",
    placement: "MOVED",
  });
  assert.equal(result.status, "READY");
  assert.deepEqual(result.reasonCodes, []);
});

test("POST-CERT-01 blocks missing correlated movement audit evidence", () => {
  const state = runtimeState();
  const result = verifyPostCert01Runtime(
    { ...state, audit: [] },
    {
      checkpoint: "POST-CERT-01-RUNTIME-002",
      detaineeId: "DET-SYN-001",
      roomId: "ROOM-SYN-01",
      placement: "MOVED",
    },
  );
  assert.equal(result.status, "BLOCKED");
  assert.ok(result.reasonCodes.includes("AUDIT_EVIDENCE_REQUIRED"));
});

test("POST-CERT-01 blocks placement drift instead of trusting reported headcount", () => {
  const state = runtimeState();
  const result = verifyPostCert01Runtime(
    {
      ...state,
      placements: state.placements.filter(
        (placement) => placement.detaineeId !== "DET-SYN-001",
      ),
    },
    {
      checkpoint: "POST-CERT-01-RUNTIME-003",
      detaineeId: "DET-SYN-001",
      roomId: "ROOM-SYN-01",
      placement: "MOVED",
    },
  );
  assert.equal(result.status, "BLOCKED");
  assert.ok(result.reasonCodes.includes("MOVEMENT_EVIDENCE_REQUIRED"));
  assert.ok(result.reasonCodes.includes("PLACEMENT_STATE_NOT_CANONICAL"));
});
