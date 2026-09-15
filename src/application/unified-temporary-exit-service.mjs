import { createTemporaryExitPlan, assertTemporaryExitStep } from './temporary-exit-vertical-slice.mjs';
import { createTemporaryExitTimeline, appendTemporaryExitTimeline } from './temporary-exit-timeline.mjs';
import { createTemporaryExitOperationalState, transitionTemporaryExitOperationalState } from './temporary-exit-operational-state.mjs';
import { assertTemporaryExitRepository } from './temporary-exit-repository-contract.mjs';
import { buildTemporaryExitReadModel } from './temporary-exit-read-model.mjs';

const stateForStep = Object.freeze({
  REQUEST: ['READY', 'EXIT_REQUESTED'],
  EXECUTE_EXIT: ['EXIT_REQUESTED', 'HANDOVER_RECORDED'],
  RETURN: ['HANDOVER_RECORDED', 'RETURN_RECORDED'],
  CLOSE: ['DUTY_COMPLETED', 'CLOSED'],
});

export function createUnifiedTemporaryExitService({ repository }) {
  assertTemporaryExitRepository(repository);
  return Object.freeze({
    request(input) { return applyStep('REQUEST', input); },
    executeExit(input) { return applyStep('EXECUTE_EXIT', input); },
    recordReturn(input) { return applyStep('RETURN', input); },
    completeDuty(input) { return completeDuty(input); },
    close(input) { return applyStep('CLOSE', input); },
    read(input) {
      const record = repository.getById(input.exitId);
      if (!record) throw new Error('TEMPORARY_EXIT_NOT_FOUND');
      return buildTemporaryExitReadModel(record);
    },
  });

  function applyStep(step, input) {
    if (!input?.exitId || !input?.actorId || !input?.scopeId) throw new Error('Temporary-exit command identity is required');
    return repository.transaction(() => {
      const existing = repository.getById(input.exitId);
      if (step === 'REQUEST') {
        if (existing) throw new Error('TEMPORARY_EXIT_ALREADY_EXISTS');
        const plan = createTemporaryExitPlan({ requestId: input.requestId ?? input.exitId, detaineeId: input.detaineeId, scopeId: input.scopeId, correlationId: input.correlationId ?? `CORR-${input.exitId}` });
        const timeline = appendTemporaryExitTimeline(createTemporaryExitTimeline({ exitId: input.exitId, scopeId: input.scopeId, correlationId: plan.correlationId }), { step, actorId: input.actorId });
        const operational = transitionTemporaryExitOperationalState(createTemporaryExitOperationalState(), 'EXIT_REQUESTED');
        const record = { plan, timeline, operationalState: operational.state };
        repository.create(input.exitId, record);
        return buildTemporaryExitReadModel(record);
      }
      if (!existing) throw new Error('TEMPORARY_EXIT_NOT_FOUND');
      const [from, to] = stateForStep[step];
      if (existing.operationalState !== from) throw new Error(`INVALID_OPERATIONAL_STATE:${existing.operationalState}->${to}`);
      const completed = existing.timeline.events.map((event) => event.step);
      assertTemporaryExitStep(existing.plan, step, completed);
      const operational = transitionTemporaryExitOperationalState(existing.operationalState, to);
      const timeline = appendTemporaryExitTimeline(existing.timeline, { step, actorId: input.actorId, metadata: { fromState: from, toState: to } });
      const record = { ...existing, timeline, operationalState: operational.state };
      repository.update(input.exitId, record);
      return buildTemporaryExitReadModel(record);
    });
  }

  function completeDuty(input) {
    if (!input?.exitId || !input?.actorId || !input?.scopeId) throw new Error('Temporary-exit command identity is required');
    return repository.transaction(() => {
      const existing = repository.getById(input.exitId);
      if (!existing) throw new Error('TEMPORARY_EXIT_NOT_FOUND');
      if (existing.operationalState !== 'RETURN_RECORDED') throw new Error(`INVALID_OPERATIONAL_STATE:${existing.operationalState}->DUTY_COMPLETED`);
      const operational = transitionTemporaryExitOperationalState(existing.operationalState, 'DUTY_COMPLETED');
      const timeline = appendTemporaryExitTimeline(existing.timeline, { step: 'DUTY_COMPLETED', actorId: input.actorId, metadata: { fromState: 'RETURN_RECORDED', toState: 'DUTY_COMPLETED' } });
      const record = { ...existing, timeline, operationalState: operational.state };
      repository.update(input.exitId, record);
      return buildTemporaryExitReadModel(record);
    });
  }
}
