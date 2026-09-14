import type { DocumentArtifact } from "./artifact";
import type { DocumentBinding } from "./binding";
import type { DocumentAuditEvent } from "./audit-hook";
import type { DocumentIdempotencyRecord } from "./idempotency";
import type { DocumentOutboxEvent } from "./outbox";
import type { DocumentLifecycle } from "./types";

export type DocumentInvariantCode =
  | "MISSING_ARTIFACT"
  | "ARTIFACT_HASH_MISMATCH"
  | "BINDING_CONTRACT_MISMATCH"
  | "BINDING_TEMPLATE_MISMATCH"
  | "BINDING_LIFECYCLE_INVALID"
  | "AUDIT_DOCUMENT_MISMATCH"
  | "AUDIT_LIFECYCLE_MISMATCH"
  | "DUPLICATE_DOCUMENT_BINDING"
  | "DUPLICATE_ARTIFACT_BINDING"
  | "DUPLICATE_IDEMPOTENCY_KEY"
  | "OUTBOX_AGGREGATE_MISMATCH";

export interface DocumentInvariantFinding {
  readonly code: DocumentInvariantCode;
  readonly severity: "CRITICAL" | "WARNING";
  readonly resourceId: string;
  readonly detail: string;
}

export interface DocumentInvariantInput {
  readonly documentId: string;
  readonly lifecycle: DocumentLifecycle;
  readonly contractId: string;
  readonly contractVersion: string;
  readonly templateId: string;
  readonly templateVersion: string;
  readonly artifact?: DocumentArtifact;
  readonly binding?: DocumentBinding;
  readonly auditEvents?: readonly DocumentAuditEvent[];
  readonly idempotencyRecords?: readonly DocumentIdempotencyRecord[];
  readonly outboxEvents?: readonly DocumentOutboxEvent[];
}

export interface DocumentInvariantReport {
  readonly checkedAt: string;
  readonly valid: boolean;
  readonly findings: readonly DocumentInvariantFinding[];
}

export const verifyDocumentInvariants = (input: DocumentInvariantInput, checkedAt: string): DocumentInvariantReport => {
  if (!input.documentId.trim()) throw new Error("INVALID_DOCUMENT_ID");
  if (Number.isNaN(Date.parse(checkedAt))) throw new Error("INVALID_INVARIANT_CHECK_DATE");
  const findings: DocumentInvariantFinding[] = [];
  const push = (code: DocumentInvariantCode, resourceId: string, detail: string, severity: "CRITICAL" | "WARNING" = "CRITICAL") =>
    findings.push({ code, severity, resourceId, detail });

  if (!input.artifact) push("MISSING_ARTIFACT", input.documentId, "Document has no artifact.");
  if (input.artifact) {
    if (input.artifact.documentKind !== input.binding?.documentKind) push("BINDING_CONTRACT_MISMATCH", input.documentId, "Artifact and binding document kinds differ.");
    if (input.binding && input.artifact.contractId !== input.binding.contractId) push("BINDING_CONTRACT_MISMATCH", input.documentId, "Artifact and binding contract IDs differ.");
    if (input.binding && input.artifact.templateId !== input.binding.templateId) push("BINDING_TEMPLATE_MISMATCH", input.documentId, "Artifact and binding template IDs differ.");
  }

  if (!input.binding) {
    push("MISSING_ARTIFACT", input.documentId, "Document has no immutable binding.");
  } else {
    if (input.binding.documentId !== input.documentId) push("DUPLICATE_DOCUMENT_BINDING", input.documentId, "Binding references a different document.");
    if (input.binding.contractId !== input.contractId || input.binding.contractVersion !== input.contractVersion) push("BINDING_CONTRACT_MISMATCH", input.documentId, "Binding contract does not match document contract.");
    if (input.binding.templateId !== input.templateId || input.binding.templateVersion !== input.templateVersion) push("BINDING_TEMPLATE_MISMATCH", input.documentId, "Binding template does not match document template.");
    if (input.binding.lifecycle !== input.lifecycle) push("BINDING_LIFECYCLE_INVALID", input.documentId, "Binding lifecycle differs from document lifecycle.");
    if (input.artifact && input.binding.artifactContentHash !== input.artifact.contentHash) push("ARTIFACT_HASH_MISMATCH", input.documentId, "Binding artifact hash differs from artifact hash.");
  }

  for (const event of input.auditEvents ?? []) {
    if (event.documentId !== input.documentId) push("AUDIT_DOCUMENT_MISMATCH", event.eventId, "Audit event references another document.");
    if (event.fromLifecycle && event.toLifecycle && event.documentId === input.documentId && event.toLifecycle === "ARCHIVED" && input.lifecycle !== "ARCHIVED") push("AUDIT_LIFECYCLE_MISMATCH", event.eventId, "Archive audit exists while document is not archived.");
  }

  const keys = new Set<string>();
  for (const record of input.idempotencyRecords ?? []) {
    if (keys.has(record.key)) push("DUPLICATE_IDEMPOTENCY_KEY", record.key, "Multiple idempotency records use the same key.");
    keys.add(record.key);
  }

  for (const event of input.outboxEvents ?? []) {
    if (event.aggregateId !== input.documentId) push("OUTBOX_AGGREGATE_MISMATCH", event.eventId, "Outbox event references another aggregate.", "WARNING");
  }

  return Object.freeze({ checkedAt, valid: findings.length === 0, findings: Object.freeze(findings) });
};
