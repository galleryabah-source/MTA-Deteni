import { describe, expect, it } from "vitest";
import { sha256, verifySha256 } from "../../src/lib/document-engine/integrity";
import { mergeTemplate } from "../../src/lib/document-engine/merge";
import { canTransitionDocument } from "../../src/lib/document-engine/lifecycle";
import { TEMPORARY_EXIT_LETTER_CONTRACT, ESCORT_ASSIGNMENT_LETTER_CONTRACT } from "../../src/lib/document-engine/contracts";


describe("MTA DETENI document engine", () => {
  it("defines both mandatory document contracts", () => {
    expect(TEMPORARY_EXIT_LETTER_CONTRACT.requiredApproval).toBe(true);
    expect(ESCORT_ASSIGNMENT_LETTER_CONTRACT.requiredApproval).toBe(true);
  });

  it("merges placeholders deterministically", () => {
    expect(mergeTemplate("{{name}} / {{number}}", { name: "Synthetic", number: "001" }).content).toBe("Synthetic / 001");
  });

  it("rejects missing placeholders", () => {
    expect(() => mergeTemplate("{{name}}", {})).toThrow("MISSING_PLACEHOLDER:name");
  });

  it("enforces lifecycle ordering", () => {
    expect(canTransitionDocument("DRAFT", "GENERATED")).toBe(true);
    expect(canTransitionDocument("DRAFT", "ISSUED")).toBe(false);
    expect(canTransitionDocument("ARCHIVED", "ISSUED")).toBe(false);
  });

  it("provides content integrity verification", () => {
    const hash = sha256("synthetic-document");
    expect(verifySha256("synthetic-document", hash)).toBe(true);
    expect(verifySha256("tampered-document", hash)).toBe(false);
  });
});
