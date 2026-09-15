import type { DashboardRole } from "./read-model.js";
import type { WorkbenchSection } from "./p13-601-660-operator-workbench.js";

export type NavigationItem = Readonly<{
  id: string;
  label: string;
  section: WorkbenchSection;
  readOnly: boolean;
}>;

const NAVIGATION: readonly NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", section: "DASHBOARD", readOnly: true },
  { id: "detainees", label: "Data Deteni", section: "DETAINEES", readOnly: false },
  { id: "headcount", label: "Headcount", section: "HEADCOUNT", readOnly: true },
  { id: "movement", label: "Pergerakan", section: "MOVEMENT", readOnly: false },
  { id: "temporary-exit", label: "Izin Keluar Sementara", section: "TEMPORARY_EXIT", readOnly: false },
  { id: "qr-verify", label: "Verifikasi QR", section: "QR_VERIFY", readOnly: true },
  { id: "reports", label: "Laporan", section: "REPORTS", readOnly: false },
  { id: "audit", label: "Audit Trail", section: "AUDIT", readOnly: true },
];

export function buildRoleNavigation(role: DashboardRole, allowedSections: readonly WorkbenchSection[]): readonly NavigationItem[] {
  if (!role) throw new Error("NAVIGATION_ROLE_REQUIRED");
  return NAVIGATION.filter((item) => allowedSections.includes(item.section));
}

export function assertNavigationSectionAllowed(item: NavigationItem, allowedSections: readonly WorkbenchSection[]): void {
  if (!allowedSections.includes(item.section)) throw new Error("NAVIGATION_SECTION_DENIED");
}
