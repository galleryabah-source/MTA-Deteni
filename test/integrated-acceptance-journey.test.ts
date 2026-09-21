import test from "node:test";
import assert from "node:assert/strict";
import {
  assertIntegratedAcceptanceReady,
  certifyIntegratedAcceptance,
  INTEGRATED_ACCEPTANCE_JOURNEY_VERSION,
  type IntegratedAcceptanceInput,
} from "../src/application/integrated-acceptance-journey.js";

const ready: IntegratedAcceptanceInput = {
  journeyId: "IAJ-SYN-0001",
  syntheticOnly: true,
  domainReady: true,
  offlineReconnectReady: true,
  qrReady: true,
  reportReady: true,
  auditOutboxReady: true,
  lifecycleJourneyId: "LIFE-SYN-0001",
  offlineSessionId: "OFF-SYN-0001",
  reportSnapshotId: "REPORT-SYN-0001",
  qrSubjectId: "SYN-DET-0001",
  auditCorrelationId: "CORR-SYN-0001",
  outboxCorrelationId: "CORR-SYN-0001",
};

test("integrated acceptance composes all mandatory operational stages", () => {
  const result = certifyIntegratedAcceptance(ready);
  assert.equal(result.version, INTEGRATED_ACCEPTANCE_JOURNEY_VERSION);
  assert.equal(result.ready, true);
  assert.equal(result.syntheticOnly, true);
  assert.deepEqual(Object.values(result.stages), ["PASS", "PASS", "PASS", "PASS", "PASS"]);
  assert.equal(result.bindings.correlationId, "CORR-SYN-0001");
  assertIntegratedAcceptanceReady(result);
});

test("integrated acceptance blocks correlation drift between audit and outbox", () => {
  assert.throws(
    () => certifyIntegratedAcceptance({ ...ready, outboxCorrelationId: "CORR-SYN-DRIFT" }),
    /INTEGRATED_ACCEPTANCE_CORRELATION_DRIFT/,
  );
});

test("integrated acceptance blocks any incomplete stage", () => {
  assert.throws(
    () => certifyIntegratedAcceptance({ ...ready, reportReady: false }),
    /INTEGRATED_ACCEPTANCE_REPORT_BLOCKED/,
  );
});
