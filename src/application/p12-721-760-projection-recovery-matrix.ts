export type ProjectionFailureClass = "TRANSIENT" | "PERMANENT" | "IDENTITY_DRIFT" | "CHECKPOINT_DRIFT";

export type ProjectionRecoveryDecision = Readonly<{
  failure: ProjectionFailureClass;
  action: "RETRY" | "QUARANTINE" | "REBUILD_FROM_EVIDENCE" | "HALT";
}>;

export const PROJECTION_RECOVERY_MATRIX: readonly ProjectionRecoveryDecision[] = [
  { failure: "TRANSIENT", action: "RETRY" },
  { failure: "PERMANENT", action: "QUARANTINE" },
  { failure: "IDENTITY_DRIFT", action: "HALT" },
  { failure: "CHECKPOINT_DRIFT", action: "REBUILD_FROM_EVIDENCE" },
] as const;

export function recoveryDecision(failure: ProjectionFailureClass): ProjectionRecoveryDecision {
  const decision = PROJECTION_RECOVERY_MATRIX.find((item) => item.failure === failure);
  if (!decision) throw new Error("PROJECTION_RECOVERY_UNDEFINED");
  return decision;
}
