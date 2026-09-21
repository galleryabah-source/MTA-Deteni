import type { DocumentKind } from "./types";

export interface RenderDocumentInput {
  readonly documentKind: DocumentKind;
  readonly mergedContent: string;
  readonly templateId: string;
  readonly templateVersion: string;
}

export interface RenderedDocumentArtifact {
  readonly mediaType: "text/plain" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  readonly content: string | Uint8Array;
  readonly renderer: string;
}

export interface DocumentRenderer {
  render(input: RenderDocumentInput): Promise<RenderedDocumentArtifact>;
}

/**
 * Deterministic test/reference adapter. Production DOCX rendering must implement
 * the same contract without introducing an AI dependency.
 */
export class DeterministicTextRenderer implements DocumentRenderer {
  async render(input: RenderDocumentInput): Promise<RenderedDocumentArtifact> {
    if (!input.mergedContent.trim()) throw new Error("EMPTY_DOCUMENT_CONTENT");
    return {
      mediaType: "text/plain",
      content: input.mergedContent,
      renderer: "deterministic-text-v1",
    };
  }
}
