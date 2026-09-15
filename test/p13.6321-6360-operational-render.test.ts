import { test } from "node:test";
import assert from "node:assert/strict";
import { renderOperationalReport, assertOperationalReportRender, type ReportSnapshot } from "../src/application/report-artifact.js";

const snapshot: ReportSnapshot = {
  snapshotId: "report-snapshot-synth-01",
  sourceVersion: "revision-synth-01",
  documentNumber: "LHR-SYNTH-001",
  approvalBinding: "approval-synth-01",
  provenance: ["synthetic-fixture"],
  sections: {
    IDENTITAS_LAPORAN: "Laporan Harian Regu Jaga",
    PERSONEL_REGU: "Regu Bravo Pagi",
    KONDISI_DETENI: "Kondisi aman dan terkendali",
    KEGIATAN_JAGA: "Pemeriksaan rutin",
    KEJADIAN_PENTING: "Tidak ada kejadian penting",
    SERAH_TERIMA: "Serah terima dilaksanakan",
    PENGESAHAN: "Pejabat berwenang",
  },
};
const order = ["IDENTITAS_LAPORAN", "PERSONEL_REGU", "KONDISI_DETENI", "KEGIATAN_JAGA", "KEJADIAN_PENTING", "SERAH_TERIMA", "PENGESAHAN"];

test("P13.6321 operational renderer is deterministic and snapshot-bound", () => {
  const first = renderOperationalReport({ snapshot, sectionOrder: order });
  const second = renderOperationalReport({ snapshot, sectionOrder: order });
  assert.equal(first.content, second.content);
  assert.deepEqual(first.sectionOrder, order);
  assert.doesNotThrow(() => assertOperationalReportRender(first, snapshot));
});

test("P13.6322 renderer rejects incomplete or reordered contract", () => {
  assert.throws(() => renderOperationalReport({ snapshot, sectionOrder: order.slice(0, -1) }), /section order is incomplete/);
  assert.throws(() => renderOperationalReport({ snapshot, sectionOrder: [...order.slice(1), order[0]] }), /invalid or duplicate/);
});

test("P13.6323 renderer rejects content drift", () => {
  const render = renderOperationalReport({ snapshot, sectionOrder: order });
  const tampered = { ...render, content: render.content + "tampered" } as typeof render;
  assert.throws(() => assertOperationalReportRender(tampered, snapshot), /content mismatch/);
});

test("P13.6324 mandatory source section remains fail-closed", () => {
  const invalid = { ...snapshot, sections: { ...snapshot.sections, KEGIATAN_JAGA: "" } } as ReportSnapshot;
  assert.throws(() => renderOperationalReport({ snapshot: invalid, sectionOrder: order }), /KEGIATAN_JAGA/);
});
