import type { DocumentIdempotencyRecord } from "./idempotency";
import type { DocumentOutboxEvent } from "./outbox";
import type { DocumentBinding } from "./binding";
import type { DocumentArtifact } from "./artifact";

export type ReconciliationSeverity = "INFO" | "WARNING" | "CRITICAL";
export type ReconciliationCode =
  | "STUCK_IDEMPOTENCY"
  | "ORPHAN_ARTIFACT"
  | "UNBOUND_ARTIFACT"
  | "OUTBOX_STUCK_PROCESSING"
  | "OUTBOX_FAILED"
  | "BINDING_ARTIFACT_MISSING"
  | "INCONSISTENT_BINDING_HASH";

export interface ReconciliationFinding {
  readonly code: ReconciliationCode;
  readonly severity: ReconciliationSeverity;
  readonly resourceId: string;
  readonly detail: string;
}

export interface ReconciliationInput {
  readonly now: string;
  readonly staleAfterMs: number;
  readonly idempotency: readonly DocumentIdempotencyRecord[];
  readonly outbox: readonly DocumentOutboxEvent[];
  readonly artifacts: readonly DocumentArtifact[];
  readonly bindings: readonly DocumentBinding[];
}

export interface ReconciliationReport {
  readonly checkedAt: string;
  readonly findings: readonly ReconciliationFinding[];
  readonly healthy: boolean;
}

export const reconcileDocumentState = (input: ReconciliationInput): ReconciliationReport => {
  if (Number.isNaN(Date.parse(input.now)) || input.staleAfterMs <= 0) throw new Error("INVALID_RECONCILIATION_WINDOW");
  const findings: ReconciliationFinding[] = [];
  const bindingArtifactIds = new Set(input.bindings.map((b) => b.artifactId));
  const artifactIds = new Set(input.artifacts.map((a) => a.artifactId));
  const nowMs = Date.parse(input.now);

  for (const record of input.idempotency) {
    if (record.status === "IN_PROGRESS" && nowMs - Date.parse(record.createdAt) > input.staleAfterMs) {
      findings.push({ code: "STUCK_IDEMPOTENCY", severity: "CRITICAL", resourceId: record.key, detail: "Idempotency reservation exceeded the approved recovery window." });
    }
  }

  for (const artifact of input.artifacts) {
    if (!bindingArtifactIds.has(artifact.artifactId)) {
      findings.push({ code: "ORPHAN_ARTIFACT", severity: "WARNING", resourceId: artifact.artifactId, detail: "Artifact has no document binding." });
    }
  }

  for (const binding of input.bindings) {
    if (!artifactIds.has(binding.artifactId)) {
      findings.push({ code: "BINDING_ARTIFACT_MISSING", severity: "CRITICAL", resourceId: binding.documentId, detail: "Binding references a missing artifact." });
    }
    const artifact = input.artifacts.find((a) => a.artifactId === binding.artifactId);
    if (artifact && artifact.contentHash !== binding.artifactContentHash) {
      findings.push({ code: "INCONSISTENT_BINDING_HASH", severity: "CRITICAL", resourceId: binding.documentId, detail: "Binding hash differs from the artifact hash." });
    }
  }

  for (const event of input.outbox) {
    if (event.status === "PROCESSING" && nowMs - Date.parse(event.occurredAt) > input.staleAfterMs) {
      findings.push({ code: "OUTBOX_STUCK_PROCESSING", severity: "WARNING", resourceId: event.eventId, detail: "Outbox event remains processing beyond the recovery window." });
    }
    if (event.status === "FAILED") {
      findings.push({ code: "OUTBOX_FAILED", severity: "WARNING", resourceId: event.eventId, detail: event.lastErrorCode ?? "OUTBOX_HANDLER_FAILED" });
    }
  }

  return Object.freeze({ checkedAt: input.now, findings: Object.freeze(findings), healthy: findings.every((f) => f.severity !== "CRITICAL") });
};
