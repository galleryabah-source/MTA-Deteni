import type { ReguJagaReport } from "./reporting-contract.js";

export type ReportTemplateBlock = Readonly<{
  code: string;
  title: string;
  required: boolean;
  order: number;
}>;

export type ReportTemplateContract = Readonly<{
  templateId: string;
  version: string;
  format: "TEXT" | "PDF";
  blocks: readonly ReportTemplateBlock[];
}>;

export function assertReportMatchesTemplate(report: ReguJagaReport, template: ReportTemplateContract): void {
  if (!template.templateId.trim() || !template.version.trim()) throw new Error("REPORT_TEMPLATE_IDENTITY_REQUIRED");
  const present = new Set(report.sections.map((section) => section.code));
  for (const block of template.blocks) {
    if (block.required && !present.has(block.code)) throw new Error(`REPORT_TEMPLATE_SECTION_MISSING:${block.code}`);
  }
  const orders = template.blocks.map((block) => block.order);
  if (new Set(orders).size !== orders.length) throw new Error("REPORT_TEMPLATE_ORDER_DUPLICATE");
}
