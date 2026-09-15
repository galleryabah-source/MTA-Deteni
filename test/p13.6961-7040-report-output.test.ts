import test from "node:test";
import assert from "node:assert/strict";
import { DAILY_GUARD_SECTION_ORDER } from "../src/application/daily-guard-report-contract.js";
import { renderDailyGuardReport } from "../src/application/daily-guard-report-renderer.js";
import { SYNTHETIC_DOCX_RENDERER, SYNTHETIC_PDF_RENDERER } from "../src/application/daily-guard-report-render-adapters.js";
import { certifyReportRender } from "../src/application/report-render-certification.js";
import { createReportOutputEnvelope, assertReportOutputEnvelope } from "../src/application/report-output-envelope.js";
import type { ReportSnapshot } from "../src/application/report-artifact.js";

function snapshot(): ReportSnapshot {
  return {
    snapshotId: "snapshot-output-6961",
    sourceVersion: "synthetic-6961",
    documentNumber: "MTA-DETENI/2026/003",
    approvalBinding: "approval-6961",
    provenance: ["synthetic-fixture"],
    sections: Object.fromEntries(DAILY_GUARD_SECTION_ORDER.map((section) => [section, `Synthetic ${section}`])),
  };
}

test("P13.6961-7000 certified PDF output envelope is deterministic", () => {
  const rendered = renderDailyGuardReport({ snapshot: snapshot(), sectionOrder: DAILY_GUARD_SECTION_ORDER, renderer: SYNTHETIC_PDF_RENDERER });
  const certified = certifyReportRender({ format: rendered.rendererFormat, render: rendered.render });
  const envelope = createReportOutputEnvelope({ certified });
  assert.equal(envelope.format, "PDF");
  assert.equal(envelope.mimeType, "application/pdf");
  assert.equal(envelope.filename, "MTA-DETENI_2026_003.pdf");
  assertReportOutputEnvelope(envelope, certified);
});

test("P13.7001-7040 DOCX output uses the same certified identity boundary", () => {
  const rendered = renderDailyGuardReport({ snapshot: snapshot(), sectionOrder: DAILY_GUARD_SECTION_ORDER, renderer: SYNTHETIC_DOCX_RENDERER });
  const certified = certifyReportRender({ format: rendered.rendererFormat, render: rendered.render });
  const envelope = createReportOutputEnvelope({ certified });
  assert.equal(envelope.format, "DOCX");
  assert.equal(envelope.mimeType, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  assert.equal(envelope.filename, "MTA-DETENI_2026_003.docx");
  assertReportOutputEnvelope(envelope, certified);
});

test("P13.7040 rejects output MIME tampering", () => {
  const rendered = renderDailyGuardReport({ snapshot: snapshot(), sectionOrder: DAILY_GUARD_SECTION_ORDER, renderer: SYNTHETIC_PDF_RENDERER });
  const certified = certifyReportRender({ format: rendered.rendererFormat, render: rendered.render });
  const envelope = createReportOutputEnvelope({ certified });
  const tampered = { ...envelope, mimeType: "text/plain" as const };
  assert.throws(() => assertReportOutputEnvelope(tampered, certified), /MIME mismatch/i);
});
