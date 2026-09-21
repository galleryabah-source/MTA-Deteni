import { describe, expect, it } from "vitest";
import { reconcileDocumentState } from "../../src/lib/document-engine/reconciliation";

describe("document reconciliation", () => {
  it("detects stale idempotency and missing binding artifacts", () => {
    const report = reconcileDocumentState({
      now: "2026-09-14T10:00:00Z",
      staleAfterMs: 60_000,
      idempotency: [{ key: "IDEM-1", requestFingerprint: "a".repeat(64), status: "IN_PROGRESS", createdAt: "2026-09-14T09:00:00Z" }],
      outbox: [], artifacts: [],
      bindings: [{
        documentId: "DOC-1", documentKind: "SURAT_IZIN_KELUAR_SEMENTARA", contractId: "C1", contractVersion: "1.0.0",
        templateId: "T1", templateVersion: "1.0.0", artifactId: "ART-1", artifactContentHash: "b".repeat(64), lifecycle: "GENERATED", boundAt: "2026-09-14T09:00:00Z",
      }],
    });
    expect(report.healthy).toBe(false);
    expect(report.findings.map((f) => f.code)).toEqual(expect.arrayContaining(["STUCK_IDEMPOTENCY", "BINDING_ARTIFACT_MISSING"]));
  });

  it("detects orphan artifacts and failed outbox events without marking them critical", () => {
    const report = reconcileDocumentState({
      now: "2026-09-14T10:00:00Z", staleAfterMs: 60_000, idempotency: [],
      artifacts: [{ artifactId: "ART-1", documentKind: "SURAT_IZIN_KELUAR_SEMENTARA", mediaType: "text/plain", bytes: new Uint8Array([1]), contentHash: "a".repeat(64), contractId: "C1", contractVersion: "1.0.0", templateId: "T1", templateVersion: "1.0.0", createdAt: "2026-09-14T09:00:00Z" }],
      bindings: [],
      outbox: [{ eventId: "OUT-1", eventType: "DOCUMENT_ISSUED", aggregateId: "DOC-1", idempotencyKey: "IDEM-1", payloadFingerprint: "a".repeat(64), status: "FAILED", attempts: 1, occurredAt: "2026-09-14T09:00:00Z", lastErrorCode: "NETWORK_UNAVAILABLE" }],
    });
    expect(report.healthy).toBe(true);
    expect(report.findings.map((f) => f.code)).toEqual(expect.arrayContaining(["ORPHAN_ARTIFACT", "OUTBOX_FAILED"]));
  });
});
