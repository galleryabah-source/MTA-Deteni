export type ReguJagaReport = Readonly<{
  reportId: string;
  reportDate: string;
  shift: "PAGI" | "SIANG" | "MALAM";
  teamName: string;
  generatedAt: string;
  sections: readonly ReportSection[];
  sourceSnapshotId: string;
  documentNumber?: string;
  approvalBinding?: Readonly<{ approvalId: string; approvedAt: string; approvedBy: string }>;
}>;

export type ReportSection = Readonly<{
  code: string;
  title: string;
  rows: readonly ReportRow[];
}>;

export type ReportRow = Readonly<{
  label: string;
  value: string;
  provenance: "OPERATIONAL_READ_MODEL" | "MANUAL_VERIFIED";
}>;

export const REGU_JAGA_REQUIRED_SECTIONS = [
  "IDENTITAS_LAPORAN",
  "PERSONEL_REGU",
  "KONDISI_DETENI",
  "KEGIATAN_JAGA",
  "KEJADIAN_PENTING",
  "SERAH_TERIMA",
  "PENGESAHAN",
] as const;

export function validateReguJagaReport(report: ReguJagaReport): readonly string[] {
  const errors: string[] = [];
  for (const section of REGU_JAGA_REQUIRED_SECTIONS) {
    if (!report.sections.some((candidate) => candidate.code === section)) errors.push(`SECTION_REQUIRED:${section}`);
  }
  if (!report.reportId || !report.reportDate || !report.teamName || !report.sourceSnapshotId) errors.push("REPORT_METADATA_INCOMPLETE");
  return errors;
}
