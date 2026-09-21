import type { DocumentKind, DocumentLifecycle } from "./types";
import type { DocumentArtifact } from "./artifact";
import type { DocumentBinding } from "./binding";
import type { DocumentAuditEvent } from "./audit-hook";
import type { NumberingRegister, NumberingReservation } from "./numbering";

export interface PersistenceReadinessInput {
  readonly documentId: string;
  readonly kind: DocumentKind;
  readonly lifecycle: DocumentLifecycle;
  readonly contractId: string;
  readonly contractVersion: string;
  readonly templateId: string;
  readonly templateVersion: string;
  readonly artifact: DocumentArtifact;
  readonly binding: DocumentBinding;
  readonly auditEvents: readonly DocumentAuditEvent[];
  readonly numberingReservation?: NumberingReservation;
  readonly numberingRegister?: NumberingRegister;
}

export type PersistenceReadinessCode =
  | "MISSING_NUMBER_REGISTER"
  | "NUMBER_REGISTER_DOCUMENT_MISMATCH"
  | "NUMBER_RESERVATION_REGISTER_MISMATCH"
  | "AUDIT_TRAIL_EMPTY"
  | "ARTIFACT_KIND_MISMATCH"
  | "BINDING_KIND_MISMATCH";

export interface PersistenceReadinessFinding {
  readonly code: PersistenceReadinessCode;
  readonly severity: "BLOCKER" | "WARNING";
  readonly detail: string;
}

export interface PersistenceReadinessReport {
  readonly ready: boolean;
  readonly findings: readonly PersistenceReadinessFinding[];
};

export const evaluatePersistenceReadiness = (input: PersistenceReadinessInput): PersistenceReadinessReport => {
  const findings: PersistenceReadinessFinding[] = [];
  if (input.artifact.documentKind !== input.kind) findings.push({ code: "ARTIFACT_KIND_MISMATCH", severity: "BLOCKER", detail: "Artifact kind differs from document kind." });
  if (input.binding.documentKind !== input.kind) findings.push({ code: "BINDING_KIND_MISMATCH", severity: "BLOCKER", detail: "Binding kind differs from document kind." });
  if (input.auditEvents.length === 0) findings.push({ code: "AUDIT_TRAIL_EMPTY", severity: "WARNING", detail: "No audit event is attached to the persistence candidate." });
  if (input.numberingReservation && !input.numberingRegister) findings.push({ code: "MISSING_NUMBER_REGISTER", severity: "BLOCKER", detail: "A numbering reservation has no committed register entry." });
  if (input.numberingReservation && input.numberingRegister && input.numberingReservation.registerKey !== input.numberingRegister.registerKey) findings.push({ code: "NUMBER_RESERVATION_REGISTER_MISMATCH", severity: "BLOCKER", detail: "Reservation and register keys differ." });
  if (input.numberingRegister && input.numberingRegister.documentId !== input.documentId) findings.push({ code: "NUMBER_REGISTER_DOCUMENT_MISMATCH", severity: "BLOCKER", detail: "Number register points to another document." });
  return Object.freeze({ ready: findings.every((finding) => finding.severity !== "BLOCKER"), findings: Object.freeze(findings) });
};
