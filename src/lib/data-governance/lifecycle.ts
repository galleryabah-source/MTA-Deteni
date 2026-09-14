import type { LifecycleState } from "./types";

const transitions: Record<LifecycleState, readonly LifecycleState[]> = {
  ACTIVE: ["ARCHIVED", "RETENTION_HOLD"],
  ARCHIVED: ["ACTIVE", "RETENTION_HOLD", "RETAINED"],
  RETENTION_HOLD: ["ACTIVE", "ARCHIVED", "RETAINED"],
  RETAINED: ["ELIGIBLE_FOR_PURGE"],
  ELIGIBLE_FOR_PURGE: [],
};

export const canTransitionLifecycle = (
  from: LifecycleState,
  to: LifecycleState,
): boolean => transitions[from].includes(to);

export const assertLifecycleTransition = (
  from: LifecycleState,
  to: LifecycleState,
): void => {
  if (!canTransitionLifecycle(from, to)) {
    throw new Error(`INVALID_LIFECYCLE_TRANSITION:${from}->${to}`);
  }
};
