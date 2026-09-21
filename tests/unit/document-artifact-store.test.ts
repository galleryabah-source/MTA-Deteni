import { describe, expect, it } from "vitest";
import { sha256 } from "../../src/lib/document-engine/integrity";
import { InMemoryDocumentArtifactStore } from "../../src/lib/document-engine/artifact-store";
import type { DocumentArtifact } from "../../src/lib/document-engine/artifact";

const makeArtifact = (id: string, text = "synthetic artifact"): DocumentArtifact => {
  const bytes = new TextEncoder().encode(text);
  return {
    artifactId: id,
    documentKind: "SURAT_IZIN_KELUAR_SEMENTARA",
    mediaType: "text/plain",
    bytes,
    contentHash: sha256(bytes),
    contractId: "MTA-DETENI-DOC-001",
    contractVersion: "1.0.0",
    templateId: "TPL-SYN-001",
    templateVersion: "1.0.0",
    createdAt: "2026-09-14T08:00:00Z",
  };
};

describe("document artifact store", () => {
  it("rejects duplicate artifact IDs instead of overwriting history", async () => {
    const store = new InMemoryDocumentArtifactStore();
    await store.put(makeArtifact("ART-SYN-STORE-001", "first"));
    await expect(store.put(makeArtifact("ART-SYN-STORE-001", "second"))).rejects.toThrow("ARTIFACT_IMMUTABLE");
    await expect(store.get("ART-SYN-STORE-001")).resolves.toMatchObject({ contentHash: sha256(new TextEncoder().encode("first")) });
  });

  it("returns a defensive byte copy and preserves the original artifact", async () => {
    const store = new InMemoryDocumentArtifactStore();
    await store.put(makeArtifact("ART-SYN-STORE-002"));
    const first = await store.get("ART-SYN-STORE-002");
    expect(first).toBeDefined();
    if (!first) return;
    first.bytes[0] ^= 255;
    const second = await store.get("ART-SYN-STORE-002");
    expect(second?.contentHash).toBe(sha256(new TextEncoder().encode("synthetic artifact")));
  });
});
