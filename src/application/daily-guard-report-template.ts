import type { DailyGuardSection } from "./daily-guard-report-contract.js";
import { DAILY_GUARD_SECTION_ORDER } from "./daily-guard-report-contract.js";
import type { ReportSnapshot } from "./report-artifact.js";

/**
 * Source-grounded presentation facts only. Business data remains in
 * ReportSnapshot; layout metadata is deliberately separate.
 */
export type DailyGuardPresentationContract = Readonly<{
  title: "LAPORAN HARIAN REGU JAGA";
  organizationLines: readonly [
    "SEKSI KEAMANAN DAN KETERTIBAN",
    "RUMAH DETENSI IMIGRASI",
  ];
  locationLine: "RUMAH DETENSI IMIGRASI PONTIANAK";
  dutyLabel: "PIKET PAGI REGU BRAVO";
  dateLine: "Jumat, 11 September 2026";
  dutyTimeLine: "Pukul 07.00 s.d. 14.00 WIB";
  evidencedSectionHeadings: Readonly<Partial<Record<DailyGuardSection, string>>>;
  closingLocationDateLine: "Kubu Raya, 11 September 2026";
  commandSignatureLabel: "Komandan Jaga Bravo";
  acknowledgmentLabel: "Mengetahui";
  acknowledgmentRole: "Kepala Seksi Keamanan dan Ketertiban";
}>;

export const DAILY_GUARD_PRESENTATION_CONTRACT: DailyGuardPresentationContract = Object.freeze({
  title: "LAPORAN HARIAN REGU JAGA",
  organizationLines: ["SEKSI KEAMANAN DAN KETERTIBAN", "RUMAH DETENSI IMIGRASI"],
  locationLine: "RUMAH DETENSI IMIGRASI PONTIANAK",
  dutyLabel: "PIKET PAGI REGU BRAVO",
  dateLine: "Jumat, 11 September 2026",
  dutyTimeLine: "Pukul 07.00 s.d. 14.00 WIB",
  evidencedSectionHeadings: Object.freeze({
    IDENTITAS_LAPORAN: "LAPORAN HARIAN REGU JAGA",
    KONDISI_DETENI: "PENGECEKAN & KONTROL BLOK DETENI",
    SERAH_TERIMA: "SERAH TERIMA REGU JAGA",
  }),
  closingLocationDateLine: "Kubu Raya, 11 September 2026",
  commandSignatureLabel: "Komandan Jaga Bravo",
  acknowledgmentLabel: "Mengetahui",
  acknowledgmentRole: "Kepala Seksi Keamanan dan Ketertiban",
});

export function assertDailyGuardPresentationContract(contract: DailyGuardPresentationContract): void {
  if (contract.title !== "LAPORAN HARIAN REGU JAGA") throw new Error("Daily guard source title drifted.");
  if (contract.organizationLines.length !== 2) throw new Error("Daily guard organization header is incomplete.");
  if (!contract.locationLine || !contract.dutyLabel || !contract.dateLine || !contract.dutyTimeLine) {
    throw new Error("Daily guard identity presentation is incomplete.");
  }
  if (contract.commandSignatureLabel !== "Komandan Jaga Bravo" || contract.acknowledgmentLabel !== "Mengetahui") {
    throw new Error("Daily guard signature labels drifted.");
  }
  if (contract.acknowledgmentRole !== "Kepala Seksi Keamanan dan Ketertiban") {
    throw new Error("Daily guard acknowledgment role drifted.");
  }
  for (const [section, label] of Object.entries(contract.evidencedSectionHeadings)) {
    if (!DAILY_GUARD_SECTION_ORDER.includes(section as DailyGuardSection) || !label?.trim()) {
      throw new Error("Daily guard evidenced heading mapping is invalid.");
    }
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
