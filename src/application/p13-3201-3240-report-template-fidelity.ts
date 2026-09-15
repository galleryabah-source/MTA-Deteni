export type ReportTemplateElement = Readonly<{
  key: string;
  required: boolean;
  order: number;
  sourceField: string;
}>;

export type ReportTemplateFidelity = Readonly<{
  templateId: string;
  format: "PDF" | "DOCX";
  elements: readonly ReportTemplateElement[];
  exactLayoutRequired: boolean;
}>;

export function assertReportTemplateFidelity(template: ReportTemplateFidelity): void {
  if (!template.templateId.trim() || template.elements.length === 0) throw new Error("REPORT_TEMPLATE_CONTRACT_REQUIRED");
  const orders = new Set<number>();
  for (const element of template.elements) {
    if (!element.key.trim() || !element.sourceField.trim() || element.order < 1) throw new Error("REPORT_TEMPLATE_ELEMENT_INVALID");
    if (orders.has(element.order)) throw new Error("REPORT_TEMPLATE_ORDER_COLLISION");
    orders.add(element.order);
  }
  if (template.exactLayoutRequired && template.format !== "PDF" && template.format !== "DOCX") throw new Error("REPORT_TEMPLATE_FORMAT_UNSUPPORTED");
}
