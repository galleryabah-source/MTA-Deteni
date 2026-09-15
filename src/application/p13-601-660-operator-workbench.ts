import type { ActorContext } from "../domain/shared/contracts.js";
import type { DashboardRole, OperatorDashboardReadModel } from "./read-model.js";

export type WorkbenchSection = "DASHBOARD" | "DETAINEES" | "HEADCOUNT" | "MOVEMENT" | "TEMPORARY_EXIT" | "QR_VERIFY" | "REPORTS" | "AUDIT";

export type OperatorWorkbench = Readonly<{
  role: DashboardRole;
  actorId: string;
  generatedAt: string;
  sections: readonly WorkbenchSection[];
  dashboard: OperatorDashboardReadModel;
}>;

const ROLE_SECTIONS: Readonly<Record<DashboardRole, readonly WorkbenchSection[]>> = {
  OWNER: ["DASHBOARD", "DETAINEES", "HEADCOUNT", "MOVEMENT", "TEMPORARY_EXIT", "QR_VERIFY", "REPORTS", "AUDIT"],
  ADMIN: ["DASHBOARD", "DETAINEES", "HEADCOUNT", "MOVEMENT", "TEMPORARY_EXIT", "QR_VERIFY", "REPORTS"],
  EDITOR: ["DASHBOARD", "DETAINEES", "MOVEMENT", "TEMPORARY_EXIT", "QR_VERIFY", "REPORTS"],
  REVIEWER: ["DASHBOARD", "REPORTS"],
  AUDITOR: ["DASHBOARD", "AUDIT"],
};

export function composeOperatorWorkbench(actor: ActorContext, dashboard: OperatorDashboardReadModel): OperatorWorkbench {
  if (!actor.actorId.trim() || !actor.correlationId.trim()) throw new Error("WORKBENCH_ACTOR_IDENTITY_REQUIRED");
  const role = actor.role as DashboardRole;
  if (!ROLE_SECTIONS[role]) throw new Error("WORKBENCH_ROLE_UNSUPPORTED");
  if (!dashboard.generatedAt.trim()) throw new Error("WORKBENCH_DASHBOARD_TIMESTAMP_REQUIRED");
  return { role, actorId: actor.actorId, generatedAt: dashboard.generatedAt, sections: ROLE_SECTIONS[role], dashboard };
}

export function canOpenWorkbenchSection(workbench: OperatorWorkbench, section: WorkbenchSection): boolean {
  return workbench.sections.includes(section);
}
