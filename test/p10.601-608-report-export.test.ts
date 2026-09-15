import { test } from "node:test";
import assert from "node:assert/strict";
import { ReguJagaReportExportService } from "../src/application/report-export.js";
import type { ReguJagaReport } from "../src/application/reporting-contract.js";
import type { ActorContext } from "../src/domain/shared/contracts.js";

const actor: ActorContext = { actorId: "SYN-TU-001", role: "ADMIN", domain: "SUBBAG_TU", scope: { site: "SYN-RUDENIM" }, correlationId: "SYN-REPORT-001" };
const sections = ["IDENTITAS_LAPORAN", "PERSONEL_REGU", "KONDISI_DETENI", "KEGIATAN_JAGA", "KEJADIAN_PENTING", "SERAH_TERIMA", "PENGESAHAN"].map((code) => ({ code, title: code, rows: [{ label: "synthetic", value: "SYNTHETIC", provenance: "OPERATIONAL_READ_MODEL" as const }] }));
const report: ReguJagaReport = { reportId: "SYN-REPORT-001", reportDate: "2026-09-15", shift: "PAGI", teamName: "SYN-BRAVO", generatedAt: "2026-09-15T08:00:00Z", sections, sourceSnapshotId: "SYN-SNAPSHOT-001", documentNumber: "SYN-NO-001", approvalBinding: { approvalId: "SYN-APP-001", approvedAt: "2026-09-15T07:55:00Z", approvedBy: "SYN-LEADER-001" } };

test("regu jaga export preserves provenance and integrity metadata", async () => {
  const service = new ReguJagaReportExportService({ now: () => "2026-09-15T08:01:00Z", canExport: () => true, render: async () => ({ contentHash: "sha256-synthetic" }) });
  const artifact = await service.export(report, "DOCX", actor);
  assert.equal(artifact.reportId, report.reportId);
  assert.equal(artifact.sourceSnapshotId, report.sourceSnapshotId);
  assert.equal(artifact.contentHash, "sha256-synthetic");
});

test("regu jaga export rejects incomplete report", async () => {
  const service = new ReguJagaReportExportService({ now: () => "2026-09-15T08:01:00Z", canExport: () => true, render: async () => ({ contentHash: "sha256-synthetic" }) });
  await assert.rejects(() => service.export({ ...report, sections: [] }, "PDF", actor));
});
