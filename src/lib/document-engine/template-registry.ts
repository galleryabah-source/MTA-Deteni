import type { DocumentKind, DocumentContract, TemplateVersion } from "./types";

export interface TemplateRegistryEntry extends TemplateVersion {
  readonly contractId: string;
  readonly contractVersion: string;
  readonly content: string;
}

export interface TemplateSelectionContext {
  readonly documentKind: DocumentKind;
  readonly at: string;
}

export interface TemplateRegistry {
  register(template: TemplateRegistryEntry): void;
  get(templateId: string, version: string): TemplateRegistryEntry | undefined;
  resolve(context: TemplateSelectionContext): TemplateRegistryEntry | undefined;
}

const keyOf = (templateId: string, version: string): string => `${templateId}@${version}`;

const assertValidDate = (value: string, field: string): number => {
  const time = Date.parse(value);
  if (Number.isNaN(time)) throw new Error(`INVALID_TEMPLATE_DATE:${field}`);
  return time;
};

/** In-memory registry for the domain kernel. Persistence belongs to a later integration layer. */
export class InMemoryTemplateRegistry implements TemplateRegistry {
  private readonly entries = new Map<string, TemplateRegistryEntry>();

  register(template: TemplateRegistryEntry): void {
    if (!template.immutable) throw new Error("TEMPLATE_MUST_BE_IMMUTABLE");
    if (!template.templateId || !template.version || !template.contractId || !template.contractVersion) {
      throw new Error("INVALID_TEMPLATE_IDENTITY");
    }
    if (!template.content.trim()) throw new Error("EMPTY_TEMPLATE_CONTENT");

    const effectiveFrom = assertValidDate(template.effectiveFrom, "effectiveFrom");
    const effectiveTo = template.effectiveTo === undefined
      ? undefined
      : assertValidDate(template.effectiveTo, "effectiveTo");
    if (effectiveTo !== undefined && effectiveTo <= effectiveFrom) {
      throw new Error("INVALID_TEMPLATE_EFFECTIVE_RANGE");
    }

    const key = keyOf(template.templateId, template.version);
    if (this.entries.has(key)) throw new Error("TEMPLATE_VERSION_IMMUTABLE");
    this.entries.set(key, Object.freeze({ ...template }));
  }

  get(templateId: string, version: string): TemplateRegistryEntry | undefined {
    return this.entries.get(keyOf(templateId, version));
  }

  resolve(context: TemplateSelectionContext): TemplateRegistryEntry | undefined {
    const at = assertValidDate(context.at, "at");
    return [...this.entries.values()]
      .filter((entry) => entry.documentKind === context.documentKind)
      .filter((entry) => {
        const from = Date.parse(entry.effectiveFrom);
        const to = entry.effectiveTo === undefined ? Number.POSITIVE_INFINITY : Date.parse(entry.effectiveTo);
        return at >= from && at < to;
      })
      .sort((a, b) => Date.parse(b.effectiveFrom) - Date.parse(a.effectiveFrom))[0];
  }
}

export const assertTemplateContractCompatibility = (
  template: TemplateRegistryEntry,
  contract: DocumentContract,
): void => {
  if (template.documentKind !== contract.kind) throw new Error("TEMPLATE_DOCUMENT_KIND_MISMATCH");
  if (template.contractId !== contract.contractId) throw new Error("TEMPLATE_CONTRACT_ID_MISMATCH");
  if (template.contractVersion !== contract.version) throw new Error("TEMPLATE_CONTRACT_VERSION_MISMATCH");
};
