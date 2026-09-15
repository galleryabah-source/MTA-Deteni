import { validateReguJagaReport, type ReguJagaReport } from "./reporting-contract.js";

export type ReportConsistencyInput = Readonly<{
  report: ReguJagaReport;
  snapshotId: string;
  readModelGeneratedAt: string;
  expectedActiveCount: number;
  reportedActiveCount: number;
}>;

export function evaluateReportConsistency(input: ReportConsistencyInput): "READY" | "BLOCKED" {
  if (!input.snapshotId.trim() || !input.readModelGeneratedAt.trim()) return "BLOCKED";
  if (!Number.isInteger(input.expectedActiveCount) || input.expectedActiveCount < 0) return "BLOCKED";
  if (!Number.isInteger(input.reportedActiveCount) || input.reportedActiveCount < 0) return "BLOCKED";
  if (input.expectedActiveCount !== input.reportedActiveCount) return "BLOCKED";
  if (input.report.sourceSnapshotId !== input.snapshotId) return "BLOCKED";
  if (validateReguJagaReport(input.report).length > 0) return "BLOCKED";
  return "READY";
}
