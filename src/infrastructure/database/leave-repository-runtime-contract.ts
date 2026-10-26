export const LEAVE_REPOSITORY_RUNTIME_CONTRACT_VERSION = "P10.32-v1";

export interface LeaveRecord {
  id: string;
  detaineeId?: string;
  destination?: string;
  purpose?: string;
  startAt?: string;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRepositoryPort {
  getById(id: string): Promise<LeaveRecord | null>;
  listByDetainee(detaineeId: string): Promise<LeaveRecord[]>;
  insert(record: LeaveRecord): Promise<LeaveRecord>;
  update(id: string, patch: Partial<LeaveRecord>): Promise<LeaveRecord>;
}

export const LEAVE_TABLE = "public.mta_leaves";

export const LEAVE_COLUMN_MAP = Object.freeze({
  id: "id",
  detaineeId: "detainee_id",
  destination: "destination",
  purpose: "purpose",
  startAt: "start_at",
  status: "status",
  metadata: "metadata",
  createdAt: "created_at",
  updatedAt: "updated_at",
});
