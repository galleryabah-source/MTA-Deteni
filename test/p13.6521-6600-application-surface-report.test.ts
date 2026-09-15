import { test } from "node:test";
import assert from "node:assert/strict";
import { createApplicationSurface } from "../src/application/application-surface.js";
import { createReportPreview } from "../src/application/report-preview.js";
import { createReportDownload } from "../src/application/report-download.js";
import { REFERENCE_TEXT_RENDERER, renderWithRenderer } from "../src/application/report-renderer.js";
import type { ReportSnapshot } from "../src/application/report-artifact.js";

const sections = {
  IDENTITAS_LAPORAN: "Laporan Harian Synthetic",
  PERSONEL_REGU: "Regu Bravo Pagi",
  KONDISI_DETENI: "Kondisi normal",
  KEGIATAN_JAGA: "Patroli synthetic",
  KEJADIAN_PENTING: "Tidak ada",
  SERAH_TERIMA: "Serah terima synthetic",
  PENGESAHAN: "Synthetic approval",
};
const order = Object.keys(sections);
const snapshot: ReportSnapshot = Object.freeze({ snapshotId: "surface-report-01", sourceVersion: "rev-01", documentNumber: "DOC/2026:BRAVO/01", approvalBinding: "approval-01", provenance: Object.freeze(["synthetic-test"]), sections: Object.freeze(sections) });
const surface = createApplicationSurface("REPORTS");

test("P13.6521 application surface exposes REPORTS and preserves responsive contracts", () => {
  assert.equal(surface.readModel.surface, "REPORTS");
  assert.equal(surface.responsive("SMARTPHONE").minimumTouchTargetPx, 44);
  assert.deepEqual(surface.navigation("OWNER"), ["DASHBOARD", "DETAINEE", "MOVEMENT", "TEMPORARY_EXIT", "QR", "REPORTS"]);
});

test("P13.6522 application report journey uses the validated renderer boundary", () => {
  const render = renderWithRenderer(REFERENCE_TEXT_RENDERER, snapshot, order);
  const preview = createReportPreview({ previewId: "surface-preview-01", snapshot, sectionOrder: order });
  const download = createReportDownload({ downloadId: "surface-download-01", preview, snapshot });
  assert.equal(render.snapshotId, snapshot.snapshotId);
  assert.equal(download.snapshotId, snapshot.snapshotId);
  assert.equal(download.content, preview.content);
  assert.equal(download.filename, "DOC_2026_BRAVO_01.txt");
  assert.equal(download.syntheticOnly, true);
});

test("P13.6523 renderer output cannot bypass snapshot integrity", () => {
  const render = renderWithRenderer(REFERENCE_TEXT_RENDERER, snapshot, order);
  const tampered = { ...render, content: render.content + "tampered" } as typeof render;
  assert.throws(() => renderWithRenderer({ ...REFERENCE_TEXT_RENDERER, render: () => tampered }, snapshot, order), /content mismatch/);
});
