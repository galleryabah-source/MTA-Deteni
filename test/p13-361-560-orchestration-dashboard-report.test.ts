import { strict as assert } from "node:assert";
import { composeOperatorDashboard } from "../src/application/p13-421-480-dashboard-composition.js";
import { buildReportPreview } from "../src/application/p13-481-520-report-preview.js";
import { SYNTHETIC_ACCEPTANCE_SCENARIOS, validateSyntheticAcceptanceCatalog } from "../src/application/p13-521-560-synthetic-acceptance.js";
import type { OperatorDashboardReadModel } from "../src/application/read-model.js";
import type { ReguJagaReport } from "../src/application/reporting-contract.js";

validateSyntheticAcceptanceCatalog(SYNTHETIC_ACCEPTANCE_SCENARIOS);
assert.equal(SYNTHETIC_ACCEPTANCE_SCENARIOS.length, 10);

const dashboardSources: Parameters<typeof composeOperatorDashboard>[1] = {
  generatedAt: "2026-09-15T00:00:00.000Z",
  detainees: [],
  headcount: { capturedAt: "2026-09-15T00:00:00.000Z", totalActive: 0, byBlock: [], reconciliation: "MATCH" },
  pendingTemporaryExits: 0,
  pendingApprovals: 0,
  operationalAlerts: [],
};
const dashboard: OperatorDashboardReadModel = composeOperatorDashboard("ADMIN", dashboardSources);
assert.equal(dashboard.headcount.reconciliation, "MATCH");
assert.throws(() => composeOperatorDashboard("REVIEWER", { ...dashboardSources, pendingApprovals: -1 }), /DASHBOARD_COUNTER_INVALID/);

const report: ReguJagaReport = {
  reportId: "SYN-REPORT-001",
  reportDate: "2026-09-15",
  shift: "PAGI",
  teamName: "Regu Synthetic",
  generatedAt: "2026-09-15T00:00:00.000Z",
  sourceSnapshotId: "SNAP-001",
  sections: [
    { code: "IDENTITAS_LAPORAN", title: "Identitas", rows: [] },
    { code: "PERSONEL_REGU", title: "Personel", rows: [] },
    { code: "KONDISI_DETENI", title: "Kondisi", rows: [] },
    { code: "KEGIATAN_JAGA", title: "Kegiatan", rows: [] },
    { code: "KEJADIAN_PENTING", title: "Kejadian", rows: [] },
    { code: "SERAH_TERIMA", title: "Serah Terima", rows: [] },
    { code: "PENGESAHAN", title: "Pengesahan", rows: [] },
  ],
};
const preview = buildReportPreview(report);
assert.equal(preview.ready, true);
assert.equal(preview.sourceSnapshotId, "SNAP-001");
