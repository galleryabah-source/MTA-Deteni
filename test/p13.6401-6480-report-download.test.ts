import { test } from "node:test";
import assert from "node:assert/strict";
import { createReportPreview } from "../src/application/report-preview.js";
import { createReportDownload, assertReportDownload } from "../src/application/report-download.js";
import type { ReportSnapshot } from "../src/application/report-artifact.js";

const sections = Object.freeze({
  IDENTITAS_LAPORAN: "Laporan Harian Synthetic",
  PERSONEL_REGU: "Regu Bravo Pagi",
  KONDISI_DETENI: "Kondisi normal",
  KEGIATAN_JAGA: "Pemeriksaan",
  KEJADIAN_PENTING: "Tidak ada",
  SERAH_TERIMA: "Serah terima",
  PENGESAHAN: "Synthetic approval",
});
const order = Object.keys(sections);
const snapshot: ReportSnapshot = Object.freeze({ snapshotId: "download-snapshot-01", sourceVersion: "rev-download-01", documentNumber: "LAP/BRAVO/001", approvalBinding: "approval-download-01", provenance: Object.freeze(["synthetic-test"]), sections });

test("P13.6401 download consumes only a validated preview", () => {
  const preview = createReportPreview({ previewId: "preview-download-01", snapshot, sectionOrder: order });
  const download = createReportDownload({ downloadId: "download-01", preview, snapshot });
  assert.equal(download.snapshotId, snapshot.snapshotId);
  assert.equal(download.previewId, preview.previewId);
  assert.equal(download.filename, "LAP_BRAVO_001.txt");
  assert.doesNotThrow(() => assertReportDownload(download, preview, snapshot));
});

test("P13.6402 download rejects content tampering", () => {
  const preview = createReportPreview({ previewId: "preview-download-02", snapshot, sectionOrder: order });
  const download = createReportDownload({ downloadId: "download-02", preview, snapshot });
  const altered = { ...download, content: download.content + "tampered" } as typeof download;
  assert.throws(() => assertReportDownload(altered, preview, snapshot), /content mismatch/);
});

test("P13.6403 download rejects snapshot binding drift", () => {
  const preview = createReportPreview({ previewId: "preview-download-03", snapshot, sectionOrder: order });
  const download = createReportDownload({ downloadId: "download-03", preview, snapshot });
  const alteredSnapshot = { ...snapshot, snapshotId: "different-snapshot" } as ReportSnapshot;
  assert.throws(() => assertReportDownload(download, preview, alteredSnapshot), /binding mismatch/);
});
