import { describe, expect, it } from "vitest";
import { verifyDocumentInvariants } from "../../src/lib/document-engine/invariants";

const artifact = {
  artifactId: "ART-SYN-001", documentKind: "SURAT_IZIN_KELUAR_SEMENTARA" as const,
  mediaType: "text/plain" as const, bytes: new Uint8Array([1]), contentHash: "a".repeat(64),
  contractId: "C1", contractVersion: "1.0.0", templateId: "T1", templateVersion: "1.0.0", createdAt: "2026-09-14T08:00:00Z",
};
const binding = {
  documentId: "DOC-SYN-001", documentKind: "SURAT_IZIN_KELUAR_SEMENTARA" as const,
  contractId: "C1", contractVersion: "1.0.0", templateId: "T1", templateVersion: "1.0.0",
  artifactId: "ART-SYN-001", artifactContentHash: "a".repeat(64), lifecycle: "GENERATED" as const, boundAt: "2026-09-14T08:00:00Z",
};

describe("document invariants", () => {
  it("accepts a consistent document chain", () => {
    const report = verifyDocumentInvariants({ documentId: "DOC-SYN-001", lifecycle: "GENERATED", contractId: "C1", contractVersion: "1.0.0", templateId: "T1", templateVersion: "1.0.0", artifact, binding }, "2026-09-14T08:01:00Z");
    expect(report.valid).toBe(true);
  });

  it("detects artifact/binding hash divergence", () => {
    const report = verifyDocumentInvariants({ documentId: "DOC-SYN-001", lifecycle: "GENERATED", contractId: "C1", contractVersion: "1.0.0", templateId: "T1", templateVersion: "1.0.0", artifact: { ...artifact, contentHash: "b".repeat(64) }, binding }, "2026-09-14T08:01:00Z");
    expect(report.valid).toBe(false);
    expect(report.findings.map((f) => f.code)).toContain("ARTIFACT_HASH_MISMATCH");
  });

  it("detects audit events that contradict current lifecycle", () => {
    const report = verifyDocumentInvariants({ documentId: "DOC-SYN-001", lifecycle: "GENERATED", contractId: "C1", contractVersion: "1.0.0", templateId: "T1", templateVersion: "1.0.0", artifact, binding, auditEvents: [{ eventId: "AUD-1", documentId: "DOC-SYN-001", documentKind: "SURAT_IZIN_KELUAR_SEMENTARA", action: "ARCHIVE", fromLifecycle: "DISTRIBUTED", toLifecycle: "ARCHIVED", actorUserId: "USER-1", occurredAt: "2026-09-14T08:00:00Z", correlationId: "CORR-1" }] }, "2026-09-14T08:01:00Z");
    expect(report.valid).toBe(false);
    expect(report.findings.map((f) => f.code)).toContain("AUDIT_LIFECYCLE_MISMATCH");
  });
});
