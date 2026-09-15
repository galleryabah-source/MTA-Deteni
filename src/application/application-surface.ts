import { createUiReadModel, type UiReadModel, type UiSurface } from "./ui-surface.js";
import { createQrResult, type QrScanContext, type QrScanOutcome, type QrVerificationResult } from "./qr-scan-result.js";
import { toReportArtifact, type ReportArtifact, type ReportSnapshot } from "./report-artifact.js";

export type ApplicationSurface = Readonly<{
  readModel: UiReadModel;
  qr: (context: QrScanContext, outcome: QrScanOutcome, detaineeId?: string) => QrVerificationResult;
  report: (snapshot: ReportSnapshot) => ReportArtifact;
}>;

export function createApplicationSurface(surface: UiSurface): ApplicationSurface {
  return {
    readModel: createUiReadModel(surface),
    qr: createQrResult,
    report: toReportArtifact,
  };
}
