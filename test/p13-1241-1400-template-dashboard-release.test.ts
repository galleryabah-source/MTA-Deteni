import assert from "node:assert/strict";
import test from "node:test";
import type { ReguJagaReport } from "../src/application/reporting-contract.js";
import { assertReportMatchesTemplate } from "../src/application/p13-1241-1300-report-template-contract.js";
import { deriveOperationalDashboardState } from "../src/application/p13-1301-1360-operational-dashboard-state.js";
import { buildSyntheticReleaseEvidence } from "../src/application/p13-1361-1400-synthetic-release-evidence.js";

const report: ReguJagaReport = {
  reportId: "report-1", reportDate: "2026-09-15", shift: "PAGI", teamName: "Bravo", generatedAt: "2026-09-15T08:00:00Z", sourceSnapshotId: "snapshot-1",
  sections: [
    { code: "IDENTITAS_LAPORAN", title: "Identitas", rows: [] },
    { code: "PERSONEL_REGU", title: "Personel", rows: [] },
  ],
};

test("report template enforces required sections", () => {
  const template = { templateId: "regu-jaga", version: "1", format: "PDF" as const, blocks: [
    { code: "IDENTITAS_LAPORAN", title: "Identitas", required: true, order: 1 },
    { code: "PERSONEL_REGU", title: "Personel", required: true, order: 2 },
  ] };
  assert.doesNotThrow(() => assertReportMatchesTemplate(report, template));
  assert.throws(() => assertReportMatchesTemplate(report, { ...template, blocks: [{ ...template.blocks[0], order: 1 }, { ...template.blocks[1], code: "IDENTITAS_LAPORAN", order: 1 }] }), /REPORT_TEMPLATE_ORDER_DUPLICATE/);
});

test("dashboard state prioritizes reconciliation risk", () => {
  assert.equal(deriveOperationalDashboardState({ headcountReconciliation: "PENDING", alertCount: 0, pendingTemporaryExits: 0, pendingApprovals: 0 }).state, "RECONCILIATION_PENDING");
  assert.equal(deriveOperationalDashboardState({ headcountReconciliation: "MISMATCH", alertCount: 0, pendingTemporaryExits: 0, pendingApprovals: 0 }).state, "CRITICAL");
  assert.equal(deriveOperationalDashboardState({ headcountReconciliation: "MATCH", alertCount: 1, pendingTemporaryExits: 0, pendingApprovals: 0 }).state, "ATTENTION");
});

test("release evidence is permanently synthetic by contract", () => {
  const evidence = buildSyntheticReleaseEvidence({ evidenceId: "evidence-1", branch: "phase-p12.961-13.200", commitSha: "abc123", checks: ["TEMPLATE", "DASHBOARD"], capturedAt: "2026-09-15T02:00:00Z" });
  assert.equal(evidence.syntheticOnly, true);
  assert.equal(evidence.migrationFreeze, true);
  assert.equal(evidence.aiEnabled, false);
  assert.equal(evidence.productionAuthorized, false);
});
