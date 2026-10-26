export const DETAINEE_REPOSITORY_RUNTIME_CONTRACT_VERSION = "P10.29-v1";

export interface DetaineeRecord {
  id: string;
  code: string;
  name: string;
  nationality?: string;
  status: string;
  placement?: string;
  source: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DetaineeRepositoryPort {
  getById(id: string): Promise<DetaineeRecord | null>;
  getByCode(code: string): Promise<DetaineeRecord | null>;
  insert(record: DetaineeRecord): Promise<DetaineeRecord>;
  update(id: string, patch: Partial<DetaineeRecord>): Promise<DetaineeRecord>;
}

export const DETAINEE_TABLE = "public.mta_detainees";

export const DETAINEE_COLUMN_MAP = Object.freeze({
  id: "id",
  code: "code",
  name: "name",
  nationality: "nationality",
  status: "status",
  placement: "placement",
  source: "source",
  metadata: "metadata",
  createdAt: "created_at",
  updatedAt: "updated_at",
});
