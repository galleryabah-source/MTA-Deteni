import { assertOperationalReportRender, renderOperationalReport, type OperationalReportRender, type ReportSnapshot } from "./report-artifact.js";

export type ReportPreview = Readonly<{
  previewId: string;
  snapshotId: string;
  documentNumber: string;
  content: string;
  sectionOrder: readonly string[];
  syntheticOnly: true;
}>;

export function createReportPreview(input: Readonly<{
  previewId: string;
  snapshot: ReportSnapshot;
  sectionOrder: readonly string[];
}>): ReportPreview {
  if (!input.previewId.trim()) throw new Error("Report preview identity is required.");
  const render = renderOperationalReport(input);
  assertOperationalReportRender(render, input.snapshot);
  return Object.freeze({
    previewId: input.previewId,
    snapshotId: render.snapshotId,
    documentNumber: render.documentNumber,
    content: render.content,
    sectionOrder: Object.freeze([...render.sectionOrder]),
    syntheticOnly: true,
  });
}

export function assertReportPreview(preview: ReportPreview, snapshot: ReportSnapshot): void {
  if (!preview.syntheticOnly) throw new Error("Report preview must be synthetic-only.");
  const render: OperationalReportRender = Object.freeze({
    snapshotId: preview.snapshotId,
    documentNumber: preview.documentNumber,
    sectionOrder: Object.freeze([...preview.sectionOrder]),
    content: preview.content,
  });
  assertOperationalReportRender(render, snapshot);
}
