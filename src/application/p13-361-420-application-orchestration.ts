import type { ActorContext, DomainCommand, DomainResult } from "../domain/shared/contracts.js";
import type { AuthorizationPort, IdempotencyPort, TransactionPort } from "./ports.js";

export type OrchestrationRequest = Readonly<{
  actor: ActorContext;
  command: DomainCommand;
  fingerprint: string;
}>;

export type OrchestrationResult = Readonly<{
  result: DomainResult;
  correlationId: string;
  idempotent: boolean;
}>;

export type DomainCommandHandler = (command: DomainCommand) => Promise<DomainResult>;

export class ControlledApplicationOrchestrator {
  constructor(
    private readonly authorization: AuthorizationPort,
    private readonly idempotency: IdempotencyPort<DomainResult>,
    private readonly transaction: TransactionPort,
  ) {}

  async execute(request: OrchestrationRequest, handler: DomainCommandHandler): Promise<OrchestrationResult> {
    if (!request.actor.correlationId || request.actor.correlationId !== request.command.correlationId) {
      throw new Error("ORCHESTRATION_CORRELATION_MISMATCH");
    }

    const replay = await this.idempotency.replay(request.command.commandId);
    if (replay) return { result: replay, correlationId: request.command.correlationId, idempotent: true };

    const acquisition = await this.idempotency.begin(request.command.commandId, request.fingerprint);
    if (acquisition === "CONFLICT") throw new Error("ORCHESTRATION_IDEMPOTENCY_CONFLICT");
    if (acquisition === "REPLAY") {
      const result = await this.idempotency.replay(request.command.commandId);
      if (!result) throw new Error("ORCHESTRATION_REPLAY_RESULT_MISSING");
      return { result, correlationId: request.command.correlationId, idempotent: true };
    }

    const allowed = await this.authorization.authorize(request.actor, request.command.permission, request.command.aggregateId);
    if (!allowed) throw new Error("ORCHESTRATION_AUTHORIZATION_DENIED");

    const result = await this.transaction.run(() => handler(request.command));
    await this.idempotency.complete(request.command.commandId, result);
    return { result, correlationId: request.command.correlationId, idempotent: false };
  }
}
