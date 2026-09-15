import { assertTransition } from '../domain/deteni-lifecycle.mjs';
import { appendTemporaryExitTimeline } from './temporary-exit-timeline.mjs';
import { assertTemporaryExitStep } from './temporary-exit-vertical-slice.mjs';

export function executeTemporaryExitOperationalStep({ plan, timeline, detaineeState, step, actorId, now = new Date().toISOString() }) {
  const stateByStep = Object.freeze({ EXECUTE_EXIT: ['ESCORT_ASSIGNED', 'HANDOVER_RECORDED'], RETURN: ['HANDOVER_RECORDED', 'DUTY_COMPLETED'], CLOSE: ['DUTY_COMPLETED', 'DUTY_COMPLETED'] });
  if (!stateByStep[step]) throw new Error('Unsupported operational temporary-exit step');
  const [from, to] = stateByStep[step];
  if (detaineeState !== from) throw new Error(`INVALID_OPERATIONAL_STATE:${detaineeState}->${to}`);
  if (step !== 'CLOSE') assertTransition(from, to);
  const completed = timeline.events.map((event) => event.step);
  assertTemporaryExitStep(plan, step, completed);
  const nextTimeline = appendTemporaryExitTimeline(timeline, { step, actorId, occurredAt: now, metadata: { fromState: from, toState: to } });
  return Object.freeze({ state: to, timeline: nextTimeline });
}
