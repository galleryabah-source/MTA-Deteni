import { createUiReadModel, type UiReadModel, type UiSurface } from "./ui-surface.js";
import { createQrResult, type QrScanContext, type QrScanOutcome, type QrVerificationResult } from "./qr-scan-result.js";
import { toReportArtifact, type ReportArtifact, type ReportSnapshot } from "./report-artifact.js";
import { assertNavigationAllowed, navigationForRole, RESPONSIVE_INVARIANTS, type ApplicationRole, type DeviceClass, type NavigationSurface, type ResponsiveInvariant } from "./runtime-surface.js";

export type ApplicationSurface = Readonly<{
  readModel: UiReadModel;
  qr: (context: QrScanContext, outcome: QrScanOutcome, detaineeId?: string) => QrVerificationResult;
  report: (snapshot: ReportSnapshot) => ReportArtifact;
  navigation: (role: string) => readonly NavigationSurface[];
  responsive: (device: DeviceClass) => ResponsiveInvariant;
  assertNavigation: (role: string, surface: NavigationSurface) => void;
}>;

export function createApplicationSurface(surface: UiSurface): ApplicationSurface {
  return {
    readModel: createUiReadModel(surface),
    qr: createQrResult,
    report: toReportArtifact,
    navigation: (role: string) => navigationForRole(role),
    responsive: (device: DeviceClass) => RESPONSIVE_INVARIANTS[device],
    assertNavigation: (role: string, target: NavigationSurface) => assertNavigationAllowed(role, target),
  };
}

export type { ApplicationRole };
