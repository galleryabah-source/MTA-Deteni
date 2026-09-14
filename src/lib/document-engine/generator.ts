import type { DocumentContract, DocumentKind } from "./types";
import { mergeTemplate } from "./merge";
import { validateDocumentData } from "./validation";
import { sha256 } from "./integrity";
import {
  assertTemplateContractCompatibility,
  type TemplateRegistry,
  type TemplateRegistryEntry,
} from "./template-registry";
import type { DocumentRenderer, RenderedDocumentArtifact } from "./renderer";

export interface GeneratedDocumentBinding {
  readonly documentKind: DocumentKind;
  readonly contractId: string;
  readonly contractVersion: string;
  readonly templateId: string;
  readonly templateVersion: string;
  readonly templateContentHash: string;
  readonly generatedContentHash: string;
}

export interface GenerateDocumentInput {
  readonly contract: DocumentContract;
  readonly data: Record<string, unknown>;
  readonly templateId?: string;
  readonly generatedAt: string;
}

export interface GeneratedDocument {
  readonly binding: GeneratedDocumentBinding;
  readonly artifact: RenderedDocumentArtifact;
}

const contractFields = (contract: DocumentContract) => contract.fields;

export async function generateDocument(
  input: GenerateDocumentInput,
  registry: TemplateRegistry,
  renderer: DocumentRenderer,
): Promise<GeneratedDocument> {
  const template: TemplateRegistryEntry | undefined = input.templateId
    ? registry.get(input.templateId, registry.get(input.templateId, "")?.version ?? "")
    : registry.resolve({ documentKind: input.contract.kind, at: input.generatedAt });

  // Explicit template IDs must be bound by an exact version. Callers needing an
  // exact historical binding should resolve the version first and pass a registry
  // implementation that exposes that exact entry. No fallback to another template.
  if (!template) throw new Error("TEMPLATE_NOT_FOUND");

  assertTemplateContractCompatibility(template, input.contract);

  const validation = validateDocumentData(
    contractFields(input.contract),
    input.data,
    template.placeholders,
  );
  if (!validation.valid) {
    throw new Error(
      `DOCUMENT_VALIDATION_FAILED:${[
        ...validation.missingFields.map((field) => `MISSING_FIELD:${field}`),
        ...validation.unknownFields.map((field) => `UNKNOWN_FIELD:${field}`),
        ...validation.missingPlaceholders.map((field) => `MISSING_PLACEHOLDER:${field}`),
      ].join(",")}`,
    );
  }

  const mergedContent = mergeTemplate(template.placeholders, input.data);
  const artifact = await renderer.render({
    documentKind: input.contract.kind,
    mergedContent,
    templateId: template.templateId,
    templateVersion: template.version,
  });

  const generatedContentHash = sha256(artifact.content);
  return {
    binding: {
      documentKind: input.contract.kind,
      contractId: input.contract.contractId,
      contractVersion: input.contract.version,
      templateId: template.templateId,
      templateVersion: template.version,
      templateContentHash: template.contentHash,
      generatedContentHash,
    },
    artifact,
  };
}
