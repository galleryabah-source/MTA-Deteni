import test from "node:test";
import assert from "node:assert/strict";
import { DAILY_GUARD_SECTION_ORDER } from "../src/application/daily-guard-report-contract.js";
import { renderDailyGuardReport } from "../src/application/daily-guard-report-renderer.js";
import { REFERENCE_TEXT_RENDERER } from "../src/application/report-renderer.js";
import { certifyReportRender, assertCertifiedReportRender, DAILY_GUARD_TEMPLATE_VERSION } from "../src/application/report-render-certification.js";
import type { ReportSnapshot } from "../src/application/report-artifact.js";

function snapshot(): ReportSnapshot {
  return {
    snapshotId: "snapshot-6881",
    sourceVersion: "synthetic-6881",
    documentNumber: "MTA-DETENI/2026/002",
    approvalBinding: "approval-6881",
    provenance: ["synthetic-fixture"],
    sections: Object.fromEntries(DAILY_GUARD_SECTION_ORDER.map((section) => [section, `Synthetic ${section}`])),
  };
}

function render(current: ReportSnapshot = snapshot()) {
  return renderDailyGuardReport({ snapshot: current, sectionOrder: DAILY_GUARD_SECTION_ORDER, renderer: REFERENCE_TEXT_RENDERER });
}

test("P13.6881 certification is deterministic", () => {
  const first = render();
  const second = render();
  const a = certifyReportRender({ format: first.rendererFormat, render: first.render });
  const b = certifyReportRender({ format: second.rendererFormat, render: second.render });
  assert.equal(a.templateVersion, DAILY_GUARD_TEMPLATE_VERSION);
  assert.equal(a.outputId, b.outputId);
  assert.equal(a.contentFingerprint, b.contentFingerprint);
  assertCertifiedReportRender(a, { format: first.rendererFormat, render: first.render });
});

test("P13.6920 rejects cross-format certification binding", () => {
  const current = render();
  const certified = certifyReportRender({ format: "PDF", render: current.render });
  assert.throws(() => assertCertifiedReportRender(certified, { format: "DOCX", render: current.render }), /format mismatch/i);
});

test("P13.6940 rejects snapshot drift", () => {
  const current = render();
  const certified = certifyReportRender({ format: current.rendererFormat, render: current.render });
  const drifted = render({ ...snapshot(), snapshotId: "snapshot-drift" });
  assert.throws(() => assertCertifiedReportRender(certified, { format: current.rendererFormat, render: drifted.render }), /identity mismatch/i);
});

test("P13.6960 rejects content tampering", () => {
  const current = render();
  const certified = certifyReportRender({ format: current.rendererFormat, render: current.render });
  const tampered = { ...current.render, content: `${current.render.content}\nTAMPERED` };
  assert.throws(() => assertCertifiedReportRender(certified, { format: current.rendererFormat, render: tampered }), /content mismatch/i);
});
