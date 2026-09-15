import test from "node:test";
import assert from "node:assert/strict";
import {
  DAILY_GUARD_PRESENTATION_CONTRACT,
  assertDailyGuardPresentationContract,
  mapSnapshotToDailyGuardPresentation,
} from "../src/application/daily-guard-report-template.js";
import { DAILY_GUARD_SECTION_ORDER } from "../src/application/daily-guard-report-contract.js";
import { renderSyntheticDocumentAdapter } from "../src/application/daily-guard-report-render-adapters.js";
import type { ReportSnapshot } from "../src/application/report-artifact.js";

function snapshot(): ReportSnapshot {
  return {
    snapshotId: "snapshot-6801",
    sourceVersion: "synthetic-6801",
    documentNumber: "MTA-DETENI/2026/001",
    approvalBinding: "approval-6801",
    provenance: ["synthetic-fixture"],
    sections: Object.fromEntries(DAILY_GUARD_SECTION_ORDER.map((section) => [section, `Synthetic ${section}`])),
  };
}

test("P13.6801 source presentation facts are explicit and stable", () => {
  assert.doesNotThrow(() => assertDailyGuardPresentationContract(DAILY_GUARD_PRESENTATION_CONTRACT));
  assert.equal(DAILY_GUARD_PRESENTATION_CONTRACT.title, "LAPORAN HARIAN REGU JAGA");
  assert.equal(DAILY_GUARD_PRESENTATION_CONTRACT.locationLine, "RUMAH DETENSI IMIGRASI PONTIANAK");
  assert.equal(DAILY_GUARD_PRESENTATION_CONTRACT.dutyLabel, "PIKET PAGI REGU BRAVO");
  assert.equal(DAILY_GUARD_PRESENTATION_CONTRACT.dutyTimeLine, "Pukul 07.00 s.d. 14.00 WIB");
  assert.equal(DAILY_GUARD_PRESENTATION_CONTRACT.commandSignatureLabel, "Komandan Jaga Bravo");
  assert.deepEqual(DAILY_GUARD_PRESENTATION_CONTRACT.evidencedSectionHeadings, {
    IDENTITAS_LAPORAN: "LAPORAN HARIAN REGU JAGA",
    KONDISI_DETENI: "PENGECEKAN & KONTROL BLOK DETENI",
    SERAH_TERIMA: "SERAH TERIMA REGU JAGA",
  });
});

test("P13.6840 business snapshot stays separate from presentation mapping", () => {
  const mapped = mapSnapshotToDailyGuardPresentation(snapshot());
  assert.equal(mapped.KONDISI_DETENI, "Synthetic KONDISI_DETENI");
  assert.equal(snapshot().sections.KONDISI_DETENI, "Synthetic KONDISI_DETENI");
});

test("P13.6880 synthetic PDF and DOCX adapters preserve the same deterministic render", () => {
  const current = snapshot();
  const pdf = renderSyntheticDocumentAdapter("PDF", current);
  const docx = renderSyntheticDocumentAdapter("DOCX", current);
  assert.equal(pdf.syntheticOnly, true);
  assert.equal(docx.syntheticOnly, true);
  assert.equal(pdf.snapshotId, current.snapshotId);
  assert.equal(docx.snapshotId, current.snapshotId);
  assert.notEqual(pdf.mimeType, docx.mimeType);
  assert.equal(pdf.content, docx.content);
  assert.match(pdf.content, /LAPORAN HARIAN REGU JAGA/);
  assert.match(pdf.content, /PENGECEKAN & KONTROL BLOK DETENI/);
  assert.match(pdf.content, /SERAH TERIMA REGU JAGA/);
});
