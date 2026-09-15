import assert from "node:assert/strict";
import test from "node:test";
import { evaluateQrValidityWindow, isContextCompatible } from "../src/application/p11-449-544-qr-validity.js";

const base = {
  checkpoint: "P11.449-456",
  context: "TEMPORARY_EXIT" as const,
  state: "ACTIVE" as const,
  validFrom: "2026-09-15T08:00:00Z",
  validUntil: "2026-09-15T12:00:00Z",
  scannedAt: "2026-09-15T10:00:00Z",
};

test("P11.449-544 accepts active QR inside validity window", () => assert.equal(evaluateQrValidityWindow(base), "ACCEPTED"));
test("P11.449-544 rejects scan before validity window", () => assert.equal(evaluateQrValidityWindow({ ...base, scannedAt: "2026-09-15T07:59:59Z" }), "REJECTED"));
test("P11.449-544 rejects expired state", () => assert.equal(evaluateQrValidityWindow({ ...base, state: "EXPIRED" }), "REJECTED"));
test("P11.449-544 rejects invalid window", () => assert.equal(evaluateQrValidityWindow({ ...base, validUntil: "2026-09-15T07:00:00Z" }), "REJECTED"));
test("P11.449-544 enforces QR context compatibility", () => {
  assert.equal(isContextCompatible("TEMPORARY_EXIT", "TEMPORARY_EXIT"), true);
  assert.equal(isContextCompatible("DEPORTATION", "TEMPORARY_EXIT"), false);
});
