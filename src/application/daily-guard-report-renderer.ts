import { renderWithRenderer, type ReportRenderer } from "./report-renderer.js";
import type { OperationalReportRender, ReportSnapshot } from "./report-artifact.js";

export type DailyGuardRenderRequest = Readonly<{
  snapshot: ReportSnapshot;
  sectionOrder: readonly string[];
  renderer: ReportRenderer;
}>;

export type DailyGuardRenderResult = Readonly<{
  rendererFormat: ReportRenderer["format"];
  render: OperationalReportRender;
  syntheticOnly: true;
}>;

export function renderDailyGuardReport(input: DailyGuardRenderRequest): DailyGuardRenderResult {
  const render = renderWithRenderer(input.renderer, input.snapshot, input.sectionOrder);
  return Object.freeze({ rendererFormat: input.renderer.format, render, syntheticOnly: true });
}
