export type DeploymentReadiness = Readonly<{
  sourceReviewed: boolean;
  testsObserved: boolean;
  nonprodCertified: boolean;
  securityReviewed: boolean;
  backupRestoreVerified: boolean;
  migrationPlanApproved: boolean;
  productionAuthorization: boolean;
}>;

export function assertDeploymentReadiness(input: DeploymentReadiness): void {
  if (!input.sourceReviewed || !input.testsObserved || !input.nonprodCertified || !input.securityReviewed || !input.backupRestoreVerified) throw new Error("DEPLOYMENT_READINESS_CONTROLS_INCOMPLETE");
  if (!input.migrationPlanApproved) throw new Error("DEPLOYMENT_MIGRATION_APPROVAL_REQUIRED");
  if (!input.productionAuthorization) throw new Error("DEPLOYMENT_PRODUCTION_AUTHORIZATION_REQUIRED");
}
