import type { DocumentContract, TemplateVersion } from "./types";

export interface DocumentValidationResult {
  readonly valid: boolean;
  readonly missingFields: readonly string[];
  readonly unknownFields: readonly string[];
  readonly missingPlaceholders: readonly string[];
}

export const validateDocumentInput = (
  contract: DocumentContract,
  template: TemplateVersion,
  data: Readonly<Record<string, unknown>>,
): DocumentValidationResult => {
  const required = contract.fields.filter((field) => field.required).map((field) => field.name);
  const supplied = new Set(Object.keys(data));
  const missingFields = required.filter((field) => data[field] === undefined || data[field] === null || data[field] === "");
  const allowed = new Set(contract.fields.map((field) => field.name));
  const unknownFields = [...supplied].filter((field) => !allowed.has(field));
  const missingPlaceholders = template.placeholders.filter((field) => !supplied.has(field));

  return {
    valid: missingFields.length === 0 && unknownFields.length === 0 && missingPlaceholders.length === 0,
    missingFields,
    unknownFields,
    missingPlaceholders,
  };
};
