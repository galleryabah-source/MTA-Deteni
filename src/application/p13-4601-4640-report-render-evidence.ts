export type ReportRenderObservation = Readonly<{
  templateId: string;
  artifactId: string;
  sourceSnapshotId: string;
  elementOrderFingerprint: string;
  geometryFingerprint: string;
  sourceBindingFingerprint: string;
  visuallyReviewed: boolean;
}>;

export function assertReportRenderEvidence(input: ReportRenderObservation): void {
  if (!input.templateId.trim() || !input.artifactId.trim() || !input.sourceSnapshotId.trim()) throw new Error("REPORT_RENDER_IDENTITY_REQUIRED");
  if (!input.elementOrderFingerprint.trim() || !input.geometryFingerprint.trim() || !input.sourceBindingFingerprint.trim()) throw new Error("REPORT_RENDER_FINGERPRINT_REQUIRED");
  if (!input.visuallyReviewed) throw new Error("REPORT_RENDER_VISUAL_REVIEW_REQUIRED");
}
