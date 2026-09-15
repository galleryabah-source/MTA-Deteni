import { test } from "node:test";
import assert from "node:assert/strict";
import { assertReportGovernance, REPORT_GOVERNANCE_GATE } from "../src/application/reporting-governance.js";
import { renderOperationalReport, type ReportSnapshot } from "../src/application/report-artifact.js";

const base: ReportSnapshot = {
  snapshotId: "gov-synth-01", sourceVersion: "rev-gov-01", documentNumber: "DOC-GOV-01", approvalBinding: "approval-gov-01", provenance: ["synthetic-fixture"],
  sections: { IDENTITAS_LAPORAN: "A", PERSONEL_REGU: "B", KONDISI_DETENI: "C", KEGIATAN_JAGA: "D", KEJADIAN_PENTING: "E", SERAH_TERIMA: "F", PENGESAHAN: "G" },
};

test("P13.6361 reporting governance remains fail-closed", () => {
  assert.equal(REPORT_GOVERNANCE_GATE.syntheticOnly, true);
  assert.equal(REPORT_GOVERNANCE_GATE.migrationAllowed, false);
  assert.equal(REPORT_GOVERNANCE_GATE.productionPersistenceAllowed, false);
  assert.equal(REPORT_GOVERNANCE_GATE.aiRequired, false);
  assert.doesNotThrow(() => assertReportGovernance(base));
});

test("P13.6362 production provenance is rejected", () => {
  const invalid = { ...base, provenance: ["synthetic-fixture", "production"] } as ReportSnapshot;
  assert.throws(() => assertReportGovernance(invalid), /Production provenance/);
});

test("P13.6363 operational rendering executes through governance boundary", () => {
  const order = ["IDENTITAS_LAPORAN", "PERSONEL_REGU", "KONDISI_DETENI", "KEGIATAN_JAGA", "KEJADIAN_PENTING", "SERAH_TERIMA", "PENGESAHAN"];
  assert.doesNotThrow(() => renderOperationalReport({ snapshot: base, sectionOrder: order }));
});
