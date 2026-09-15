export type ReportElementVerification = Readonly<{
  elementKey: string;
  order: number;
  sourceField: string;
  expectedValue: string;
  renderedValue: string;
  geometryFingerprint: string;
}>;

export type ReportRenderingVerification = Readonly<{
  verificationId: string;
  templateId: string;
  format: "PDF" | "DOCX";
  elements: readonly ReportElementVerification[];
  templateApproved: boolean;
  sourceBindingsReconciled: boolean;
  deterministicArtifact: boolean;
}>;

export function assertReportRenderingVerified(input: ReportRenderingVerification): void {
  if (!input.verificationId.trim() || !input.templateId.trim() || input.elements.length === 0) throw new Error("REPORT_RENDERING_VERIFICATION_REQUIRED");
  if (!input.templateApproved || !input.sourceBindingsReconciled || !input.deterministicArtifact) throw new Error("REPORT_RENDERING_VERIFICATION_PREREQUISITES_INCOMPLETE");
  const keys = new Set<string>();
  const orders = new Set<number>();
  for (const element of input.elements) {
    if (!element.elementKey.trim() || !element.sourceField.trim() || !element.geometryFingerprint.trim()) throw new Error("REPORT_RENDERING_ELEMENT_IDENTITY_REQUIRED");
    if (keys.has(element.elementKey)) throw new Error(`REPORT_RENDERING_ELEMENT_DUPLICATE:${element.elementKey}`);
    if (orders.has(element.order)) throw new Error(`REPORT_RENDERING_ORDER_COLLISION:${element.order}`);
    keys.add(element.elementKey); orders.add(element.order);
    if (element.expectedValue !== element.renderedValue) throw new Error(`REPORT_RENDERING_VALUE_MISMATCH:${element.elementKey}`);
  }
}
