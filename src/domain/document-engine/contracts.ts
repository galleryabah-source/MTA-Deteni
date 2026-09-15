import type { ActorContext } from "../shared/contracts.js";
import { DomainError } from "../shared/errors.js";

export type TemplateDefinition = Readonly<{
  id: string;
  version: string;
  effectiveFrom: string;
  effectiveTo?: string;
  requiredFields: readonly string[];
  sha256: string;
}>;

export type NumberingPort = {
  reserve(documentType: string, dateKey: string): Promise<string>;
};

export type ApprovalBindingPort = {
  isApproved(subjectType: string, subjectId: string): Promise<boolean>;
};

export type TemplatePort = {
  getEffective(templateId: string, at: string): Promise<TemplateDefinition | null>;
};

export function assertTemplateFields(template: TemplateDefinition, fields: Readonly<Record<string, unknown>>): void {
  const missing = template.requiredFields.filter((field) => fields[field] === undefined || fields[field] === null || String(fields[field]).trim() === "");
  if (missing.length > 0) throw new DomainError("VALIDATION_FAILED", `Missing document fields: ${missing.join(", ")}.`);
}

export async function bindApprovedNumbering(input: {
  actor: ActorContext;
  documentType: string;
  subjectType: string;
  subjectId: string;
  templateId: string;
  at: string;
  fields: Readonly<Record<string, unknown>>;
  templates: TemplatePort;
  approvals: ApprovalBindingPort;
  numbering: NumberingPort;
  canIssue: (actor: ActorContext) => boolean;
}): Promise<{ template: TemplateDefinition; numberingRef: string }> {
  if (!input.canIssue(input.actor)) throw new DomainError("FORBIDDEN_SCOPE", "Actor is not authorized to issue this document.");
  const template = await input.templates.getEffective(input.templateId, input.at);
  if (!template) throw new DomainError("VALIDATION_FAILED", "No effective template is available.");
  assertTemplateFields(template, input.fields);
  if (!(await input.approvals.isApproved(input.subjectType, input.subjectId))) {
    throw new DomainError("INVALID_STATE", "Document issuance requires an approved subject.");
  }
  const numberingRef = await input.numbering.reserve(input.documentType, input.at.slice(0, 10));
  return { template, numberingRef };
}
