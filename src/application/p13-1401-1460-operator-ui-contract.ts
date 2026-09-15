import type { DashboardRole, OperatorDashboardReadModel } from "./read-model.js";
import type { WorkbenchSection } from "./p13-601-660-operator-workbench.js";

export type UiDensity = "COMPACT" | "COMFORTABLE";
export type UiViewport = "PHONE" | "TABLET" | "DESKTOP";

export type OperatorUiContract = Readonly<{
  role: DashboardRole;
  viewport: UiViewport;
  density: UiDensity;
  sections: readonly WorkbenchSection[];
  dashboard: OperatorDashboardReadModel;
  touchTargetMinimumPx: 44;
  reducedMotionSafe: true;
}>;

export function buildOperatorUiContract(input: Omit<OperatorUiContract, "touchTargetMinimumPx" | "reducedMotionSafe">): OperatorUiContract {
  if (!input.sections.length) throw new Error("UI_SECTIONS_REQUIRED");
  if (!input.dashboard.generatedAt.trim()) throw new Error("UI_DASHBOARD_TIMESTAMP_REQUIRED");
  return { ...input, touchTargetMinimumPx: 44, reducedMotionSafe: true };
}
