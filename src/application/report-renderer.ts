import { assertOperationalReportRender, renderOperationalReport, type OperationalReportRender, type ReportSnapshot } from "./report-artifact.js";

export type ReportRenderFormat = "REFERENCE_TEXT" | "PDF" | "DOCX";

export type ReportRenderer = Readonly<{
  format: ReportRenderFormat;
  render: (snapshot: ReportSnapshot, sectionOrder: readonly string[]) => OperationalReportRender;
}>;

export const REFERENCE_TEXT_RENDERER: ReportRenderer = Object.freeze({
  format: "REFERENCE_TEXT",
  render: (snapshot, sectionOrder) => renderOperationalReport({ snapshot, sectionOrder }),
});

export function renderWithRenderer(renderer: ReportRenderer, snapshot: ReportSnapshot, sectionOrder: readonly string[]): OperationalReportRender {
  const render = renderer.render(snapshot, sectionOrder);
  assertOperationalReportRender(render, snapshot);
  return render;
}

export function assertRendererFormat(format: ReportRenderFormat): void {
  if (format !== "REFERENCE_TEXT" && format !== "PDF" && format !== "DOCX") throw new Error("Unsupported report renderer format.");
}
