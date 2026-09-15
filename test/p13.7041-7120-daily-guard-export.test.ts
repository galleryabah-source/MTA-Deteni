import test from "node:test";
import assert from "node:assert/strict";
import { DAILY_GUARD_SECTION_ORDER } from "../src/application/daily-guard-report-contract.js";
import { SYNTHETIC_PDF_RENDERER } from "../src/application/daily-guard-report-render-adapters.js";
import { certifyDailyGuardExport } from "../src/application/daily-guard-export-certification.js";
import type { ReportSnapshot } from "../src/application/report-artifact.js";

function snapshot(): ReportSnapshot {
  return {
    snapshotId: "snapshot-export-7041",
    sourceVersion: "synthetic-7041",
    documentNumber: "MTA-DETENI/2026/004",
    approvalBinding: "approval-7041",
    provenance: ["synthetic-fixture"],
    sections: Object.fromEntries(DAILY_GUARD_SECTION_ORDER.map((section) => [section, `Synthetic ${section}`])),
  };
}

test("P13.7041-7080 certifies complete daily guard export end-to-end", () => {
  const first = certifyDailyGuardExport({ snapshot: snapshot(), renderer: SYNTHETIC_PDF_RENDERER });
  const second = certifyDailyGuardExport({ snapshot: snapshot(), renderer: SYNTHETIC_PDF_RENDERER });
  assert.equal(first.output.outputId, second.output.outputId);
  assert.equal(first.output.contentFingerprint, second.output.contentFingerprint);
  assert.equal(first.output.filename, "MTA-DETENI_2026_004.pdf");
  assert.equal(first.syntheticOnly, true);
});

test("P13.7081-7120 refuses incomplete daily guard snapshot", () => {
  const current = snapshot();
  const incomplete = { ...current, sections: { ...current.sections, KEJADIAN_PENTING: "" } };
  assert.throws(() => certifyDailyGuardExport({ snapshot: incomplete, renderer: SYNTHETIC_PDF_RENDERER }), /mandatory report section|empty daily guard section/i);
});
