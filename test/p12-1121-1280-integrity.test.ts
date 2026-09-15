import assert from "node:assert/strict";
import test from "node:test";
import { composeDomainAggregate } from "../src/application/p12-1121-1160-domain-aggregate-composition.js";
import { assertReconciliationAllowsPromotion, buildReconciliationEvidence } from "../src/application/p12-1161-1200-reconciliation-evidence.js";
import { buildReportArtifact } from "../src/application/p12-1201-1240-report-artifact-contract.js";
import { advanceOperatorWorkflow } from "../src/application/p12-1241-1280-controlled-operator-workflow.js";

test("domain aggregate composition rejects identity drift", () => {
  const base = { domain: "RAP" as const, aggregateId: "AGG-SYN", detaineeId: "DET-SYN", correlationId: "CORR-SYN", sourceVersion: "v1" };
  assert.equal(composeDomainAggregate([base, { ...base, domain: "KAMTIB" }]).parts.length, 2);
  assert.throws(() => composeDomainAggregate([base, { ...base, detaineeId: "DET-DRIFT" }]), /DOMAIN_AGGREGATE_IDENTITY_DRIFT/);
});

test("reconciliation mismatch blocks promotion", () => {
  const mismatch = buildReconciliationEvidence({ reconciliationId: "REC-SYN", subject: "headcount", expected: 3, observed: 2, generatedAt: "2026-09-15T10:00:00Z", sourceVersion: "v1" });
  assert.equal(mismatch.status, "MISMATCH");
  assert.throws(() => assertReconciliationAllowsPromotion(mismatch), /RECONCILIATION_MISMATCH_BLOCKS_PROMOTION/);
});

test("report artifact carries deterministic snapshot provenance", () => {
  const snapshot = { snapshotId: "SNAP-SYN", sourceVersion: "v1", sourceOperationIds: ["OP-SYN"], generatedAt: "2026-09-15T10:00:00Z", deterministicKey: "v1:OP-SYN" };
  const artifact = buildReportArtifact({ artifactId: "ART-SYN", snapshot, format: "TEXT", content: "synthetic report", generatedAt: "2026-09-15T10:00:01Z" });
  assert.equal(artifact.snapshot.deterministicKey, "v1:OP-SYN");
  assert.ok(artifact.contentHash.length > 0);
});

test("operator workflow allows only declared transitions", () => {
  assert.equal(advanceOperatorWorkflow("DRAFT", "VALIDATED"), "VALIDATED");
  assert.throws(() => advanceOperatorWorkflow("DRAFT", "APPROVED"), /OPERATOR_WORKFLOW_TRANSITION_DENIED/);
});
