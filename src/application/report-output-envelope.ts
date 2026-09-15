import { assertCertifiedReportRender, type CertifiedReportRender } from "./report-render-certification.js";
import type { ReportRenderFormat } from "./report-renderer.js";

export type ReportOutputEnvelope = Readonly<{
  outputId: string;
  templateVersion: CertifiedReportRender["templateVersion"];
  format: ReportRenderFormat;
  mimeType: "text/plain" | "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  filename: string;
  snapshotId: string;
  documentNumber: string;
  content: string;
  contentFingerprint: string;
  syntheticOnly: true;
}>;

const MIME_TYPES: Readonly<Record<ReportRenderFormat, ReportOutputEnvelope["mimeType"]>> = Object.freeze({
  REFERENCE_TEXT: "text/plain",
  PDF: "application/pdf",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
});

export function createReportOutputEnvelope(input: Readonly<{ certified: CertifiedReportRender }>): ReportOutputEnvelope {
  const { certified } = input;
  assertCertifiedReportRender(certified, { format: certified.format, render: {
    snapshotId: certified.snapshotId,
    documentNumber: certified.documentNumber,
    sectionOrder: Object.freeze([]),
    content: certified.content,
  } });
  const safe = certified.documentNumber.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^\.+|\.+$/g, "");
  if (!safe) throw new Error("Document number cannot produce a safe filename.");
  const extension = certified.format === "PDF" ? "pdf" : certified.format === "DOCX" ? "docx" : "txt";
  return Object.freeze({
    outputId: certified.outputId,
    templateVersion: certified.templateVersion,
    format: certified.format,
    mimeType: MIME_TYPES[certified.format],
    filename: `${safe}.${extension}`,
    snapshotId: certified.snapshotId,
    documentNumber: certified.documentNumber,
    content: certified.content,
    contentFingerprint: certified.contentFingerprint,
    syntheticOnly: true,
  });
}

export function assertReportOutputEnvelope(envelope: ReportOutputEnvelope, certified: CertifiedReportRender): void {
  if (!envelope.syntheticOnly) throw new Error("Report output must be synthetic-only.");
  if (envelope.outputId !== certified.outputId || envelope.templateVersion !== certified.templateVersion) throw new Error("Report output certification binding mismatch.");
  if (envelope.format !== certified.format || envelope.mimeType !== MIME_TYPES[certified.format]) throw new Error("Report output format or MIME mismatch.");
  if (envelope.snapshotId !== certified.snapshotId || envelope.documentNumber !== certified.documentNumber) throw new Error("Report output identity mismatch.");
  if (envelope.content !== certified.content || envelope.contentFingerprint !== certified.contentFingerprint) throw new Error("Report output content mismatch.");
}
