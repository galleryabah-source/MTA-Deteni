export const TEMPORARY_EXIT_TRANSITIONS = Object.freeze({
  REQUESTED: ["VALIDATED"],
  VALIDATED: ["APPROVED"],
  APPROVED: ["DOCUMENTED"],
  DOCUMENTED: ["ESCORT_ASSIGNED"],
  ESCORT_ASSIGNED: ["DEPARTED"],
  DEPARTED: ["RETURN_PENDING"],
  RETURN_PENDING: ["RETURNED"],
  RETURNED: ["COMPLETED"],
  COMPLETED: [],
});

export function canTransition(from, to) {
  return TEMPORARY_EXIT_TRANSITIONS[from]?.includes(to) === true;
}

export function transition(from, to) {
  if (!canTransition(from, to)) {
    return { ok: false, code: "INVALID_STATE", from, to };
  }
  return { ok: true, state: to };
}
