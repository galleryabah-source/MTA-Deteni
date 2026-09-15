import { test } from "node:test";
import assert from "node:assert/strict";
import { renderDailyGuardReport } from "../src/application/daily-guard-report-renderer.js";
import { REFERENCE_TEXT_RENDERER } from "../src/application/report-renderer.js";
import type { ReportSnapshot } from "../src/application/report-artifact.js";

const sections = {
  IDENTITAS_LAPORAN: "Synthetic Daily Guard",
  PERSONEL_REGU: "Bravo Pagi",
  KONDISI_DETENI: "Normal",
  KEGIATAN_JAGA: "Patroli",
  KEJADIAN_PENTING: "Nihil",
  SERAH_TERIMA: "Tercatat",
  PENGESAHAN: "Approved synthetic",
};
const snapshot: ReportSnapshot = Object.freeze({ snapshotId: "renderer-01", sourceVersion: "rev-01", documentNumber: "DOC-RENDER-01", approvalBinding: "approval-01", provenance: Object.freeze(["synthetic-test"]), sections: Object.freeze(sections) });

test("P13.6601 daily guard rendering is delegated to the selected renderer", () => {
  const result = renderDailyGuardReport({ snapshot, sectionOrder: Object.keys(sections), renderer: REFERENCE_TEXT_RENDERER });
  assert.equal(result.rendererFormat, "REFERENCE_TEXT");
  assert.equal(result.render.snapshotId, snapshot.snapshotId);
  assert.equal(result.syntheticOnly, true);
});

test("P13.6602 renderer output remains deterministic", () => {
  const input = { snapshot, sectionOrder: Object.keys(sections), renderer: REFERENCE_TEXT_RENDERER };
  const a = renderDailyGuardReport(input);
  const b = renderDailyGuardReport(input);
  assert.deepEqual(a, b);
});
