import { mkdirSync, writeFileSync } from "node:fs";
import {
  verifyPostCert01Runtime,
  type PostCert01RuntimeState,
} from "../src/application/post-cert-01-runtime-verification";

const state: PostCert01RuntimeState = {
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
};

const verification = verifyPostCert01Runtime(state, {
  checkpoint: "POST-CERT-01-RUNTIME-001",
  detaineeId: "DET-SYN-001",
  roomId: "ROOM-SYN-01",
  placement: "MOVED",
});

const evidence = {
  certification: "POST-CERT-01",
  status: verification.status,
  environment: "controlled-nonprod",
  syntheticOnly: true,
  productionAccessAuthorized: false,
  migrationExecuted: false,
  aiEnabled: false,
  canonicalFlow: [
    "SCAN_OR_ACTION",
    "MOVEMENT",
    "PLACEMENT_STATE",
    "HEADCOUNT",
    "QR_CONTEXT",
    "CONSISTENCY_CHECK",
    "AUDIT",
    "EVIDENCE",
  ],
  result: verification,
};

if (verification.status !== "READY") {
  console.error(JSON.stringify(evidence, null, 2));
  process.exit(1);
}

mkdirSync("artifacts/mta-evidence", { recursive: true });
writeFileSync(
  "artifacts/mta-evidence/post-cert-01-runtime-verification.json",
  JSON.stringify(evidence, null, 2) + "\n",
);
console.log("POST-CERT-01 RUNTIME VERIFICATION: PASS");
