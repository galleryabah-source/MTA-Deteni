import type { ActorContext, AuditEvent, TemporaryExitState } from "../domain/shared/contracts.js";
import type { TemporaryExit } from "../domain/temporary-exit/service.js";
import { MtaWorkflowService } from "./mta-workflow.js";
import { TransactionalMutationService, type MutationEnvelope, type OperationalOutbox } from "./p11-961-1024-transactional-mutation.js";

export type TemporaryExitCommand = Readonly<{
  exitId: string;
  detaineeId: string;
  departureAt: string;
  returnAt: string;
  targetState?: TemporaryExitState;
}>;

export type TemporaryExitCommandDeps = Readonly<{
  workflow: MtaWorkflowService;
  eventId: () => string;
  messageId: () => string;
  now: () => string;
  payloadHash: (value: Readonly<Record<string, unknown>>) => string;
}>;

/** Controlled adapter: commands reach the canonical domain workflow before evidence is emitted. */
export function createTemporaryExitCommandService(
  deps: TemporaryExitCommandDeps,
  infrastructure: Omit<ConstructorParameters<typeof TransactionalMutationService<TemporaryExit, TemporaryExitCommand>>[0], "mutate">,
): TransactionalMutationService<TemporaryExit, TemporaryExitCommand> {
  return new TransactionalMutationService<TemporaryExit, TemporaryExitCommand>({
    ...infrastructure,
    mutate: async (input, actor: ActorContext): Promise<MutationEnvelope<TemporaryExit>> => {
      const exit = input.targetState
        ? await deps.workflow.advanceTemporaryExit({ exitId: input.exitId, to: input.targetState, actor })
        : await deps.workflow.createTemporaryExitCase({ exitId: input.exitId, detaineeId: input.detaineeId, departureAt: input.departureAt, returnAt: input.returnAt, actor });
      const payload = { exitId: exit.id, detaineeId: exit.detaineeId, state: exit.state, version: exit.version } as const;
      const audit: AuditEvent = { eventId: deps.eventId(), eventType: `TEMPORARY_EXIT_${exit.state}`, aggregateType: "TEMPORARY_EXIT", aggregateId: exit.id, actorId: actor.actorId, correlationId: actor.correlationId, occurredAt: deps.now(), payloadHash: deps.payloadHash(payload) };
      const outbox: OperationalOutbox = { messageId: deps.messageId(), topic: "mta.temporary-exit.changed", aggregateId: exit.id, payload };
      return { value: exit, audit, outbox };
    },
  });
}
