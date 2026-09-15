export type ReportTemplateExecution = Readonly<{
  templateId: string;
  format: "PDF" | "DOCX";
  sourceSnapshotId: string;
  exactLayoutRequired: boolean;
  sourceBindingsReconciled: boolean;
  deterministicArtifact: boolean;
  approvedTemplateAvailable: boolean;
}>;

export function assertReportTemplateExecutionReady(input: ReportTemplateExecution): void {
  if (!input.templateId.trim() || !input.sourceSnapshotId.trim()) throw new Error("REPORT_TEMPLATE_EXECUTION_IDENTITY_REQUIRED");
  if (!input.approvedTemplateAvailable) throw new Error("REPORT_APPROVED_TEMPLATE_REQUIRED");
  if (!input.sourceBindingsReconciled || !input.deterministicArtifact) throw new Error("REPORT_TEMPLATE_EXECUTION_CONTROLS_INCOMPLETE");
}
