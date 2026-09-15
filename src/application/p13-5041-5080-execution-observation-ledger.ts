export type ObservationStatus = "PASS" | "FAIL" | "NOT_RUN";

export type ExecutionObservationLedgerEntry = Readonly<{
  observationId: string;
  planId: string;
  stage: string;
  controlId: string;
  evidenceId: string;
  startedAt: string;
  completedAt: string;
  exitCode: number;
  outputIdentity: string;
  status: ObservationStatus;
}>;

export function validateObservationEntry(entry: ExecutionObservationLedgerEntry): void {
  if (!entry.observationId.trim() || !entry.planId.trim() || !entry.stage.trim() || !entry.controlId.trim() || !entry.evidenceId.trim()) {
    throw new Error("EXECUTION_OBSERVATION_IDENTITY_REQUIRED");
  }
  if (!entry.startedAt.trim() || !entry.completedAt.trim() || !entry.outputIdentity.trim()) {
    throw new Error("EXECUTION_OBSERVATION_METADATA_REQUIRED");
  }
  if (Number.isNaN(Date.parse(entry.startedAt)) || Number.isNaN(Date.parse(entry.completedAt))) {
    throw new Error("EXECUTION_OBSERVATION_TIMESTAMP_INVALID");
  }
  if (Date.parse(entry.completedAt) < Date.parse(entry.startedAt)) {
    throw new Error("EXECUTION_OBSERVATION_TIME_ORDER_INVALID");
  }
  if (entry.status === "PASS" && entry.exitCode !== 0) {
    throw new Error("EXECUTION_OBSERVATION_PASS_EXIT_CODE_INVALID");
  }
}

export function assertObservationLedger(entries: readonly ExecutionObservationLedgerEntry[], expectedPlanId: string): void {
  if (!expectedPlanId.trim() || entries.length === 0) throw new Error("EXECUTION_OBSERVATION_LEDGER_REQUIRED");
  let previousCompletedAt = 0;
  for (const entry of entries) {
    validateObservationEntry(entry);
    if (entry.planId !== expectedPlanId) throw new Error("EXECUTION_OBSERVATION_PLAN_MISMATCH");
    const completedAt = Date.parse(entry.completedAt);
    if (completedAt < previousCompletedAt) throw new Error("EXECUTION_OBSERVATION_LEDGER_ORDER_INVALID");
    previousCompletedAt = completedAt;
  }
}
