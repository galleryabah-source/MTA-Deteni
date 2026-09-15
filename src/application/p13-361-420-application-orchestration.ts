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
    const existing = await this.idempotency.get(request.command.commandId);
    if (existing) return { result: existing, correlationId: request.command.correlationId, idempotent: true };

    await this.authorization.assertCanExecute(request.actor, request.command.permission);
    const result = await this.transaction.run(async () => handler(request.command));
    await this.idempotency.put(request.command.commandId, result, request.fingerprint);
    return { result, correlationId: request.command.correlationId, idempotent: false };
  }
}
