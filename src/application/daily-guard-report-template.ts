import type { DailyGuardSection } from "./daily-guard-report-contract.js";
import { DAILY_GUARD_SECTION_ORDER, assertDailyGuardSectionOrder } from "./daily-guard-report-contract.js";
import type { ReportSnapshot } from "./report-artifact.js";

/**
 * Presentation metadata observed in the supplied daily guard report source.
 * Business data remains in ReportSnapshot; this contract only maps it to the
 * report's evidenced presentation sections and heading labels.
 */
export type DailyGuardPresentationContract = Readonly<{
  title: "LAPORAN HARIAN REGU JAGA";
  organizationLines: readonly [
    "SEKSI KEAMANAN DAN KETERTIBAN",
    "RUMAH DETENSI IMIGRASI",
  ];
  locationLine: string;
  dutyLabel: "PIKET PAGI REGU BRAVO" | string;
  dateLine: string;
  dutyTimeLine: string;
  sectionHeadings: Readonly<Record<DailyGuardSection, string>>;
  closingLocationDateLine: string;
  commandSignatureLabel: "Komandan Jaga";
  acknowledgmentLabel: "Mengetahui";
  acknowledgmentRole: "Kepala Seksi Keamanan dan Ketertiban";
}>;

export const DAILY_GUARD_SOURCE_HEADINGS: Readonly<Record<DailyGuardSection, string>> = Object.freeze({
  IDENTITAS_LAPORAN: "LAPORAN HARIAN REGU JAGA",
  PERSONEL_REGU: "SERAH TERIMA REGU JAGA",
  KONDISI_DETENI: "PENGECEKAN & KONTROL BLOK DETENI",
  KEGIATAN_JAGA: "KEGIATAN JAGA",
  KEJADIAN_PENTING: "KEJADIAN PENTING",
  SERAH_TERIMA: "SERAH TERIMA REGU JAGA",
  PENGESAHAN: "PENGESAHAN",
});

export const DAILY_GUARD_PRESENTATION_CONTRACT: DailyGuardPresentationContract = Object.freeze({
  title: "LAPORAN HARIAN REGU JAGA",
  organizationLines: ["SEKSI KEAMANAN DAN KETERTIBAN", "RUMAH DETENSI IMIGRASI"],
  locationLine: "RUMAH DETENSI IMIGRASI PONTIANAK",
  dutyLabel: "PIKET PAGI REGU BRAVO",
  dateLine: "Jumat, 11 September 2026",
  dutyTimeLine: "Pukul 07.00 s.d. 14.00 WIB",
  sectionHeadings: DAILY_GUARD_SOURCE_HEADINGS,
  closingLocationDateLine: "Kubu Raya, 11 September 2026",
  commandSignatureLabel: "Komandan Jaga",
  acknowledgmentLabel: "Mengetahui",
  acknowledgmentRole: "Kepala Seksi Keamanan dan Ketertiban",
});

export function assertDailyGuardPresentationContract(contract: DailyGuardPresentationContract): void {
  if (contract.title !== "LAPORAN HARIAN REGU JAGA") throw new Error("Daily guard source title drifted.");
  if (contract.organizationLines.length !== 2) throw new Error("Daily guard organization header is incomplete.");
  if (!contract.locationLine.trim() || !contract.dutyLabel.trim() || !contract.dateLine.trim() || !contract.dutyTimeLine.trim()) {
    throw new Error("Daily guard identity presentation is incomplete.");
  }
  assertDailyGuardSectionOrder(Object.keys(contract.sectionHeadings));
  for (const section of DAILY_GUARD_SECTION_ORDER) {
    if (!contract.sectionHeadings[section]?.trim()) throw new Error(`Missing source heading mapping: ${section}`);
  }
  if (contract.commandSignatureLabel !== "Komandan Jaga" || contract.acknowledgmentLabel !== "Mengetahui") {
    throw new Error("Daily guard signature labels drifted.");
  }
}

export function mapSnapshotToDailyGuardPresentation(snapshot: ReportSnapshot): Readonly<Record<DailyGuardSection, string>> {
  assertDailyGuardPresentationContract(DAILY_GUARD_PRESENTATION_CONTRACT);
  const mapped = {} as Record<DailyGuardSection, string>;
  for (const section of DAILY_GUARD_SECTION_ORDER) {
    const value = snapshot.sections[section];
    if (!value?.trim()) throw new Error(`Snapshot cannot map empty daily guard section: ${section}`);
    mapped[section] = value;
  }
  return Object.freeze(mapped);
}
