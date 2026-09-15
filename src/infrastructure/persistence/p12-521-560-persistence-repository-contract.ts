import type { AppendOnlyRepository, OutboxMessage, OutboxRepository, RepositoryResult, VersionedEntity, VersionedRepository } from "./contracts.js";

export type PersistenceOperationContext = Readonly<{
  transactionId: string;
  actorId: string;
  correlationId: string;
}>;

export type PersistenceRepositoryContract<T extends VersionedEntity & { id: string }> = Readonly<{
  get(id: string, context: PersistenceOperationContext): Promise<T | null>;
  insert(entity: T, context: PersistenceOperationContext): Promise<RepositoryResult>;
  update(entity: T, expectedVersion: number, context: PersistenceOperationContext): Promise<RepositoryResult>;
}>;

export type AppendOnlyPersistenceContract<T extends { id: string; aggregateId: string }> = Readonly<{
  append(event: T, context: PersistenceOperationContext): Promise<"APPENDED" | "DUPLICATE">;
  list(aggregateId: string, context: PersistenceOperationContext): Promise<readonly T[]>;
}>;

export type OutboxPersistenceContract = Readonly<{
  enqueue(message: OutboxMessage, context: PersistenceOperationContext): Promise<"ENQUEUED" | "DUPLICATE">;
  claim(consumerId: string, limit: number, context: PersistenceOperationContext): Promise<readonly OutboxMessage[]>;
  acknowledge(consumerId: string, id: string, context: PersistenceOperationContext): Promise<void>;
}>;

export function validatePersistenceOperationContext(context: PersistenceOperationContext): "READY" | "BLOCKED" {
  return context.transactionId.trim() && context.actorId.trim() && context.correlationId.trim() ? "READY" : "BLOCKED";
}

export function assertRepositoryCompatibility<T extends VersionedEntity & { id: string }>(repository: VersionedRepository<T>): PersistenceRepositoryContract<T> {
  return repository as PersistenceRepositoryContract<T>;
}

export function assertAppendOnlyCompatibility<T extends { id: string; aggregateId: string }>(repository: AppendOnlyRepository<T>): AppendOnlyPersistenceContract<T> {
  return repository as AppendOnlyPersistenceContract<T>;
}

export function assertOutboxCompatibility(repository: OutboxRepository): OutboxPersistenceContract {
  return repository as OutboxPersistenceContract;
}
