export type DashboardOperationalState = "STABLE" | "ATTENTION" | "CRITICAL" | "RECONCILIATION_PENDING";

export type OperationalDashboardState = Readonly<{
  state: DashboardOperationalState;
  headcountReconciliation: "MATCH" | "MISMATCH" | "PENDING";
  alertCount: number;
  pendingTemporaryExits: number;
  pendingApprovals: number;
}>;

export function deriveOperationalDashboardState(input: Omit<OperationalDashboardState, "state">): OperationalDashboardState {
  if (input.headcountReconciliation === "PENDING") return { ...input, state: "RECONCILIATION_PENDING" };
  if (input.headcountReconciliation === "MISMATCH") return { ...input, state: "CRITICAL" };
  if (input.alertCount > 0 || input.pendingTemporaryExits > 0 || input.pendingApprovals > 0) return { ...input, state: "ATTENTION" };
  return { ...input, state: "STABLE" };
}
