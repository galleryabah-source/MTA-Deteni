import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { InMemoryTemplateRegistry } from "../../src/lib/document-engine/template-registry";
import { DeterministicTextRenderer } from "../../src/lib/document-engine/renderer";
import { generateDocument } from "../../src/lib/document-engine/generator";
import { TEMPORARY_EXIT_LETTER_CONTRACT } from "../../src/lib/document-engine/contracts";

const content = "Izin {{deteniName}} untuk {{purpose}} pada {{departureAt}} sampai {{returnAt}}. Nomor {{documentNumber}}.";
const template = {
  templateId: "TPL-001",
  documentKind: "SURAT_IZIN_KELUAR_SEMENTARA" as const,
  version: "1.0.0",
  effectiveFrom: "2026-01-01T00:00:00Z",
  placeholders: ["deteniName", "purpose", "departureAt", "returnAt", "documentNumber"],
  contentHash: createHash("sha256").update(content).digest("hex"),
  immutable: true as const,
  contractId: "MTA-DETENI-DOC-001",
  contractVersion: "1.0.0",
  content,
};

const data = {
  deteniId: "SYN-001",
  deteniName: "SYNTHETIC PERSON",
  nationality: "SYNTHETIC",
  purpose: "MEDICAL APPOINTMENT",
  departureAt: "2026-09-14T08:00:00Z",
  returnAt: "2026-09-14T12:00:00Z",
  documentNumber: "MTA/0001/2026",
};

describe("document engine integration kernel", () => {
  it("rejects duplicate template versions", () => {
    const registry = new InMemoryTemplateRegistry();
    registry.register(template);
    expect(() => registry.register(template)).toThrow("TEMPLATE_VERSION_IMMUTABLE");
  });

  it("resolves the historical template effective at a timestamp", () => {
    const registry = new InMemoryTemplateRegistry();
    registry.register({ ...template, effectiveTo: "2026-06-01T00:00:00Z" });
    const newer = { ...template, version: "2.0.0", effectiveFrom: "2026-06-01T00:00:00Z", contentHash: template.contentHash };
    registry.register(newer);
    expect(registry.resolve({ documentKind: template.documentKind, at: "2026-05-01T00:00:00Z" })?.version).toBe("1.0.0");
    expect(registry.resolve({ documentKind: template.documentKind, at: "2026-07-01T00:00:00Z" })?.version).toBe("2.0.0");
  });

  it("generates deterministically without an AI dependency", async () => {
    const registry = new InMemoryTemplateRegistry();
    registry.register(template);
    const result = await generateDocument(
      { contract: TEMPORARY_EXIT_LETTER_CONTRACT, data, templateId: "TPL-001", templateVersion: "1.0.0", generatedAt: "2026-09-14T08:00:00Z" },
      registry,
      new DeterministicTextRenderer(),
    );
    expect(result.binding.templateVersion).toBe("1.0.0");
    expect(result.artifact.content).toContain("SYNTHETIC PERSON");
    expect(result.binding.generatedContentHash).toHaveLength(64);
  });
});
