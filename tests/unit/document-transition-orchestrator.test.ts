import { describe, expect, it } from "vitest";
import { DocumentTransitionOrchestrator, type DocumentTransitionTransaction } from "../../src/lib/document-engine/transition-orchestrator";

const base = {
  documentId: "DOC-SYN-TRANS-001",
  from: "REVIEWED" as const,
  to: "APPROVED" as const,
  audit: {
    eventId: "AUD-SYN-001",
    documentId: "DOC-SYN-TRANS-001",
    documentKind: "SURAT_IZIN_KELUAR_SEMENTARA" as const,
    action: "APPROVE" as const,
    fromLifecycle: "REVIEWED" as const,
    toLifecycle: "APPROVED" as const,
    actorUserId: "USER-SYN-001",
    occurredAt: "2026-09-14T08:00:00Z",
    correlationId: "CORR-SYN-001",
  },
};

describe("document transition orchestrator", () => {
  it("commits through the transaction port", async () => {
    let calls = 0;
    const orchestrator = new DocumentTransitionOrchestrator({
      execute: async () => { calls += 1; },
    });
    const result = await orchestrator.execute(base);
    expect(result.committed).toBe(true);
    expect(calls).toBe(1);
  });

  it("fails closed when audit identity does not match", async () => {
    const orchestrator = new DocumentTransitionOrchestrator({ execute: async () => undefined });
    await expect(orchestrator.execute({
      ...base,
      audit: { ...base.audit, correlationId: "CORR-OTHER" },
    })).rejects.toThrow("AUDIT_LIFECYCLE_MISMATCH");
  });

  it("fails closed when binding points to another document", async () => {
    const orchestrator = new DocumentTransitionOrchestrator({ execute: async () => undefined });
    const input: DocumentTransitionTransaction = {
      ...base,
      binding: {
        documentId: "DOC-OTHER",
        documentKind: "SURAT_IZIN_KELUAR_SEMENTARA",
        contractId: "MTA-DETENI-DOC-001",
        contractVersion: "1.0.0",
        templateId: "TPL-SYN-001",
        templateVersion: "1.0.0",
        artifactId: "ART-SYN-001",
        artifactContentHash: "a".repeat(64),
        lifecycle: "REVIEWED",
        boundAt: "2026-09-14T08:00:00Z",
      },
    };
    await expect(orchestrator.execute(input)).rejects.toThrow("BINDING_DOCUMENT_MISMATCH");
  });
});
