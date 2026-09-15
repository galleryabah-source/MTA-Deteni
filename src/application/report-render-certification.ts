import type { ReportRenderFormat } from "./report-renderer.js";
import type { OperationalReportRender } from "./report-artifact.js";

export const DAILY_GUARD_TEMPLATE_VERSION = "DGRT-1.0" as const;

export type CertifiedReportRender = Readonly<{
  templateVersion: typeof DAILY_GUARD_TEMPLATE_VERSION;
  format: ReportRenderFormat;
  outputId: string;
  snapshotId: string;
  documentNumber: string;
  content: string;
  contentFingerprint: string;
  syntheticOnly: true;
}>;

/** Stable non-cryptographic fingerprint for deterministic regression evidence. */
export function fingerprintRenderContent(content: string): string {
  let hash = 2166136261;
  for (let index = 0; index < content.length; index += 1) {
    hash ^= content.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function certifyReportRender(input: Readonly<{
  format: ReportRenderFormat;
  render: OperationalReportRender;
}>): CertifiedReportRender {
  if (!input.render.snapshotId.trim() || !input.render.documentNumber.trim()) {
    throw new Error("Cannot certify a render without snapshot and document identity.");
  }
  const contentFingerprint = fingerprintRenderContent(input.render.content);
  return Object.freeze({
    templateVersion: DAILY_GUARD_TEMPLATE_VERSION,
    format: input.format,
    outputId: `${DAILY_GUARD_TEMPLATE_VERSION}:${input.format}:${input.render.snapshotId}:${input.render.documentNumber}`,
    snapshotId: input.render.snapshotId,
    documentNumber: input.render.documentNumber,
    content: input.render.content,
    contentFingerprint,
    syntheticOnly: true,
  });
}

export function assertCertifiedReportRender(
  certified: CertifiedReportRender,
  expected: Readonly<{ format: ReportRenderFormat; render: OperationalReportRender }>,
): void {
  if (certified.templateVersion !== DAILY_GUARD_TEMPLATE_VERSION) throw new Error("Unknown report template version.");
  if (!certified.syntheticOnly) throw new Error("Certified report render must be synthetic-only.");
  if (certified.format !== expected.format) throw new Error("Report render format mismatch.");
  if (certified.snapshotId !== expected.render.snapshotId || certified.documentNumber !== expected.render.documentNumber) {
    throw new Error("Report render identity mismatch.");
  }
  if (certified.content !== expected.render.content) throw new Error("Report render content mismatch.");
  if (certified.contentFingerprint !== fingerprintRenderContent(expected.render.content)) {
    throw new Error("Report render fingerprint mismatch.");
  }
}
