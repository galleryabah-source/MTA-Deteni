import assert from "node:assert/strict";
import test from "node:test";
import { composeOperationalAggregate } from "../src/application/p12-961-1000-domain-aggregate-composition.js";
import { buildReconciliationEvidence } from "../src/application/p12-1001-1040-reconciliation-evidence.js";
import { buildReportGenerationResult } from "../src/application/p12-1041-1080-report-generation-contract.js";
import { advanceOperatorWorkflow } from "../src/application/p12-1081-1120-controlled-operator-workflow.js";
import type { CanonicalOperationalEnvelope } from "../src/application/p12-841-880-canonical-operational-envelope.js";

const actor = { actorId: "ACT-SYN", role: "OPERATOR", domain: "KAMTIB" as const, scope: {}, correlationId: "CORR-SYN" };
const envelope: CanonicalOperationalEnvelope<{ synthetic: boolean }> = { operationId: "OP-SYN", aggregateId: "DET-SYN", detaineeId: "DET-SYN", correlationId: "CORR-SYN", actor, operationType: "HEADCOUNT", payload: { synthetic: true }, occurredAt: "2026-09-15T08:00:00Z" };

test("aggregate composition preserves identity", () => assert.equal(composeOperationalAggregate(envelope, [{ domain: "KAMTIB", aggregateId: "DET-SYN", detaineeId: "DET-SYN", payload: { synthetic: true } }]).aggregateId, "DET-SYN"));
test("reconciliation explicitly distinguishes match and mismatch", () => assert.equal(buildReconciliationEvidence({ reconciliationId: "REC-SYN", aggregateId: "DET-SYN", detaineeId: "DET-SYN", expectedCount: 3, observedCount: 2, checkedAt: "2026-09-15T09:00:00Z", evidenceIds: ["EV-SYN"] }).status, "MISMATCH"));
test("report generation is deterministic and snapshot-bound", () => assert.equal(buildReportGenerationResult({ reportType: "DAILY_GUARD", date: "2026-09-15", regu: "Bravo", shift: "Pagi", snapshot: { snapshotId: "SNAP-SYN", sourceVersion: "v1", sourceOperationIds: ["OP-SYN"], generatedAt: "2026-09-15T10:00:00Z", deterministicKey: "v1:OP-SYN" } }, "REPORT-SYN").deterministic, true));
test("operator workflow cannot skip governed stages", () => { const w = { workflowId: "WF-SYN", actor, stage: "DRAFT" as const, aggregateId: "DET-SYN", detaineeId: "DET-SYN" }; assert.equal(advanceOperatorWorkflow(w, "VALIDATED").stage, "VALIDATED"); assert.throws(() => advanceOperatorWorkflow(w, "APPROVED"), /OPERATOR_WORKFLOW_TRANSITION_DENIED/); });
