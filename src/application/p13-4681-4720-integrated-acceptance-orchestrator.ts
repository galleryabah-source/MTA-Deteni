import { assertEvidenceAggregation, type EvidenceResult } from "./p13-4561-4600-evidence-aggregation";
import { assertReportRenderEvidence, type ReportRenderObservation } from "./p13-4601-4640-report-render-evidence";
import { assertFinalEvidenceIndex, type FinalEvidenceIndex } from "./p13-4641-4680-final-evidence-index";
import { assertSyntheticJourneyComplete, type SyntheticJourney } from "./p13-3481-3520-synthetic-journey-composition";

export type AcceptanceDomain = "APPLICATION" | "REPORTING" | "ROLE" | "CONTINUITY" | "RECOVERY";

export type AcceptanceControl = Readonly<{
  controlId: string;
  domain: AcceptanceDomain;
  evidenceId: string;
  outputIdentity: string;
  status: "PASS" | "FAIL" | "NOT_RUN";
}>;

export type IntegratedAcceptancePackage = Readonly<{
  packageId: string;
  controls: readonly AcceptanceControl[];
  syntheticOnly: true;
  productionAuthorized: false;
}>;

export type IntegratedAcceptanceInputs = Readonly<{
  package: IntegratedAcceptancePackage;
  evidence: readonly EvidenceResult[];
  reportRender: ReportRenderObservation;
  journey: SyntheticJourney;
  finalIndex: FinalEvidenceIndex;
}>;

export function assertIntegratedAcceptancePackage(input: IntegratedAcceptanceInputs): void {
  if (!input.package.packageId.trim() || input.package.controls.length === 0) throw new Error("INTEGRATED_ACCEPTANCE_PACKAGE_REQUIRED");
  if (!input.package.syntheticOnly || input.package.productionAuthorized) throw new Error("INTEGRATED_ACCEPTANCE_GOVERNANCE_BLOCKED");
  for (const control of input.package.controls) {
    if (!control.controlId.trim() || !control.evidenceId.trim() || !control.outputIdentity.trim()) throw new Error("INTEGRATED_ACCEPTANCE_CONTROL_IDENTITY_REQUIRED");
    if (control.status !== "PASS") throw new Error(`INTEGRATED_ACCEPTANCE_CONTROL_NOT_CERTIFIED:${control.controlId}`);
  }
  assertEvidenceAggregation(input.evidence);
  assertReportRenderEvidence(input.reportRender);
  assertSyntheticJourneyComplete(input.journey);
  assertFinalEvidenceIndex(input.finalIndex);
}
