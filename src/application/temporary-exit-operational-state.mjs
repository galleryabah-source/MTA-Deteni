const transitions = Object.freeze({
  READY: ['EXIT_REQUESTED'],
  EXIT_REQUESTED: ['HANDOVER_RECORDED'],
  HANDOVER_RECORDED: ['RETURN_RECORDED'],
  RETURN_RECORDED: ['DUTY_COMPLETED'],
  DUTY_COMPLETED: ['CLOSED'],
  CLOSED: [],
});

export function createTemporaryExitOperationalState(initial = 'READY') {
  if (!transitions[initial]) throw new Error(`INVALID_OPERATIONAL_STATE:${initial}`);
  return Object.freeze({ state: initial });
}

export function transitionTemporaryExitOperationalState(current, next) {
  if (!transitions[current]) throw new Error(`INVALID_OPERATIONAL_STATE:${current}`);
  if (!transitions[current].includes(next)) throw new Error(`INVALID_OPERATIONAL_TRANSITION:${current}->${next}`);
  return Object.freeze({ state: next });
}

export function allowedTemporaryExitOperationalTransitions(state) {
  if (!transitions[state]) throw new Error(`INVALID_OPERATIONAL_STATE:${state}`);
  return Object.freeze([...transitions[state]]);
}
