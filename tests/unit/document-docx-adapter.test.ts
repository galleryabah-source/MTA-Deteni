import { describe, expect, it } from "vitest";
import { AbstractDocxRenderer, DOCX_MEDIA_TYPE } from "../../src/lib/document-engine/docx-adapter";
import type { RenderDocumentInput } from "../../src/lib/document-engine/renderer";

const input: RenderDocumentInput = {
  documentKind: "SURAT_IZIN_KELUAR_SEMENTARA",
  templateId: "TPL-SYN-001",
  templateVersion: "1.0.0",
  mergedContent: "Synthetic document content",
};

describe("DOCX renderer boundary", () => {
  it("passes valid bound content to the concrete renderer", async () => {
    class TestRenderer extends AbstractDocxRenderer {
      async renderDocx(value: RenderDocumentInput) {
        return {
          documentKind: value.documentKind,
          mediaType: DOCX_MEDIA_TYPE,
          bytes: new Uint8Array([80, 75, 3, 4]),
          contentHash: "a".repeat(64),
        };
      }
    }
    const artifact = await new TestRenderer().render(input);
    expect(artifact.mediaType).toBe(DOCX_MEDIA_TYPE);
    expect(artifact.bytes.byteLength).toBeGreaterThan(0);
  });

  it("fails closed for incomplete template binding", async () => {
    class TestRenderer extends AbstractDocxRenderer {
      async renderDocx() { throw new Error("SHOULD_NOT_RUN"); }
    }
    await expect(new TestRenderer().render({ ...input, templateVersion: "" }))
      .rejects.toThrow("INCOMPLETE_TEMPLATE_BINDING");
  });
});
