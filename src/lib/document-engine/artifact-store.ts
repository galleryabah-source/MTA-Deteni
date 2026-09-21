import { createDocumentArtifact, type DocumentArtifact } from "./artifact";
import { verifySha256 } from "./integrity";

export interface DocumentArtifactStore {
  put(artifact: DocumentArtifact): Promise<void>;
  get(artifactId: string): Promise<DocumentArtifact | undefined>;
}

const cloneArtifact = (artifact: DocumentArtifact): DocumentArtifact =>
  Object.freeze({ ...artifact, bytes: new Uint8Array(artifact.bytes) });

export class InMemoryDocumentArtifactStore implements DocumentArtifactStore {
  private readonly artifacts = new Map<string, DocumentArtifact>();

  async put(input: DocumentArtifact): Promise<void> {
    const artifact = createDocumentArtifact(input);
    if (this.artifacts.has(artifact.artifactId)) throw new Error("ARTIFACT_IMMUTABLE");
    if (!verifySha256(artifact.bytes, artifact.contentHash)) throw new Error("ARTIFACT_HASH_MISMATCH");
    this.artifacts.set(artifact.artifactId, cloneArtifact(artifact));
  }

  async get(artifactId: string): Promise<DocumentArtifact | undefined> {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) return undefined;
    if (!verifySha256(artifact.bytes, artifact.contentHash)) throw new Error("ARTIFACT_HASH_MISMATCH");
    return cloneArtifact(artifact);
  }
}
