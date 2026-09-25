import type { DetaineeStatus, TemporaryExitState } from "../domain/shared/contracts.js";

export const STATE_MACHINE_CERTIFICATION_VERSION = "STATE-MACHINE-CERTIFICATION-v1";

export type StateMachineName = "DETAINEE" | "TEMPORARY_EXIT";

type TransitionMap<TState extends string> = Readonly<Record<TState, readonly TState[]>>;

export const DETAINEE_TRANSITIONS: TransitionMap<DetaineeStatus> = Object.freeze({
  ACTIVE: ["TRANSFERRED", "DEPARTED", "CLOSED"],
  TRANSFERRED: ["ACTIVE", "DEPARTED", "CLOSED"],
  DEPARTED: ["CLOSED"],
  CLOSED: [],
});

export const TEMPORARY_EXIT_TRANSITIONS: TransitionMap<TemporaryExitState> = Object.freeze({
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

export type StateTransitionAttempt<TState extends string> = Readonly<{
  from: TState;
  to: TState;
  allowed: boolean;
  outcome: "APPLIED" | "REJECTED";
  versionBefore: number;
  versionAfter: number;
  correlationId: string;
  mutationId: string;
  auditId?: string;
}>;

export type StateMachineCertification = Readonly<{
  version: typeof STATE_MACHINE_CERTIFICATION_VERSION;
  machine: StateMachineName;
  acceptedPath: readonly string[];
  terminalStates: readonly string[];
  rejectedAttempts: readonly string[];
  certified: true;
  syntheticOnly: true;
}>;

function assertIdentity(value: string, code: string): void {
  if (!value.trim()) throw new Error(code);
}

function canTransition<TState extends string>(map: TransitionMap<TState>, from: TState, to: TState): boolean {
  return map[from]?.includes(to) === true;
}

function assertAttempt<TState extends string>(attempt: StateTransitionAttempt<TState>, map: TransitionMap<TState>): void {
  assertIdentity(attempt.correlationId, "STATE_MACHINE_CORRELATION_REQUIRED");
  assertIdentity(attempt.mutationId, "STATE_MACHINE_MUTATION_ID_REQUIRED");
  assertIdentity(attempt.from, "STATE_MACHINE_FROM_REQUIRED");
  assertIdentity(attempt.to, "STATE_MACHINE_TO_REQUIRED");
  if (!Number.isInteger(attempt.versionBefore) || !Number.isInteger(attempt.versionAfter) || attempt.versionBefore < 0 || attempt.versionAfter < 0) {
    throw new Error("STATE_MACHINE_VERSION_INVALID");
  }
  const expectedAllowed = canTransition(map, attempt.from, attempt.to);
  if (attempt.allowed !== expectedAllowed) throw new Error("STATE_MACHINE_DECISION_DRIFT");
  if (attempt.outcome === "APPLIED" && (!expectedAllowed || attempt.versionAfter !== attempt.versionBefore + 1)) {
    throw new Error("STATE_MACHINE_APPLIED_TRANSITION_INVALID");
  }
  if (attempt.outcome === "REJECTED" && (expectedAllowed || attempt.versionAfter !== attempt.versionBefore)) {
    throw new Error("STATE_MACHINE_REJECTED_TRANSITION_INVALID");
  }
}

function assertNoDuplicateMutationIds<TState extends string>(attempts: readonly StateTransitionAttempt<TState>[]): void {
  const ids = new Set<string>();
  for (const attempt of attempts) {
    if (ids.has(attempt.mutationId)) throw new Error("STATE_MACHINE_DUPLICATE_MUTATION");
    ids.add(attempt.mutationId);
  }
}

function certify<TState extends string>(
  machine: StateMachineName,
  map: TransitionMap<TState>,
  path: readonly TState[],
  rejectedAttempts: readonly StateTransitionAttempt<TState>[],
  correlationId: string,
): StateMachineCertification {
  assertIdentity(correlationId, "STATE_MACHINE_CORRELATION_REQUIRED");
  if (path.length < 2) throw new Error("STATE_MACHINE_PATH_INCOMPLETE");
  for (let index = 0; index < path.length - 1; index += 1) {
    const from = path[index]!;
    const to = path[index + 1]!;
    if (!canTransition(map, from, to)) throw new Error("STATE_MACHINE_CANONICAL_PATH_INVALID");
  }
  rejectedAttempts.forEach((attempt) => {
    assertAttempt(attempt, map);
    if (attempt.correlationId !== correlationId) throw new Error("STATE_MACHINE_CORRELATION_DRIFT");
  });
  assertNoDuplicateMutationIds(rejectedAttempts);
  const terminal = path[path.length - 1]!;
  if ((map[terminal] ?? []).length !== 0) throw new Error("STATE_MACHINE_PATH_NOT_TERMINAL");
  return Object.freeze({
    version: STATE_MACHINE_CERTIFICATION_VERSION,
    machine,
    acceptedPath: Object.freeze([...path]),
    terminalStates: Object.freeze([terminal]),
    rejectedAttempts: Object.freeze(rejectedAttempts.map((attempt) => `${attempt.from}->${attempt.to}`)),
    certified: true,
    syntheticOnly: true,
  });
}

export function certifyDetaineeStateMachine(input: {
  correlationId: string;
  path: readonly DetaineeStatus[];
  rejectedAttempts: readonly StateTransitionAttempt<DetaineeStatus>[];
}): StateMachineCertification {
  return certify("DETAINEE", DETAINEE_TRANSITIONS, input.path, input.rejectedAttempts, input.correlationId);
}

export function certifyTemporaryExitStateMachine(input: {
  correlationId: string;
  path: readonly TemporaryExitState[];
  rejectedAttempts: readonly StateTransitionAttempt<TemporaryExitState>[];
}): StateMachineCertification {
  return certify("TEMPORARY_EXIT", TEMPORARY_EXIT_TRANSITIONS, input.path, input.rejectedAttempts, input.correlationId);
}

export function assertStateMutationAuditBinding<TState extends string>(input: {
  attempt: StateTransitionAttempt<TState>;
  auditCorrelationId: string;
  auditMutationId: string;
  auditFrom: TState;
  auditTo: TState;
}): void {
  if (
    input.attempt.correlationId !== input.auditCorrelationId ||
    input.attempt.mutationId !== input.auditMutationId ||
    input.attempt.from !== input.auditFrom ||
    input.attempt.to !== input.auditTo
  ) throw new Error("STATE_MACHINE_AUDIT_BINDING_DRIFT");
}
