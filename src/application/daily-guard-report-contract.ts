import type { ReportSnapshot } from "./report-artifact.js";

export const DAILY_GUARD_SECTION_ORDER = Object.freeze([
  "IDENTITAS_LAPORAN",
  "PERSONEL_REGU",
  "KONDISI_DETENI",
  "KEGIATAN_JAGA",
  "KEJADIAN_PENTING",
  "SERAH_TERIMA",
  "PENGESAHAN",
] as const);

export type DailyGuardSection = (typeof DAILY_GUARD_SECTION_ORDER)[number];

export function assertDailyGuardSectionOrder(order: readonly string[]): void {
  if (order.length !== DAILY_GUARD_SECTION_ORDER.length || order.some((value, index) => value !== DAILY_GUARD_SECTION_ORDER[index])) {
    throw new Error("Daily guard report section order does not match the canonical contract.");
  }
}

export function assertDailyGuardSnapshot(snapshot: ReportSnapshot): void {
  for (const section of DAILY_GUARD_SECTION_ORDER) {
    if (!(snapshot.sections[section] ?? "").trim()) throw new Error(`Daily guard report section is incomplete: ${section}`);
  }
}
