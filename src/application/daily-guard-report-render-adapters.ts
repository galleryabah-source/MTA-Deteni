import { DAILY_GUARD_SECTION_ORDER } from "./daily-guard-report-contract.js";
import { renderDailyGuardReport } from "./daily-guard-report-renderer.js";
import type { OperationalReportRender, ReportSnapshot } from "./report-artifact.js";
import type { ReportRenderer } from "./report-renderer.js";
import { DAILY_GUARD_PRESENTATION_CONTRACT, mapSnapshotToDailyGuardPresentation } from "./daily-guard-report-template.js";

export type SyntheticDocumentAdapterOutput = Readonly<{
  format: "PDF" | "DOCX";
  snapshotId: string;
  documentNumber: string;
  mimeType: "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  content: string;
  syntheticOnly: true;
}>;

function renderSourceGroundedText(snapshot: ReportSnapshot, sectionOrder: readonly string[]): OperationalReportRender {
  const mapped = mapSnapshotToDailyGuardPresentation(snapshot);
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    documentNumber: snapshot.documentNumber,
    sectionOrder: Object.freeze([...sectionOrder]),
    content: [
      DAILY_GUARD_PRESENTATION_CONTRACT.title,
      ...DAILY_GUARD_PRESENTATION_CONTRACT.organizationLines,
      DAILY_GUARD_PRESENTATION_CONTRACT.locationLine,
      DAILY_GUARD_PRESENTATION_CONTRACT.dutyLabel,
      DAILY_GUARD_PRESENTATION_CONTRACT.dateLine,
      DAILY_GUARD_PRESENTATION_CONTRACT.dutyTimeLine,
      ...sectionOrder.map((section) => `${DAILY_GUARD_PRESENTATION_CONTRACT.evidencedSectionHeadings[section as keyof typeof DAILY_GUARD_PRESENTATION_CONTRACT.evidencedSectionHeadings] ?? section}
${mapped[section as keyof typeof mapped]}`),
      DAILY_GUARD_PRESENTATION_CONTRACT.closingLocationDateLine,
      DAILY_GUARD_PRESENTATION_CONTRACT.commandSignatureLabel,
      DAILY_GUARD_PRESENTATION_CONTRACT.acknowledgmentLabel,
      DAILY_GUARD_PRESENTATION_CONTRACT.acknowledgmentRole,
    ].join("\n\n"),
  });
}

export const SYNTHETIC_PDF_RENDERER: ReportRenderer = Object.freeze({
  format: "PDF",
  render: (snapshot, sectionOrder) => renderSourceGroundedText(snapshot, sectionOrder),
});

export const SYNTHETIC_DOCX_RENDERER: ReportRenderer = Object.freeze({
  format: "DOCX",
  render: (snapshot, sectionOrder) => renderSourceGroundedText(snapshot, sectionOrder),
});

export function renderSyntheticDocumentAdapter(format: "PDF" | "DOCX", snapshot: ReportSnapshot): SyntheticDocumentAdapterOutput {
  const sectionOrder = DAILY_GUARD_SECTION_ORDER;
  const renderer = format === "PDF" ? SYNTHETIC_PDF_RENDERER : SYNTHETIC_DOCX_RENDERER;
  const result = renderDailyGuardReport({ snapshot, sectionOrder, renderer });
  return Object.freeze({
    format,
    snapshotId: result.render.snapshotId,
    documentNumber: result.render.documentNumber,
    mimeType: format === "PDF" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    content: result.render.content,
    syntheticOnly: true,
  });
}
