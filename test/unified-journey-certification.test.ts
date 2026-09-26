import test from "node:test";
import assert from "node:assert/strict";
import { certifyUnifiedJourney, assertUnifiedJourneyCertification } from "../src/application/unified-journey-certification.js";

const base = {
  journeyId: "UJ-SYN-0001",
  syntheticOnly: true,
  scanReady: true, resolveReady: true, contextReady: true, actionReady: true,
  mutationReady: true, auditReady: true, monitorReady: true, reportReady: true, evidenceReady: true,
  correlationId: "CORR-UJ-0001",
  auditCorrelationId: "CORR-UJ-0001",
  reportCorrelationId: "CORR-UJ-0001",
};

test("unified journey certifies the complete operational chain", () => {
  const result = certifyUnifiedJourney(base);
  assert.equal(result.certified, true);
  assert.equal(result.syntheticOnly, true);
  assert.deepEqual(result.stages, {
    scan:"PASS", resolve:"PASS", context:"PASS", action:"PASS", mutation:"PASS",
    audit:"PASS", monitor:"PASS", report:"PASS", evidence:"PASS",
  });
  assertUnifiedJourneyCertification(result);
});

test("unified journey fails closed on correlation drift", () => {
  assert.throws(() => certifyUnifiedJourney({...base, reportCorrelationId:"CORR-DRIFT"}), /UNIFIED_JOURNEY_CORRELATION_DRIFT/);
});

test("unified journey fails closed when a mandatory stage is incomplete", () => {
  assert.throws(() => certifyUnifiedJourney({...base, mutationReady:false}), /UNIFIED_JOURNEY_MUTATION_BLOCKED/);
});

test("unified journey requires synthetic evidence", () => {
  assert.throws(() => certifyUnifiedJourney({...base, syntheticOnly:false}), /UNIFIED_JOURNEY_SYNTHETIC_ONLY_REQUIRED/);
});
