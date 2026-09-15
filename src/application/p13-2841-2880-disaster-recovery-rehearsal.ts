export type RecoveryStep = "BACKUP_SELECTED" | "RESTORE_VERIFIED" | "INTEGRITY_VERIFIED" | "JOURNAL_REPLAYED" | "READ_MODEL_REBUILT" | "HUMAN_SIGNOFF";

export type DisasterRecoveryRehearsal = Readonly<{
  rehearsalId: string;
  steps: readonly RecoveryStep[];
  syntheticOnly: true;
  productionAuthorized: false;
}>;

const REQUIRED: readonly RecoveryStep[] = ["BACKUP_SELECTED", "RESTORE_VERIFIED", "INTEGRITY_VERIFIED", "JOURNAL_REPLAYED", "READ_MODEL_REBUILT", "HUMAN_SIGNOFF"];

export function validateDisasterRecoveryRehearsal(rehearsal: DisasterRecoveryRehearsal): void {
  if (!rehearsal.rehearsalId.trim()) throw new Error("DR_REHEARSAL_ID_REQUIRED");
  if (!rehearsal.syntheticOnly || rehearsal.productionAuthorized !== false) throw new Error("DR_REHEARSAL_GOVERNANCE_INVALID");
  for (const step of REQUIRED) if (!rehearsal.steps.includes(step)) throw new Error("DR_REHEARSAL_STEP_MISSING");
}

export function assertDisasterRecoveryReady(rehearsal: DisasterRecoveryRehearsal): void {
  validateDisasterRecoveryRehearsal(rehearsal);
  if (rehearsal.steps.length < REQUIRED.length) throw new Error("DR_REHEARSAL_INCOMPLETE");
}
