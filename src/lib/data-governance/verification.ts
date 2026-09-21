import type { VerificationState } from "./types";

const transitions: Record<VerificationState, readonly VerificationState[]> = {
  DRAFT: ["PENDING_VERIFICATION", "REJECTED"],
  PENDING_VERIFICATION: ["VERIFIED", "REJECTED"],
  VERIFIED: ["SUPERSEDED"],
  REJECTED: ["DRAFT"],
  SUPERSEDED: [],
};

export const canTransitionVerification = (
  from: VerificationState,
  to: VerificationState,
): boolean => transitions[from].includes(to);

export const assertVerificationTransition = (
  from: VerificationState,
  to: VerificationState,
): void => {
  if (!canTransitionVerification(from, to)) {
    throw new Error(`INVALID_VERIFICATION_TRANSITION:${from}->${to}`);
  }
};
