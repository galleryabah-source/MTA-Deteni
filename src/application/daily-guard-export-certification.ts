import { createReportOutputEnvelope, assertReportOutputEnvelope, type ReportOutputEnvelope } from "./report-output-envelope.js";
import { certifyReportRender, assertCertifiedReportRender, type CertifiedReportRender } from "./report-render-certification.js";
import { renderDailyGuardReport } from "./daily-guard-report-renderer.js";
import { DAILY_GUARD_SECTION_ORDER } from "./daily-guard-report-contract.js";
import type { ReportSnapshot } from "./report-artifact.js";
import type { ReportRenderer } from "./report-renderer.js";

export type DailyGuardExportCertification = Readonly<{
  certified: CertifiedReportRender;
  output: ReportOutputEnvelope;
  syntheticOnly: true;
}>;

export function certifyDailyGuardExport(input: Readonly<{ snapshot: ReportSnapshot; renderer: ReportRenderer }>): DailyGuardExportCertification {
  const rendered = renderDailyGuardReport({ snapshot: input.snapshot, sectionOrder: DAILY_GUARD_SECTION_ORDER, renderer: input.renderer });
  const certified = certifyReportRender({ format: rendered.rendererFormat, render: rendered.render });
  assertCertifiedReportRender(certified, { format: rendered.rendererFormat, render: rendered.render });
  const output = createReportOutputEnvelope({ certified });
  assertReportOutputEnvelope(output, certified);
  return Object.freeze({ certified, output, syntheticOnly: true });
}
