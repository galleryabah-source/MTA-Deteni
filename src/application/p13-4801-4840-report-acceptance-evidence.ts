export type ReportAcceptanceEvidence = Readonly<{
  templateId: string;
  artifactId: string;
  sourceSnapshotId: string;
  sourceBindingsReconciled: boolean;
  deterministicArtifact: boolean;
  elementOrderFingerprint: string;
  geometryFingerprint: string;
  sourceBindingFingerprint: string;
  visuallyReviewed: boolean;
  approvedTemplateAvailable: boolean;
  observed: boolean;
}>;

export function assertReportAcceptanceEvidence(input: ReportAcceptanceEvidence): void {
  if (!input.templateId.trim() || !input.artifactId.trim() || !input.sourceSnapshotId.trim()) throw new Error("REPORT_ACCEPTANCE_IDENTITY_REQUIRED");
  if (!input.approvedTemplateAvailable) throw new Error("REPORT_ACCEPTED_TEMPLATE_REQUIRED");
  if (!input.sourceBindingsReconciled || !input.deterministicArtifact) throw new Error("REPORT_ACCEPTANCE_CONTROLS_INCOMPLETE");
  if (!input.elementOrderFingerprint.trim() || !input.geometryFingerprint.trim() || !input.sourceBindingFingerprint.trim()) throw new Error("REPORT_ACCEPTANCE_FINGERPRINT_REQUIRED");
  if (!input.visuallyReviewed) throw new Error("REPORT_ACCEPTANCE_VISUAL_REVIEW_REQUIRED");
  if (!input.observed) throw new Error("REPORT_ACCEPTANCE_NOT_OBSERVED");
}
