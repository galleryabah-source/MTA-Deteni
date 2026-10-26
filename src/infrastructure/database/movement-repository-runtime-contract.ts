export const MOVEMENT_REPOSITORY_RUNTIME_CONTRACT_VERSION = "P10.31-v1";

export interface MovementRecord {
  id: string;
  detaineeId?: string;
  movementType: string;
  destination?: string;
  purpose?: string;
  occurredAt: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface MovementRepositoryPort {
  getById(id: string): Promise<MovementRecord | null>;
  listByDetainee(detaineeId: string): Promise<MovementRecord[]>;
  insert(record: MovementRecord): Promise<MovementRecord>;
}

export const MOVEMENT_TABLE = "public.mta_movements";

export const MOVEMENT_COLUMN_MAP = Object.freeze({
  id: "id",
  detaineeId: "detainee_id",
  movementType: "movement_type",
  destination: "destination",
  purpose: "purpose",
  occurredAt: "occurred_at",
  metadata: "metadata",
  createdAt: "created_at",
});
