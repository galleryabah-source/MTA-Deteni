export const DOCUMENT_REPOSITORY_RUNTIME_CONTRACT_VERSION = "P10.33-v1";

export interface DocumentRecord {
  id: string;
  documentId: string;
  documentType: string;
  reportDate?: string;
  reguId?: string;
  shiftId?: string;
  status: string;
  revision: number;
  revisionOf?: string;
  templateVersion?: string;
  integrityHash?: string;
  filename?: string;
  payload: Record<string, unknown>;
  createdAt: string;
  validatedAt?: string;
  generatedAt?: string;
  reviewStartedAt?: string;
  approvedAt?: string;
  finalizedAt?: string;
  createdBy?: string;
  updatedAt: string;
}

export interface DocumentRepositoryPort {
  getById(id: string): Promise<DocumentRecord | null>;
  getByDocumentId(documentId: string): Promise<DocumentRecord | null>;
  insert(record: DocumentRecord): Promise<DocumentRecord>;
  update(id: string, patch: Partial<DocumentRecord>): Promise<DocumentRecord>;
}

export const DOCUMENT_TABLE = "public.mta_documents";

export const DOCUMENT_COLUMN_MAP = Object.freeze({
  id: "id",
  documentId: "document_id",
  documentType: "document_type",
  reportDate: "report_date",
  reguId: "regu_id",
  shiftId: "shift_id",
  status: "status",
  revision: "revision",
  revisionOf: "revision_of",
  templateVersion: "template_version",
  integrityHash: "integrity_hash",
  filename: "filename",
  payload: "payload",
  createdAt: "created_at",
  validatedAt: "validated_at",
  generatedAt: "generated_at",
  reviewStartedAt: "review_started_at",
  approvedAt: "approved_at",
  finalizedAt: "finalized_at",
  createdBy: "created_by",
  updatedAt: "updated_at",
});
