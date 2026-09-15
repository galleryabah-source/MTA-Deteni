import type { ActorContext } from "../domain/shared/contracts.js";
import { TransactionalMutationService, type MutationEnvelope } from "./p11-961-1024-transactional-mutation.js";
import type { OperatorDashboardReadModel } from "./read-model.js";

export type OperatorCommand<TPayload> = Readonly<{
  commandId: string;
  permission: string;
  fingerprint: string;
  payload: TPayload;
  actor: ActorContext;
}>;

export type OperatorCommandResult<T> = Readonly<{
  commandId: string;
  correlationId: string;
  aggregateId: string;
  result: MutationEnvelope<T>;
}>;

export type OperatorReadPort = Readonly<{
  dashboard(actor: ActorContext): Promise<OperatorDashboardReadModel>;
}>;

export class OperatorCommandSurface<TPayload, TResult> {
  constructor(
    private readonly mutation: TransactionalMutationService<TResult, TPayload>,
    private readonly reads: OperatorReadPort,
  ) {}

  async execute(command: OperatorCommand<TPayload>): Promise<OperatorCommandResult<TResult>> {
    if (!command.commandId.trim()) throw new Error("COMMAND_ID_REQUIRED");
    const result = await this.mutation.execute({
      actor: command.actor,
      permission: command.permission,
      fingerprint: command.fingerprint,
      input: command.payload,
    });
    return { commandId: command.commandId, correlationId: command.actor.correlationId, aggregateId: result.audit.aggregateId, result };
  }

  async dashboard(actor: ActorContext): Promise<OperatorDashboardReadModel> {
    return this.reads.dashboard(actor);
  }
}
