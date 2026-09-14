import type { DocumentContract, DocumentKind } from "./types";
import { mergeTemplate } from "./merge";
import { validateDocumentInput } from "./validation";
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
  readonly data: Record<string, string | number | boolean>;
  readonly templateId: string;
  readonly templateVersion: string;
  readonly generatedAt: string;
}

export interface GeneratedDocument {
  readonly binding: GeneratedDocumentBinding;
  readonly artifact: RenderedDocumentArtifact;
}

export async function generateDocument(
  input: GenerateDocumentInput,
  registry: TemplateRegistry,
  renderer: DocumentRenderer,
): Promise<GeneratedDocument> {
  const template: TemplateRegistryEntry | undefined = registry.get(input.templateId, input.templateVersion);
  if (!template) throw new Error("TEMPLATE_NOT_FOUND");

  assertTemplateContractCompatibility(template, input.contract);
  const validation = validateDocumentInput(input.contract, template, input.data);
  if (!validation.valid) {
    throw new Error(
      `DOCUMENT_VALIDATION_FAILED:${[
        ...validation.missingFields.map((field) => `MISSING_FIELD:${field}`),
        ...validation.unknownFields.map((field) => `UNKNOWN_FIELD:${field}`),
        ...validation.missingPlaceholders.map((field) => `MISSING_PLACEHOLDER:${field}`),
      ].join(",")}`,
    );
  }

  const merged = mergeTemplate(template.content, input.data);
  const artifact = await renderer.render({
    documentKind: input.contract.kind,
    mergedContent: merged.content,
    templateId: template.templateId,
    templateVersion: template.version,
  });

  return {
    binding: {
      documentKind: input.contract.kind,
      contractId: input.contract.contractId,
      contractVersion: input.contract.version,
      templateId: template.templateId,
      templateVersion: template.version,
      templateContentHash: template.contentHash,
      generatedContentHash: sha256(artifact.content),
    },
    artifact,
  };
}
