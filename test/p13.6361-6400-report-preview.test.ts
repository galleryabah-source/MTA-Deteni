import { test } from "node:test";
import assert from "node:assert/strict";
import { createReportPreview, assertReportPreview } from "../src/application/report-preview.js";
import type { ReportSnapshot } from "../src/application/report-artifact.js";

const sections = {
  IDENTITAS_LAPORAN: "Laporan Harian Synthetic",
  PERSONEL_REGU: "Regu Bravo Pagi",
  KONDISI_DETENI: "Kondisi normal",
  KEGIATAN_JAGA: "Patroli dan pemeriksaan",
  KEJADIAN_PENTING: "Tidak ada",
  SERAH_TERIMA: "Serah terima tercatat",
  PENGESAHAN: "Synthetic approval",
};
const order = Object.keys(sections);
const snapshot: ReportSnapshot = Object.freeze({ snapshotId: "report-preview-01", sourceVersion: "rev-01", documentNumber: "DOC-SYN-001", approvalBinding: "approval-syn-01", provenance: Object.freeze(["synthetic-test"]), sections: Object.freeze(sections) });

test("P13.6361 preview is deterministically bound to the operational snapshot", () => {
  const preview = createReportPreview({ previewId: "preview-01", snapshot, sectionOrder: order });
  assert.equal(preview.snapshotId, snapshot.snapshotId);
  assert.equal(preview.documentNumber, snapshot.documentNumber);
  assert.deepEqual(preview.sectionOrder, order);
  assert.doesNotThrow(() => assertReportPreview(preview, snapshot));
});

test("P13.6362 preview rejects content tampering", () => {
  const preview = createReportPreview({ previewId: "preview-02", snapshot, sectionOrder: order });
  const tampered = { ...preview, content: preview.content + "tampered" } as typeof preview;
  assert.throws(() => assertReportPreview(tampered, snapshot), /content mismatch/);
});

test("P13.6363 preview rejects missing mandatory section", () => {
  const incomplete = { ...snapshot, sections: Object.freeze({ ...sections, PENGESAHAN: "" }) } as ReportSnapshot;
  assert.throws(() => createReportPreview({ previewId: "preview-invalid", snapshot: incomplete, sectionOrder: order }), /Missing mandatory report section/);
});
