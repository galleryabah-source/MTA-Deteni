import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { createDocumentArtifact } from "../../src/lib/document-engine/artifact";
import { InMemoryDocumentBindingRepository, createDocumentBinding } from "../../src/lib/document-engine/binding";

const bytes = new TextEncoder().encode("synthetic document");
const hash = createHash("sha256").update(bytes).digest("hex");

const artifact = createDocumentArtifact({
  artifactId: "ART-SYN-BIND-001",
  documentKind: "SURAT_IZIN_KELUAR_SEMENTARA",
  mediaType: "text/plain",
  bytes,
  contentHash: hash,
  contractId: "MTA-DETENI-DOC-001",
  contractVersion: "1.0.0",
  templateId: "TPL-SYN-001",
  templateVersion: "1.0.0",
  createdAt: "2026-09-14T08:00:00Z",
});

const binding = {
  documentId: "DOC-SYN-001",
  documentKind: artifact.documentKind,
  contractId: artifact.contractId,
  contractVersion: artifact.contractVersion,
  templateId: artifact.templateId,
  templateVersion: artifact.templateVersion,
  artifactId: artifact.artifactId,
  artifactContentHash: artifact.contentHash,
  documentNumber: "SINT/001/2026",
  lifecycle: "GENERATED" as const,
  boundAt: "2026-09-14T08:01:00Z",
};

describe("document binding", () => {
  it("accepts an exact artifact/template/contract binding", () => {
    expect(createDocumentBinding(binding, artifact).artifactId).toBe(artifact.artifactId);
  });

  it("rejects artifact hash mismatch", () => {
    expect(() => createDocumentBinding({ ...binding, artifactContentHash: "b".repeat(64) }, artifact))
      .toThrow("BINDING_ARTIFACT_MISMATCH");
  });

  it("rejects template mismatch", () => {
    expect(() => createDocumentBinding({ ...binding, templateVersion: "9.9.9" }, artifact))
      .toThrow("BINDING_TEMPLATE_MISMATCH");
  });

  it("rejects duplicate document and artifact bindings", async () => {
    const repository = new InMemoryDocumentBindingRepository();
    await repository.bind(binding, artifact);
    await expect(repository.bind(binding, artifact)).rejects.toThrow("DOCUMENT_BINDING_IMMUTABLE");
    await expect(repository.bind({ ...binding, documentId: "DOC-SYN-002" }, artifact))
      .rejects.toThrow("ARTIFACT_ALREADY_BOUND");
  });
});
