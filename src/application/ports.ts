import type { ActorContext, AuditEvent } from "../domain/shared/contracts.js";

export type MutationGuard = Readonly<{
  correlationId: string;
  idempotencyKey: string;
  actor: ActorContext;
}>;

export type IdempotencyPort<T> = {
  replay(key: string): Promise<T | null>;
  begin(key: string, fingerprint: string): Promise<"ACQUIRED" | "REPLAY" | "CONFLICT">;
  complete(key: string, result: T): Promise<void>;
};

export type AuditOutboxPort = {
  append(event: AuditEvent): Promise<void>;
  enqueue(topic: string, aggregateId: string, payload: Readonly<Record<string, unknown>>): Promise<void>;
};

export type AuthorizationPort = {
  authorize(actor: ActorContext, permission: string, resource?: string): Promise<boolean>;
};

export type TransactionPort = {
  run<T>(work: () => Promise<T>): Promise<T>;
};
