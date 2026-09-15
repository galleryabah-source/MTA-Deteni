export type ExecutionEnvironment = "CONTROLLED_NONPROD";

export type ExecutionEnvironmentBoundary = Readonly<{
  environment: ExecutionEnvironment;
  syntheticOnly: true;
  productionAuthorized: false;
  migrationFreeze: true;
  aiEnabled: false;
  liveDatabaseApproved: false;
  networkMode: "LOCAL_OR_ISOLATED_LAN";
  externalIntegrationsEnabled: false;
}>;

export function assertExecutionEnvironmentBoundary(input: ExecutionEnvironmentBoundary): void {
  if (input.environment !== "CONTROLLED_NONPROD") throw new Error("EXECUTION_ENVIRONMENT_INVALID");
  if (!input.syntheticOnly || input.productionAuthorized || !input.migrationFreeze || input.aiEnabled || input.liveDatabaseApproved) {
    throw new Error("EXECUTION_ENVIRONMENT_GOVERNANCE_BLOCKED");
  }
  if (input.networkMode !== "LOCAL_OR_ISOLATED_LAN" || input.externalIntegrationsEnabled) {
    throw new Error("EXECUTION_ENVIRONMENT_EXTERNAL_ACCESS_BLOCKED");
  }
}

export function assertNoProductionExecution(input: ExecutionEnvironmentBoundary): void {
  assertExecutionEnvironmentBoundary(input);
  if (input.productionAuthorized) throw new Error("PRODUCTION_EXECUTION_FORBIDDEN");
}
