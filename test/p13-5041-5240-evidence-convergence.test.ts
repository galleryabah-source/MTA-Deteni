import test from "node:test";
import assert from "node:assert/strict";
import { assertObservationLedger } from "../src/application/p13-5041-5080-execution-observation-ledger.ts";
import { assertExecutionEnvironmentBoundary } from "../src/application/p13-5081-5120-execution-environment-boundary.ts";
import { assertBrowserLanAcceptanceMatrix } from "../src/application/p13-5121-5160-browser-lan-acceptance-matrix.ts";
import { assertReportSourceTemplateFidelity } from "../src/application/p13-5161-5200-report-source-template-fidelity.ts";
import { derivePreproductionGateStatus } from "../src/application/p13-5201-5240-evidence-driven-preproduction-gate.ts";

const iso = (offset: number) => new Date(Date.UTC(2026, 8, 15, 10, offset, 0)).toISOString();

const acceptance = (surface: "PC_SERVER" | "TABLET" | "SMARTPHONE", scenario: "ONLINE" | "OFFLINE_READ_ONLY" | "RECONNECT" | "PAIRING" | "REVOCATION") => ({
  scenarioId: `${surface}-${scenario}`,
  surface,
  scenario,
  expectedBehavior: "controlled synthetic acceptance",
  observed: true,
  passed: true,
  evidenceId: `EV-${surface}-${scenario}`,
  outputIdentity: `OUT-${surface}-${scenario}`,
});

test("P13.5041 observation ledger accepts ordered successful observations", () => {
  assertObservationLedger([
    { observationId: "O1", planId: "PLAN-1", stage: "TEST_SUITE", controlId: "TEST", evidenceId: "EV1", startedAt: iso(0), completedAt: iso(1), exitCode: 0, outputIdentity: "OUT1", status: "PASS" },
    { observationId: "O2", planId: "PLAN-1", stage: "RUNTIME", controlId: "RUNTIME", evidenceId: "EV2", startedAt: iso(2), completedAt: iso(3), exitCode: 0, outputIdentity: "OUT2", status: "PASS" },
  ], "PLAN-1");
});

test("P13.5041 rejects PASS with a non-zero exit code", () => {
  assert.throws(() => assertObservationLedger([
    { observationId: "O1", planId: "PLAN-1", stage: "TEST_SUITE", controlId: "TEST", evidenceId: "EV1", startedAt: iso(0), completedAt: iso(1), exitCode: 1, outputIdentity: "OUT1", status: "PASS" },
  ], "PLAN-1"), /EXECUTION_OBSERVATION_PASS_EXIT_CODE_INVALID/);
});

test("P13.5081 execution boundary remains synthetic and isolated", () => {
  assertExecutionEnvironmentBoundary({
    environment: "CONTROLLED_NONPROD",
    syntheticOnly: true,
    productionAuthorized: false,
    migrationFreeze: true,
    aiEnabled: false,
    liveDatabaseApproved: false,
    networkMode: "LOCAL_OR_ISOLATED_LAN",
    externalIntegrationsEnabled: false,
  });
});

test("P13.5121 matrix requires PC, tablet, smartphone and core continuity scenarios", () => {
  const items = [
    ...(["ONLINE", "OFFLINE_READ_ONLY", "RECONNECT", "PAIRING", "REVOCATION"] as const).map((scenario) => acceptance("PC_SERVER", scenario)),
    ...(["ONLINE", "OFFLINE_READ_ONLY", "RECONNECT", "PAIRING", "REVOCATION"] as const).map((scenario) => acceptance("TABLET", scenario)),
    ...(["ONLINE", "OFFLINE_READ_ONLY", "RECONNECT", "PAIRING", "REVOCATION"] as const).map((scenario) => acceptance("SMARTPHONE", scenario)),
  ];
  assertBrowserLanAcceptanceMatrix(items);
});

test("P13.5161 report fidelity requires exact source binding and visual review", () => {
  assertReportSourceTemplateFidelity({
    templateId: "DAILY-GUARD-REPORT",
    sourceSnapshotId: "SNAP-001",
    checks: [{ checkId: "C1", templateElement: "date", sourceField: "reportDate", expectedValue: "2026-09-15", actualValue: "2026-09-15", exactMatch: true, evidenceId: "EV-REPORT-1" }],
    visualReviewObserved: true,
    deterministicArtifact: true,
  });
});

test("P13.5201 remains observation-pending until every gate is evidenced", () => {
  assert.equal(derivePreproductionGateStatus({
    executionPlanCertified: false,
    observationLedgerComplete: false,
    browserLanAccepted: false,
    reportFidelityAccepted: false,
    recoveryRehearsalVerified: false,
    securityReviewPassed: false,
    migrationFreeze: true,
    aiEnabled: false,
    syntheticOnly: true,
    productionAuthorized: false,
  }), "OBSERVATION_PENDING");
});

test("P13.5201 can become ready for human approval only after all observed gates pass", () => {
  assert.equal(derivePreproductionGateStatus({
    executionPlanCertified: true,
    observationLedgerComplete: true,
    browserLanAccepted: true,
    reportFidelityAccepted: true,
    recoveryRehearsalVerified: true,
    securityReviewPassed: true,
    migrationFreeze: true,
    aiEnabled: false,
    syntheticOnly: true,
    productionAuthorized: false,
  }), "READY_FOR_HUMAN_APPROVAL");
});
