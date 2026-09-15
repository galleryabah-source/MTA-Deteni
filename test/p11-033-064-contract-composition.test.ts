import assert from "node:assert/strict";
import test from "node:test";
import { evaluateQrReportComposition, evaluateQrReportCompositionGate } from "../src/application/p11-033-064-contract-composition.js";

test("P11.033-064 QR/report composition is deterministic and ready", () => {
  const gate = evaluateQrReportComposition("P11-QR-REPORT-001");
  assert.equal(evaluateQrReportCompositionGate(gate), "READY");
});

test("P11.057-064 composition gate fails closed on blank identity", () => {
  const gate = evaluateQrReportComposition("P11-QR-REPORT-001");
  assert.equal(evaluateQrReportCompositionGate({ ...gate, gateId: " " }), "BLOCKED");
});
