import type { ReguJagaReport } from "./reporting-contract.js";
import { validateReguJagaReport } from "./reporting-contract.js";

export type ReportPreview = Readonly<{
  reportId: string;
  sourceSnapshotId: string;
  ready: boolean;
  validationErrors: readonly string[];
  sections: readonly { code: string; title: string; rowCount: number }[];
}>;

export function buildReportPreview(report: ReguJagaReport): ReportPreview {
  const validationErrors = validateReguJagaReport(report);
  return {
    reportId: report.reportId,
    sourceSnapshotId: report.sourceSnapshotId,
    ready: validationErrors.length === 0,
    validationErrors,
    sections: report.sections.map((section) => ({ code: section.code, title: section.title, rowCount: section.rows.length })),
  };
}

export function assertReportPreviewReady(preview: ReportPreview): void {
  if (!preview.ready) throw new Error("REPORT_PREVIEW_NOT_READY");
}
