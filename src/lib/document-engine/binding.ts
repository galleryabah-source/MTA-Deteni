import type { DocumentArtifact } from "./artifact";
import type { DocumentKind, DocumentLifecycle } from "./types";

export interface DocumentBinding {
  readonly documentId: string;
  readonly documentKind: DocumentKind;
  readonly contractId: string;
  readonly contractVersion: string;
  readonly templateId: string;
  readonly templateVersion: string;
  readonly artifactId: string;
  readonly artifactContentHash: string;
  readonly documentNumber?: string;
  readonly lifecycle: DocumentLifecycle;
  readonly boundAt: string;
}

export const createDocumentBinding = (input: DocumentBinding, artifact: DocumentArtifact): DocumentBinding => {
  if (!input.documentId.trim()) throw new Error("INVALID_DOCUMENT_ID");
  if (input.documentKind !== artifact.documentKind) throw new Error("BINDING_KIND_MISMATCH");
  if (input.contractId !== artifact.contractId || input.contractVersion !== artifact.contractVersion) {
    throw new Error("BINDING_CONTRACT_MISMATCH");
  }
  if (input.templateId !== artifact.templateId || input.templateVersion !== artifact.templateVersion) {
    throw new Error("BINDING_TEMPLATE_MISMATCH");
  }
  if (input.artifactId !== artifact.artifactId || input.artifactContentHash !== artifact.contentHash) {
    throw new Error("BINDING_ARTIFACT_MISMATCH");
  }
  if (Number.isNaN(Date.parse(input.boundAt))) throw new Error("INVALID_BINDING_DATE");
  return Object.freeze({ ...input });
};

export interface DocumentBindingRepository {
  bind(binding: DocumentBinding, artifact: DocumentArtifact): Promise<void>;
  getByDocumentId(documentId: string): Promise<DocumentBinding | undefined>;
  getByArtifactId(artifactId: string): Promise<DocumentBinding | undefined>;
}

export class InMemoryDocumentBindingRepository implements DocumentBindingRepository {
  private readonly byDocumentId = new Map<string, DocumentBinding>();
  private readonly byArtifactId = new Map<string, string>();

  async bind(input: DocumentBinding, artifact: DocumentArtifact): Promise<void> {
    const binding = createDocumentBinding(input, artifact);
    if (this.byDocumentId.has(binding.documentId)) throw new Error("DOCUMENT_BINDING_IMMUTABLE");
    if (this.byArtifactId.has(binding.artifactId)) throw new Error("ARTIFACT_ALREADY_BOUND");
    this.byDocumentId.set(binding.documentId, binding);
    this.byArtifactId.set(binding.artifactId, binding.documentId);
  }

  async getByDocumentId(documentId: string): Promise<DocumentBinding | undefined> {
    const binding = this.byDocumentId.get(documentId);
    return binding ? Object.freeze({ ...binding }) : undefined;
  }

  async getByArtifactId(artifactId: string): Promise<DocumentBinding | undefined> {
    const documentId = this.byArtifactId.get(artifactId);
    return documentId ? this.getByDocumentId(documentId) : undefined;
  }
}
