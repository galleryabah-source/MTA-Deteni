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
  if (renderer.format === "REFERENCE_TEXT") assertOperationalReportRender(render, snapshot);\n  else {\n    if (render.snapshotId !== snapshot.snapshotId || render.documentNumber !== snapshot.documentNumber) throw new Error("Operational report render binding mismatch.");\n    if (render.sectionOrder.length !== sectionOrder.length || render.sectionOrder.some((value, index) => value !== sectionOrder[index])) throw new Error("Operational report render section order mismatch.");\n    if (!render.content.trim()) throw new Error("Operational report render content is empty.");\n  }
  return render;
}

export function assertRendererFormat(format: ReportRenderFormat): void {
  if (format !== "REFERENCE_TEXT" && format !== "PDF" && format !== "DOCX") throw new Error("Unsupported report renderer format.");
}
