import type { DomainCommand, DomainResult } from "../domain/shared/contracts.js";
import type { AuthorizationPort, IdempotencyPort, TransactionPort } from "./ports.js";

export type OrchestrationRequest = Readonly<{
  commandId: string;
  permission: string;
  aggregateId: string;
  command: DomainCommand<unknown>;
  fingerprint: string;
}>;

export type OrchestrationResult = Readonly<{
  result: DomainResult<unknown>;
  correlationId: string;
  idempotent: boolean;
}>;

export type DomainCommandHandler = (command: DomainCommand<unknown>) => Promise<DomainResult<unknown>>;

export class ControlledApplicationOrchestrator {
  constructor(
    private readonly authorization: AuthorizationPort,
    private readonly idempotency: IdempotencyPort<DomainResult<unknown>>,
    private readonly transaction: TransactionPort,
  ) {}

  async execute(request: OrchestrationRequest, handler: DomainCommandHandler): Promise<OrchestrationResult> {
    if (!request.commandId.trim() || !request.permission.trim() || !request.aggregateId.trim() || !request.fingerprint.trim()) {
      throw new Error("ORCHESTRATION_IDENTITY_REQUIRED");
    }
    if (!request.command.actor.correlationId) throw new Error("ORCHESTRATION_CORRELATION_REQUIRED");

    const allowed = await this.authorization.authorize(request.command.actor, request.permission, request.aggregateId);
    if (!allowed) throw new Error("ORCHESTRATION_AUTHORIZATION_DENIED");

    const replay = await this.idempotency.replay(request.commandId);
    if (replay) return { result: replay, correlationId: request.command.actor.correlationId, idempotent: true };

    const acquisition = await this.idempotency.begin(request.commandId, request.fingerprint);
    if (acquisition === "CONFLICT") throw new Error("ORCHESTRATION_IDEMPOTENCY_CONFLICT");
    if (acquisition === "REPLAY") {
      const result = await this.idempotency.replay(request.commandId);
      if (!result) throw new Error("ORCHESTRATION_REPLAY_RESULT_MISSING");
      return { result, correlationId: request.command.actor.correlationId, idempotent: true };
    }

    const result = await this.transaction.run(() => handler(request.command));
    await this.idempotency.complete(request.commandId, result);
    return { result, correlationId: request.command.actor.correlationId, idempotent: false };
  }
}
