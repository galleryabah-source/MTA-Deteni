import type { ControlledCertificationPackage } from "./p13-4841-4880-controlled-certification-package";
import { assertControlledCertificationPackage } from "./p13-4841-4880-controlled-certification-package";

export type FinalPreproductionGate = Readonly<{
  certificationPackage: ControlledCertificationPackage;
  sourceReviewed: boolean;
  securityReviewed: boolean;
  backupRestoreVerified: boolean;
  migrationPlanApproved: boolean;
  productionAuthorization: false;
}>;

export function assertFinalPreproductionGate(input: FinalPreproductionGate): void {
  assertControlledCertificationPackage(input.certificationPackage);
  if (!input.sourceReviewed || !input.securityReviewed || !input.backupRestoreVerified) throw new Error("FINAL_PREPRODUCTION_REVIEW_INCOMPLETE");
  if (!input.migrationPlanApproved) throw new Error("FINAL_PREPRODUCTION_MIGRATION_APPROVAL_REQUIRED");
  if (input.productionAuthorization) throw new Error("FINAL_PREPRODUCTION_PRODUCTION_BLOCKED");
}
