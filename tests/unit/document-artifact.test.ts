import { describe, expect, it } from "vitest";
import { createDocumentArtifact } from "../../src/lib/document-engine/artifact";

describe("document artifact", () => {
  it("accepts a complete immutable artifact binding", () => {
    const artifact = createDocumentArtifact({
      artifactId: "ART-SYN-001",
      documentKind: "SURAT_IZIN_KELUAR_SEMENTARA",
      mediaType: "text/plain",
      bytes: new TextEncoder().encode("synthetic document"),
      contentHash: "a".repeat(64),
      contractId: "MTA-DETENI-DOC-001",
      contractVersion: "1.0.0",
      templateId: "TPL-SYN-001",
      templateVersion: "1.0.0",
      createdAt: "2026-09-14T08:00:00Z",
    });
    expect(artifact.artifactId).toBe("ART-SYN-001");
    expect(artifact.contentHash).toHaveLength(64);
  });

  it("fails closed for an incomplete binding", () => {
    expect(() => createDocumentArtifact({
      artifactId: "ART-SYN-002",
      documentKind: "SURAT_TUGAS_PENGAWALAN",
      mediaType: "text/plain",
      bytes: new TextEncoder().encode("synthetic"),
      contentHash: "a".repeat(64),
      contractId: "",
      contractVersion: "1.0.0",
      templateId: "TPL-SYN-002",
      templateVersion: "1.0.0",
      createdAt: "2026-09-14T08:00:00Z",
    })).toThrow("INCOMPLETE_ARTIFACT_BINDING");
  });
});
