import type { ReguJagaReport } from "./reporting-contract.js";
import { validateReguJagaReport } from "./reporting-contract.js";

export type ReportingWorkspace = Readonly<{
  report: ReguJagaReport;
  validationErrors: readonly string[];
  previewAllowed: boolean;
  generatedAt: string;
}>;

export function composeReportingWorkspace(report: ReguJagaReport): ReportingWorkspace {
  const validationErrors = validateReguJagaReport(report);
  return {
    report,
    validationErrors,
    previewAllowed: validationErrors.length === 0,
    generatedAt: report.generatedAt,
  };
}

export function assertReportPreviewAllowed(workspace: ReportingWorkspace): void {
  if (!workspace.previewAllowed) throw new Error("REPORT_PREVIEW_BLOCKED_BY_CONTRACT");
}
