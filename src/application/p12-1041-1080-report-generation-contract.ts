import type { ReportingSnapshotIntegrity } from "./p12-921-960-reporting-snapshot-integrity.js";

export type ReportGenerationRequest = Readonly<{
  reportType: "DAILY_GUARD" | "OPERATIONAL_SUMMARY";
  date: string;
  regu: string;
  shift: string;
  snapshot: ReportingSnapshotIntegrity;
}>;

export type ReportGenerationResult = Readonly<{
  reportId: string;
  reportType: ReportGenerationRequest["reportType"];
  snapshotId: string;
  deterministic: true;
}>;

export function validateReportGenerationRequest(request: ReportGenerationRequest): void {
  if (!request.date.trim() || !request.regu.trim() || !request.shift.trim()) throw new Error("REPORT_GENERATION_CONTEXT_REQUIRED");
  if (!request.snapshot.snapshotId.trim() || request.snapshot.sourceOperationIds.length === 0) throw new Error("REPORT_GENERATION_SNAPSHOT_REQUIRED");
}

export function buildReportGenerationResult(request: ReportGenerationRequest, reportId: string): ReportGenerationResult {
  validateReportGenerationRequest(request);
  if (!reportId.trim()) throw new Error("REPORT_ID_REQUIRED");
  return { reportId, reportType: request.reportType, snapshotId: request.snapshot.snapshotId, deterministic: true };
}
