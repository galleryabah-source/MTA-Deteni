import type { ActorContext } from "../shared/contracts";
import { DomainError } from "../shared/errors";

export type DocumentArtifact = Readonly<{
  id: string;
  documentType: "TEMPORARY_EXIT_LETTER" | "ESCORT_ASSIGNMENT_LETTER";
  aggregateId: string;
  templateId: string;
  templateVersion: string;
  numberingRef: string;
  contentHash: string;
  status: "DRAFT" | "APPROVED" | "ISSUED" | "ARCHIVED";
  createdAt: string;
  createdBy: string;
}>;

export type DocumentRepository = {
  get(id: string): Promise<DocumentArtifact | null>;
  save(document: DocumentArtifact): Promise<void>;
};

export type DocumentDeps = Readonly<{
  repository: DocumentRepository;
  now: () => string;
  canManage: (actor: ActorContext) => boolean;
  validateTemplate: (templateId: string, templateVersion: string) => Promise<boolean>;
}>;

export class DocumentEngineService {
  constructor(private readonly deps: DocumentDeps) {}

  async registerArtifact(input: {
    id: string;
    documentType: DocumentArtifact["documentType"];
    aggregateId: string;
    templateId: string;
    templateVersion: string;
    numberingRef: string;
    contentHash: string;
    actor: ActorContext;
  }): Promise<DocumentArtifact> {
    if (!this.deps.canManage(input.actor)) throw new DomainError("FORBIDDEN_SCOPE", "Actor is not authorized for document handling.");
    if ([input.id, input.aggregateId, input.templateId, input.templateVersion, input.numberingRef, input.contentHash].some((v) => !v.trim())) {
      throw new DomainError("VALIDATION_FAILED", "Document artifact fields are required.");
    }
    if (!(await this.deps.validateTemplate(input.templateId, input.templateVersion))) throw new DomainError("VALIDATION_FAILED", "Template is not valid or effective.");
    if (await this.deps.repository.get(input.id)) throw new DomainError("CONFLICT", "Document artifact already exists.");
    const artifact: DocumentArtifact = { id: input.id, documentType: input.documentType, aggregateId: input.aggregateId, templateId: input.templateId, templateVersion: input.templateVersion, numberingRef: input.numberingRef, contentHash: input.contentHash, status: "DRAFT", createdAt: this.deps.now(), createdBy: input.actor.actorId };
    await this.deps.repository.save(artifact);
    return artifact;
  }
}
