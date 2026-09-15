export type ExecutionObservation = Readonly<{
  executionId: string;
  controlId: string;
  startedAt: string;
  completedAt: string;
  exitCode: number;
  outputIdentity: string;
}>;

export type ObservedExecutionManifest = Readonly<{
  manifestId: string;
  environment: "NONPROD_SYNTHETIC";
  observations: readonly ExecutionObservation[];
  syntheticOnly: true;
  productionAuthorized: false;
}>;

export function assertObservedExecutionManifest(input: ObservedExecutionManifest): void {
  if (!input.manifestId.trim() || input.observations.length === 0) throw new Error("OBSERVED_EXECUTION_MANIFEST_REQUIRED");
  if (input.environment !== "NONPROD_SYNTHETIC" || !input.syntheticOnly || input.productionAuthorized) throw new Error("OBSERVED_EXECUTION_GOVERNANCE_BLOCKED");
  for (const observation of input.observations) {
    if (!observation.executionId.trim() || !observation.controlId.trim() || !observation.startedAt.trim() || !observation.completedAt.trim() || !observation.outputIdentity.trim()) throw new Error("OBSERVED_EXECUTION_IDENTITY_REQUIRED");
    if (observation.exitCode !== 0) throw new Error(`OBSERVED_EXECUTION_FAILED:${observation.controlId}`);
  }
}
