import type { ActorContext, AuditEvent } from "../domain/shared/contracts.js";
import type { AuthorizationPort, IdempotencyPort, TransactionPort } from "./ports.js";

export type OperationalOutbox = Readonly<{
  messageId: string;
  topic: string;
  aggregateId: string;
  payload: Readonly<Record<string, unknown>>;
}>;

export type MutationEnvelope<T> = Readonly<{
  value: T;
  audit: AuditEvent;
  outbox: OperationalOutbox;
}>;

export type TransactionalMutationDeps<T, TInput> = Readonly<{
  authorization: AuthorizationPort;
  idempotency: IdempotencyPort<MutationEnvelope<T>>;
  transaction: TransactionPort;
  persistAudit: (event: AuditEvent) => Promise<void>;
  persistOutbox: (message: OperationalOutbox) => Promise<void>;
  mutate: (input: TInput, actor: ActorContext) => Promise<MutationEnvelope<T>>;
}>;

export type MutationCommand<TInput> = Readonly<{
  actor: ActorContext;
  permission: string;
  fingerprint: string;
  input: TInput;
}>;

export class TransactionalMutationService<T, TInput = void> {
  constructor(private readonly deps: TransactionalMutationDeps<T, TInput>) {}

  async execute(command: MutationCommand<TInput>): Promise<MutationEnvelope<T>> {
    if (!command.actor.actorId.trim() || !command.actor.correlationId.trim()) throw new Error("ACTOR_CONTEXT_REQUIRED");
    if (!command.actor.idempotencyKey?.trim()) throw new Error("IDEMPOTENCY_KEY_REQUIRED");
    if (!command.fingerprint.trim()) throw new Error("MUTATION_FINGERPRINT_REQUIRED");
    if (!(await this.deps.authorization.authorize(command.actor, command.permission))) throw new Error("FORBIDDEN");

    const key = command.actor.idempotencyKey;
    return this.deps.transaction.run(async () => {
      // The idempotency decision is made inside the same transaction as the mutation.
      const decision = await this.deps.idempotency.begin(key, command.fingerprint);
      if (decision === "CONFLICT") throw new Error("IDEMPOTENCY_CONFLICT");
      if (decision === "REPLAY") {
        const existing = await this.deps.idempotency.replay(key);
        if (!existing) throw new Error("IDEMPOTENCY_REPLAY_MISSING");
        return existing;
      }

      const envelope = await this.deps.mutate(command.input, command.actor);
      if (envelope.audit.actorId !== command.actor.actorId) throw new Error("AUDIT_ACTOR_MISMATCH");
      if (envelope.audit.correlationId !== command.actor.correlationId) throw new Error("AUDIT_CORRELATION_MISMATCH");
      if (envelope.outbox.aggregateId !== envelope.audit.aggregateId) throw new Error("OUTBOX_AGGREGATE_MISMATCH");

      // Production adapters MUST bind mutation, audit, outbox and idempotency completion to one transaction.
      await this.deps.persistAudit(envelope.audit);
      await this.deps.persistOutbox(envelope.outbox);
      await this.deps.idempotency.complete(key, envelope);
      return envelope;
    });
  }
}
