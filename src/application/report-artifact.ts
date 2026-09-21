import { assertReportGovernance } from "./reporting-governance.js";

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

export type OperationalReportRenderInput = Readonly<{
  snapshot: ReportSnapshot;
  sectionOrder: readonly string[];
}>;

export type OperationalReportRender = Readonly<{
  snapshotId: string;
  documentNumber: string;
  sectionOrder: readonly string[];
  content: string;
}>;

const requiredSections = ["IDENTITAS_LAPORAN", "PERSONEL_REGU", "KONDISI_DETENI", "KEGIATAN_JAGA", "KEJADIAN_PENTING", "SERAH_TERIMA", "PENGESAHAN"] as const;

export function validateReportSnapshot(snapshot: ReportSnapshot): void {
  assertReportGovernance(snapshot);
  if (!snapshot.snapshotId.trim() || !snapshot.sourceVersion.trim() || !snapshot.documentNumber.trim() || !snapshot.approvalBinding.trim()) throw new Error("Report snapshot identity/approval binding is incomplete.");
  for (const section of requiredSections) if (!(snapshot.sections[section] ?? "").trim()) throw new Error(`Missing mandatory report section: ${section}`);
}

export function toReportArtifact(snapshot: ReportSnapshot): ReportArtifact {
  validateReportSnapshot(snapshot);
  const content = requiredSections.map((section) => `[${section}]\n${snapshot.sections[section]}`).join("\n\n");
  return { snapshotId: snapshot.snapshotId, documentNumber: snapshot.documentNumber, contentType: "text/plain", content };
}

export function renderOperationalReport(input: OperationalReportRenderInput): OperationalReportRender {
  validateReportSnapshot(input.snapshot);
  if (input.sectionOrder.length !== requiredSections.length) throw new Error("Operational report section order is incomplete.");
  const expected = new Set<string>(requiredSections);
  const actual = new Set(input.sectionOrder);
  if (actual.size !== expected.size || [...expected].some((section) => !actual.has(section))) throw new Error("Operational report section order contains invalid or duplicate sections.");
  if (input.sectionOrder.some((section, index) => section !== requiredSections[index])) throw new Error("Operational report section order contains invalid or duplicate sections: non-canonical order.");
  const content = input.sectionOrder.map((section) => `[${section}]\n${input.snapshot.sections[section]}`).join("\n\n");
  return Object.freeze({ snapshotId: input.snapshot.snapshotId, documentNumber: input.snapshot.documentNumber, sectionOrder: Object.freeze([...input.sectionOrder]), content });
}

export function assertOperationalReportRender(render: OperationalReportRender, snapshot: ReportSnapshot): void {
  validateReportSnapshot(snapshot);
  if (render.snapshotId !== snapshot.snapshotId || render.documentNumber !== snapshot.documentNumber) throw new Error("Operational report render binding mismatch.");
  const expectedContent = render.sectionOrder.map((section) => `[${section}]\n${snapshot.sections[section]}`).join("\n\n");
  if (render.content !== expectedContent) throw new Error("Operational report render content mismatch.");
}
