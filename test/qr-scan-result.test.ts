import { strict as assert } from "node:assert";
import { verifyQrScan } from "../src/application/qr-scan-result";

const base={context:"DETAINEE" as const,detaineeId:"D-1",issuedAt:"2026-09-22T08:00:00.000Z",expiresAt:"2026-09-22T10:00:00.000Z"};
const now="2026-09-22T09:00:00.000Z";
assert.equal(verifyQrScan({payload:base,expectedContext:"RUDENIM_STAY",now}).outcome,"ACCEPTED");
assert.equal(verifyQrScan({payload:{...base,context:"TEMPORARY_EXIT"},expectedContext:"RUDENIM_STAY",now}).outcome,"CONTEXT_MISMATCH");
assert.equal(verifyQrScan({payload:{...base,expiresAt:"2026-09-22T08:59:00.000Z"},expectedContext:"RUDENIM_STAY",now}).outcome,"EXPIRED");
assert.equal(verifyQrScan({payload:{...base,issuedAt:"2026-09-22T09:01:00.000Z"},expectedContext:"RUDENIM_STAY",now}).outcome,"FUTURE");
assert.equal(verifyQrScan({payload:base,expectedContext:"RUDENIM_STAY",now,activeDetainee:false}).outcome,"INACTIVE");
assert.equal(verifyQrScan({payload:base,expectedContext:"DEPORTATION",now}).nextAction,"REVIEW");
console.log("QR_SCAN_RESULT_TEST PASS");
