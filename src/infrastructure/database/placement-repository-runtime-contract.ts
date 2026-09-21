export const PLACEMENT_REPOSITORY_RUNTIME_CONTRACT_VERSION = "P10.30-v1";

export interface PlacementRecord {
  id: string;
  detaineeId: string;
  block?: string;
  room?: string;
  since: string;
  until?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface PlacementRepositoryPort {
  getById(id: string): Promise<PlacementRecord | null>;
  listByDetainee(detaineeId: string): Promise<PlacementRecord[]>;
  insert(record: PlacementRecord): Promise<PlacementRecord>;
  update(id: string, patch: Partial<PlacementRecord>): Promise<PlacementRecord>;
}

export const PLACEMENT_TABLE = "public.mta_placements";

export const PLACEMENT_COLUMN_MAP = Object.freeze({
  id: "id",
  detaineeId: "detainee_id",
  block: "block",
  room: "room",
  since: "since",
  until: "until",
  metadata: "metadata",
  createdAt: "created_at",
});
