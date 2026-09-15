import { assertReportPreview, type ReportPreview } from "./report-preview.js";
import type { ReportSnapshot } from "./report-artifact.js";

export type ReportDownloadArtifact = Readonly<{
  downloadId: string;
  previewId: string;
  snapshotId: string;
  documentNumber: string;
  contentType: "text/plain";
  filename: string;
  content: string;
  syntheticOnly: true;
}>;

export function createReportDownload(input: Readonly<{
  downloadId: string;
  preview: ReportPreview;
  snapshot: ReportSnapshot;
}>): ReportDownloadArtifact {
  if (!input.downloadId.trim()) throw new Error("Report download identity is required.");
  assertReportPreview(input.preview, input.snapshot);
  const safeDocumentNumber = input.preview.documentNumber.replace(/[^A-Za-z0-9._-]+/g, "_");
  if (!safeDocumentNumber) throw new Error("Report document number is required for download.");
  return Object.freeze({
    downloadId: input.downloadId,
    previewId: input.preview.previewId,
    snapshotId: input.snapshot.snapshotId,
    documentNumber: input.snapshot.documentNumber,
    contentType: "text/plain",
    filename: `${safeDocumentNumber}.txt`,
    content: input.preview.content,
    syntheticOnly: true,
  });
}

export function assertReportDownload(download: ReportDownloadArtifact, preview: ReportPreview, snapshot: ReportSnapshot): void {
  if (!download.syntheticOnly) throw new Error("Report download must be synthetic-only.");
  assertReportPreview(preview, snapshot);
  if (download.previewId !== preview.previewId || download.snapshotId !== snapshot.snapshotId || download.documentNumber !== snapshot.documentNumber) throw new Error("Report download binding mismatch.");
  if (download.content !== preview.content) throw new Error("Report download content mismatch.");
}
