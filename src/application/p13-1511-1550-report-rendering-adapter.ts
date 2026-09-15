import type { ReguJagaReport } from "./reporting-contract.js";

export type ReportRenderFormat = "TEXT" | "HTML" | "PDF";

export type ReportRenderRequest = Readonly<{
  report: ReguJagaReport;
  format: ReportRenderFormat;
  templateVersion: string;
}>;

export type ReportRenderArtifact = Readonly<{
  reportId: string;
  format: ReportRenderFormat;
  templateVersion: string;
  content: string;
}>;

export function renderReportContract(request: ReportRenderRequest): ReportRenderArtifact {
  if (!request.report.reportId.trim()) throw new Error("REPORT_RENDER_REPORT_REQUIRED");
  if (!request.templateVersion.trim()) throw new Error("REPORT_RENDER_TEMPLATE_REQUIRED");
  const content = request.format === "TEXT"
    ? request.report.sections.map((section) => `${section.title}\n${section.rows.map((row) => `${row.label}: ${row.value}`).join("\n")}`).join("\n\n")
    : JSON.stringify({ reportId: request.report.reportId, templateVersion: request.templateVersion, sections: request.report.sections });
  return { reportId: request.report.reportId, format: request.format, templateVersion: request.templateVersion, content };
}
