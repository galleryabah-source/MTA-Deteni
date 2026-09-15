export type RecoveryAction = "RETRY_READ" | "RETRY_MUTATION" | "SAVE_DRAFT" | "CONTACT_OPERATOR" | "STOP";

export type OperatorRecoveryDecision = Readonly<{
  action: RecoveryAction;
  retryable: boolean;
  preservesEvidence: true;
}>;

export function decideOperatorRecovery(errorCode: string, mutation: boolean): OperatorRecoveryDecision {
  if (!errorCode.trim()) throw new Error("RECOVERY_ERROR_CODE_REQUIRED");
  if (errorCode === "NETWORK_UNAVAILABLE") return { action: mutation ? "SAVE_DRAFT" : "RETRY_READ", retryable: !mutation, preservesEvidence: true };
  if (errorCode === "CONFLICT") return { action: "CONTACT_OPERATOR", retryable: false, preservesEvidence: true };
  return { action: "STOP", retryable: false, preservesEvidence: true };
}
