import type { FinalEvidenceIndex } from "./p13-4641-4680-final-evidence-index";
import { assertFinalEvidenceIndex } from "./p13-4641-4680-final-evidence-index";

export type ControlledCertificationPackage = Readonly<{
  certificationId: string;
  target: "CONTROLLED_NONPROD";
  finalEvidenceIndex: FinalEvidenceIndex;
  observedExecutionComplete: boolean;
  reportAcceptanceComplete: boolean;
  lanAcceptanceComplete: boolean;
  roleJourneyAcceptanceComplete: boolean;
  recoveryAcceptanceComplete: boolean;
  migrationFreeze: true;
  aiEnabled: false;
  productionAuthorized: false;
  liveDatabaseApproved: false;
}>;

export function assertControlledCertificationPackage(input: ControlledCertificationPackage): void {
  if (!input.certificationId.trim()) throw new Error("CONTROLLED_CERTIFICATION_ID_REQUIRED");
  if (input.target !== "CONTROLLED_NONPROD" || !input.migrationFreeze || input.aiEnabled || input.productionAuthorized || input.liveDatabaseApproved) throw new Error("CONTROLLED_CERTIFICATION_GOVERNANCE_BLOCKED");
  assertFinalEvidenceIndex(input.finalEvidenceIndex);
  if (!input.observedExecutionComplete || !input.reportAcceptanceComplete || !input.lanAcceptanceComplete || !input.roleJourneyAcceptanceComplete || !input.recoveryAcceptanceComplete) throw new Error("CONTROLLED_CERTIFICATION_EVIDENCE_INCOMPLETE");
}
