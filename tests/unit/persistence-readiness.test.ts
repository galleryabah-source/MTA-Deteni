import { describe, expect, it } from "vitest";
import { evaluatePersistenceReadiness } from "../../src/lib/document-engine/persistence-readiness";

const base = {
  documentId: "DOC-SYN-001", kind: "SURAT_IZIN_KELUAR_SEMENTARA" as const, lifecycle: "ISSUED" as const,
  contractId: "C1", contractVersion: "1.0.0", templateId: "T1", templateVersion: "1.0.0",
  artifact: { artifactId: "A1", documentKind: "SURAT_IZIN_KELUAR_SEMENTARA" as const, mediaType: "text/plain" as const, bytes: new Uint8Array([1]), contentHash: "a".repeat(64), contractId: "C1", contractVersion: "1.0.0", templateId: "T1", templateVersion: "1.0.0", createdAt: "2026-09-14T08:00:00Z" },
  binding: { documentId: "DOC-SYN-001", documentKind: "SURAT_IZIN_KELUAR_SEMENTARA" as const, contractId: "C1", contractVersion: "1.0.0", templateId: "T1", templateVersion: "1.0.0", artifactId: "A1", artifactContentHash: "a".repeat(64), lifecycle: "ISSUED" as const, boundAt: "2026-09-14T08:00:00Z" },
  auditEvents: [{ eventId: "AUD-1", documentId: "DOC-SYN-001", documentKind: "SURAT_IZIN_KELUAR_SEMENTARA" as const, action: "ISSUE" as const, actorUserId: "USER-1", occurredAt: "2026-09-14T08:00:00Z", correlationId: "CORR-1" }],
};

describe("persistence readiness", () => {
  it("blocks a reservation without a register", () => {
    const report = evaluatePersistenceReadiness({ ...base, numberingReservation: { registerKey: "SIP:2026:1", number: "SIP/0001/2026", sequence: 1, reservedAt: "2026-09-14T08:00:00Z" } });
    expect(report.ready).toBe(false);
    expect(report.findings.map((f) => f.code)).toContain("MISSING_NUMBER_REGISTER");
  });

  it("accepts a consistent persistence candidate", () => {
    const report = evaluatePersistenceReadiness({ ...base, numberingReservation: { registerKey: "SIP:2026:1", number: "SIP/0001/2026", sequence: 1, reservedAt: "2026-09-14T08:00:00Z" }, numberingRegister: { registerKey: "SIP:2026:1", documentId: "DOC-SYN-001", number: "SIP/0001/2026", issuedAt: "2026-09-14T08:01:00Z" } });
    expect(report.ready).toBe(true);
  });
});
