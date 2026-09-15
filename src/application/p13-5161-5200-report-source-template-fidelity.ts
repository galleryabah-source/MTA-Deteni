export type ReportFidelityCheck = Readonly<{
  checkId: string;
  templateElement: string;
  sourceField: string;
  expectedValue: string;
  actualValue: string;
  exactMatch: boolean;
  evidenceId: string;
}>;

export type ReportSourceTemplateFidelity = Readonly<{
  templateId: string;
  sourceSnapshotId: string;
  checks: readonly ReportFidelityCheck[];
  visualReviewObserved: boolean;
  deterministicArtifact: boolean;
}>;

export function assertReportSourceTemplateFidelity(input: ReportSourceTemplateFidelity): void {
  if (!input.templateId.trim() || !input.sourceSnapshotId.trim() || input.checks.length === 0) {
    throw new Error("REPORT_FIDELITY_IDENTITY_REQUIRED");
  }
  if (!input.deterministicArtifact) throw new Error("REPORT_FIDELITY_DETERMINISM_REQUIRED");
  if (!input.visualReviewObserved) throw new Error("REPORT_FIDELITY_VISUAL_REVIEW_REQUIRED");
  for (const check of input.checks) {
    if (!check.checkId.trim() || !check.templateElement.trim() || !check.sourceField.trim() || !check.evidenceId.trim()) {
      throw new Error("REPORT_FIDELITY_CHECK_IDENTITY_REQUIRED");
    }
    if (!check.exactMatch || check.expectedValue !== check.actualValue) {
      throw new Error(`REPORT_FIDELITY_MISMATCH:${check.checkId}`);
    }
  }
}
