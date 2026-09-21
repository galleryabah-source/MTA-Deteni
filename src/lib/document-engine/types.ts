export type DocumentKind = "SURAT_IZIN_KELUAR_SEMENTARA" | "SURAT_TUGAS_PENGAWALAN";

export type DocumentLifecycle =
  | "DRAFT"
  | "GENERATED"
  | "REVIEWED"
  | "APPROVED"
  | "ISSUED"
  | "DOWNLOADED"
  | "DISTRIBUTED"
  | "ARCHIVED";

export interface DocumentFieldDefinition {
  readonly name: string;
  readonly required: boolean;
  readonly sensitive?: boolean;
  readonly format?: "TEXT" | "DATE" | "DATETIME" | "NUMBER" | "BOOLEAN";
}

export interface DocumentContract {
  readonly contractId: string;
  readonly kind: DocumentKind;
  readonly version: string;
  readonly fields: readonly DocumentFieldDefinition[];
  readonly requiredApproval: boolean;
}

export interface TemplateVersion {
  readonly templateId: string;
  readonly documentKind: DocumentKind;
  readonly version: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly placeholders: readonly string[];
  readonly contentHash: string;
  readonly immutable: true;
}

export interface DocumentInstance {
  readonly documentId: string;
  readonly kind: DocumentKind;
  readonly contractVersion: string;
  readonly templateVersion: string;
  readonly lifecycle: DocumentLifecycle;
  readonly documentNumber?: string;
  readonly generatedAt?: string;
  readonly issuedAt?: string;
  readonly contentHash?: string;
}
