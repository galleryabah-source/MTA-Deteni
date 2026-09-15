import type { ReportArtifact } from "./p12-1201-1240-report-artifact-contract.js";

export type ReportPreview = Readonly<{
  artifactId: string;
  format: ReportArtifact["format"];
  contentHash: string;
  previewOnly: true;
}>;

export type ReportDownloadDecision = Readonly<{
  allowed: boolean;
  reason: "APPROVED_ARTIFACT" | "APPROVAL_REQUIRED" | "IDENTITY_INCOMPLETE";
}>;

export function buildReportPreview(artifact: ReportArtifact): ReportPreview {
  if (!artifact.artifactId.trim() || !artifact.contentHash.trim()) throw new Error("REPORT_PREVIEW_IDENTITY_REQUIRED");
  return { artifactId: artifact.artifactId, format: artifact.format, contentHash: artifact.contentHash, previewOnly: true };
}

export function evaluateReportDownload(artifact: ReportArtifact): ReportDownloadDecision {
  if (!artifact.artifactId.trim() || !artifact.contentHash.trim()) return { allowed: false, reason: "IDENTITY_INCOMPLETE" };
  if (!artifact.snapshot.approvalBinding) return { allowed: false, reason: "APPROVAL_REQUIRED" };
  return { allowed: true, reason: "APPROVED_ARTIFACT" };
}
