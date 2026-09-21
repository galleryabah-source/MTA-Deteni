import type { DocumentKind } from "./types";
import type { DocumentRenderer, RenderDocumentInput, RenderedDocumentArtifact } from "./renderer";

export interface DocxRenderOptions {
  readonly author?: string;
  readonly subject?: string;
}

/**
 * Production boundary for DOCX generation. The adapter is deliberately free of
 * AI and persistence concerns; an approved DOCX library can implement it later.
 */
export interface DocxRenderer extends DocumentRenderer {
  renderDocx(input: RenderDocumentInput, options?: DocxRenderOptions): Promise<RenderedDocumentArtifact>;
}

export abstract class AbstractDocxRenderer implements DocxRenderer {
  abstract renderDocx(input: RenderDocumentInput, options?: DocxRenderOptions): Promise<RenderedDocumentArtifact>;

  async render(input: RenderDocumentInput): Promise<RenderedDocumentArtifact> {
    if (!input.mergedContent.trim()) throw new Error("EMPTY_DOCUMENT_CONTENT");
    if (!input.templateId || !input.templateVersion) throw new Error("INCOMPLETE_TEMPLATE_BINDING");
    return this.renderDocx(input);
  }
}

export const DOCX_MEDIA_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" as const;

export const assertDocxKind = (kind: DocumentKind): void => {
  if (kind !== "SURAT_IZIN_KELUAR_SEMENTARA" && kind !== "SURAT_TUGAS_PENGAWALAN") {
    throw new Error("UNSUPPORTED_DOCUMENT_KIND");
  }
};
