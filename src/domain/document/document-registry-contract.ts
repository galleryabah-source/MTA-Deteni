/**
 * P10.6 Document Registry Domain Contract
 *
 * Numbering is INFERRED: the authoritative source explicitly lists P10.1-P10.4
 * and then "..."; it does not explicitly name P10.6. The source does explicitly
 * require document registry in D3 and document.view/generate/issue in authorization.
 *
 * Contract only. No persistence, migration, production mutation, or real-data fixture.
 */
export const DOCUMENT_REGISTRY_CONTRACT_VERSION = "P10.6-INFERRED-v1";

export type DocumentStatus = "DRAFT" | "GENERATED" | "ISSUED" | "VOID";

export type DocumentRecord = {
  documentId: string;
  documentType: string;
  subjectId: string;
  templateVersion: string;
  status: DocumentStatus;
  contentHash: string;
  generatedAt: string;
  verified: boolean;
};

export type DocumentCommand =
  | { type: "REGISTER"; record: DocumentRecord }
  | { type: "ISSUE"; documentId: string }
  | { type: "VOID"; documentId: string; reason: string };

const ID = /^[A-Za-z0-9._-]{1,128}$/;
const HASH = /^[a-f0-9]{64}$/i;

export function validateDocument(record: DocumentRecord): string[] {
  const errors: string[] = [];
  if (!ID.test(record.documentId)) errors.push("INVALID_DOCUMENT_ID");
  if (!ID.test(record.documentType)) errors.push("INVALID_DOCUMENT_TYPE");
  if (!ID.test(record.subjectId)) errors.push("INVALID_SUBJECT_ID");
  if (!ID.test(record.templateVersion)) errors.push("INVALID_TEMPLATE_VERSION");
  if (!["DRAFT","GENERATED","ISSUED","VOID"].includes(record.status)) errors.push("INVALID_STATUS");
  if (!HASH.test(record.contentHash)) errors.push("INVALID_CONTENT_HASH");
  if (Number.isNaN(Date.parse(record.generatedAt))) errors.push("INVALID_GENERATED_AT");
  if (typeof record.verified !== "boolean") errors.push("INVALID_VERIFICATION_STATE");
  return errors;
}

export function validateDocumentCommand(command: DocumentCommand): string[] {
  if (command.type === "REGISTER") return validateDocument(command.record);
  const errors: string[] = [];
  if (!ID.test(command.documentId)) errors.push("INVALID_DOCUMENT_ID");
  if (command.type === "VOID" && !command.reason.trim()) errors.push("MISSING_REASON");
  return errors;
}
