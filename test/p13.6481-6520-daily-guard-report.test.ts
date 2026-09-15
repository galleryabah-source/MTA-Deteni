import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDailyGuardReportJourney } from "../src/application/daily-guard-report-journey.js";
import type { ReportSnapshot } from "../src/application/report-artifact.js";

const sections = Object.freeze({
  IDENTITAS_LAPORAN: "Laporan Harian Regu Jaga — Synthetic",
  PERSONEL_REGU: "Regu Bravo Pagi",
  KONDISI_DETENI: "Kondisi synthetic normal",
  KEGIATAN_JAGA: "Pemeriksaan blok synthetic",
  KEJADIAN_PENTING: "Tidak ada kejadian synthetic",
  SERAH_TERIMA: "Serah terima synthetic tercatat",
  PENGESAHAN: "Pengesahan synthetic",
});
const order = Object.keys(sections);
const snapshot: ReportSnapshot = Object.freeze({ snapshotId: "daily-guard-snapshot-01", sourceVersion: "daily-guard-rev-01", documentNumber: "LHR/BRAVO/PAGI/001", approvalBinding: "daily-guard-approval-01", provenance: Object.freeze(["synthetic-test"]), sections });

test("P13.6481 integrated daily guard report journey reaches validated download", () => {
  const journey = buildDailyGuardReportJourney({ snapshot, sectionOrder: order, previewId: "daily-preview-01", downloadId: "daily-download-01" });
  assert.equal(journey.syntheticOnly, true);
  assert.equal(journey.snapshotId, snapshot.snapshotId);
  assert.equal(journey.previewId, "daily-preview-01");
  assert.equal(journey.downloadId, "daily-download-01");
  assert.equal(journey.download.documentNumber, snapshot.documentNumber);
  assert.match(journey.download.content, /\[IDENTITAS_LAPORAN\]/);
  assert.match(journey.download.content, /\[PENGESAHAN\]/);
});

test("P13.6482 integrated journey fails closed on incomplete operational report", () => {
  const incomplete = { ...snapshot, sections: Object.freeze({ ...sections, KEGIATAN_JAGA: "" }) } as ReportSnapshot;
  assert.throws(() => buildDailyGuardReportJourney({ snapshot: incomplete, sectionOrder: order, previewId: "daily-preview-invalid", downloadId: "daily-download-invalid" }), /Missing mandatory report section/);
});
