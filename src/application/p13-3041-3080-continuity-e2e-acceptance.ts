export type ContinuityAcceptanceStep =
  | "CLIENT_PAIRED"
  | "SESSION_ACTIVE"
  | "OFFLINE_READ_ONLY"
  | "QUEUE_RECORDED"
  | "REPLAY_ORDERED"
  | "INTEGRITY_VERIFIED"
  | "CONFLICT_REVIEWED"
  | "DEVICE_REVOKED"
  | "RECOVERY_VERIFIED"
  | "HUMAN_SIGNOFF";

export type ContinuityAcceptance = Readonly<{
  acceptanceId: string;
  steps: readonly ContinuityAcceptanceStep[];
  syntheticOnly: true;
  productionAuthorized: false;
}>;

const REQUIRED: readonly ContinuityAcceptanceStep[] = [
  "CLIENT_PAIRED", "SESSION_ACTIVE", "OFFLINE_READ_ONLY", "QUEUE_RECORDED", "REPLAY_ORDERED",
  "INTEGRITY_VERIFIED", "CONFLICT_REVIEWED", "DEVICE_REVOKED", "RECOVERY_VERIFIED", "HUMAN_SIGNOFF",
];

export function validateContinuityAcceptance(input: ContinuityAcceptance): void {
  if (!input.acceptanceId.trim()) throw new Error("CONTINUITY_ACCEPTANCE_ID_REQUIRED");
  if (!input.syntheticOnly || input.productionAuthorized) throw new Error("CONTINUITY_ACCEPTANCE_GOVERNANCE_BLOCKED");
  for (const step of REQUIRED) if (!input.steps.includes(step)) throw new Error(`CONTINUITY_ACCEPTANCE_STEP_MISSING:${step}`);
}

export function assertContinuityAcceptanceReady(input: ContinuityAcceptance): void {
  validateContinuityAcceptance(input);
}
