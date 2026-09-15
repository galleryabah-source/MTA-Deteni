export type DetaineeReadModel = Readonly<{
  id: string;
  displayName: string;
  status: "ACTIVE" | "TRANSFERRED" | "DEPARTED" | "CLOSED";
  placementLabel: string;
  blockLabel: string;
  qrStatus: "ACTIVE" | "EXPIRED" | "NOT_ISSUED";
  lastMovementAt?: string;
}>;

export type HeadcountReadModel = Readonly<{
  capturedAt: string;
  totalActive: number;
  byBlock: readonly { blockLabel: string; count: number }[];
  reconciliation: "MATCH" | "MISMATCH" | "PENDING";
}>;

export type OperatorDashboardReadModel = Readonly<{
  generatedAt: string;
  detainees: readonly DetaineeReadModel[];
  headcount: HeadcountReadModel;
  pendingTemporaryExits: number;
  pendingApprovals: number;
  operationalAlerts: readonly string[];
}>;

export type DashboardRole = "OWNER" | "ADMIN" | "EDITOR" | "REVIEWER" | "AUDITOR";

export const ROLE_READ_MODEL_ACCESS: Readonly<Record<DashboardRole, readonly string[]>> = {
  OWNER: ["dashboard.read", "timeline.read", "audit.read"],
  ADMIN: ["dashboard.read", "timeline.read"],
  EDITOR: ["dashboard.read"],
  REVIEWER: ["dashboard.read", "approval.read"],
  AUDITOR: ["dashboard.read", "audit.read"],
};
