import type { DocumentKind } from "./types";

export type DocumentArtifactMediaType =
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "text/plain";

export interface DocumentArtifact {
  readonly artifactId: string;
  readonly documentKind: DocumentKind;
  readonly mediaType: DocumentArtifactMediaType;
  readonly bytes: Uint8Array;
  readonly contentHash: string;
  readonly contractId: string;
  readonly contractVersion: string;
  readonly templateId: string;
  readonly templateVersion: string;
  readonly createdAt: string;
}

export const createDocumentArtifact = (input: DocumentArtifact): DocumentArtifact => {
  if (!input.artifactId.trim()) throw new Error("INVALID_ARTIFACT_ID");
  if (input.bytes.byteLength === 0) throw new Error("EMPTY_ARTIFACT");
  if (!/^[a-f0-9]{64}$/.test(input.contentHash)) throw new Error("INVALID_ARTIFACT_HASH");
  if (!input.contractId || !input.contractVersion || !input.templateId || !input.templateVersion) {
    throw new Error("INCOMPLETE_ARTIFACT_BINDING");
  }
  if (Number.isNaN(Date.parse(input.createdAt))) throw new Error("INVALID_ARTIFACT_DATE");
  return Object.freeze({ ...input, bytes: new Uint8Array(input.bytes) });
};
