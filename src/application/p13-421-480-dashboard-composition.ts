import type { DashboardRole, OperatorDashboardReadModel } from "./read-model.js";
import { ROLE_READ_MODEL_ACCESS } from "./read-model.js";

export type DashboardSources = Readonly<{
  generatedAt: string;
  detainees: OperatorDashboardReadModel["detainees"];
  headcount: OperatorDashboardReadModel["headcount"];
  pendingTemporaryExits: number;
  pendingApprovals: number;
  operationalAlerts: readonly string[];
}>;

export function composeOperatorDashboard(role: DashboardRole, sources: DashboardSources): OperatorDashboardReadModel {
  if (!ROLE_READ_MODEL_ACCESS[role]?.includes("dashboard.read")) throw new Error("DASHBOARD_READ_DENIED");
  if (!sources.generatedAt.trim()) throw new Error("DASHBOARD_GENERATED_AT_REQUIRED");
  if (sources.pendingTemporaryExits < 0 || sources.pendingApprovals < 0) throw new Error("DASHBOARD_COUNTER_INVALID");
  return {
    generatedAt: sources.generatedAt,
    detainees: sources.detainees,
    headcount: sources.headcount,
    pendingTemporaryExits: sources.pendingTemporaryExits,
    pendingApprovals: sources.pendingApprovals,
    operationalAlerts: [...sources.operationalAlerts],
  };
}
