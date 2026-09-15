export type ReportSnapshot = Readonly<{
  snapshotId: string;
  sourceVersion: string;
  documentNumber: string;
  approvalBinding: string;
  provenance: readonly string[];
  sections: Readonly<Record<string, string>>;
}>;

export type ReportArtifact = Readonly<{
  snapshotId: string;
  documentNumber: string;
  contentType: "application/pdf" | "text/plain";
  content: string;
}>;

const requiredSections = ["IDENTITAS_LAPORAN", "PERSONEL_REGU", "KONDISI_DETENI", "KEGIATAN_JAGA", "KEJADIAN_PENTING", "SERAH_TERIMA", "PENGESAHAN"] as const;

export function validateReportSnapshot(snapshot: ReportSnapshot): void {
  if (!snapshot.snapshotId || !snapshot.sourceVersion || !snapshot.documentNumber || !snapshot.approvalBinding) throw new Error("Report snapshot identity/approval binding is incomplete.");
  for (const section of requiredSections) if (!(snapshot.sections[section] ?? "").trim()) throw new Error(`Missing mandatory report section: ${section}`);
}

export function toReportArtifact(snapshot: ReportSnapshot): ReportArtifact {
  validateReportSnapshot(snapshot);
  const content = requiredSections.map((section) => `[${section}]\n${snapshot.sections[section]}`).join("\n\n");
  return { snapshotId: snapshot.snapshotId, documentNumber: snapshot.documentNumber, contentType: "text/plain", content };
}
