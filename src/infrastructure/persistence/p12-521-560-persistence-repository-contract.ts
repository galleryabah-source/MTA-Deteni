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
  release(consumerId: string, id: string, context: PersistenceOperationContext, error?: string, backoffSeconds?: number): Promise<void>;
}>;

export function validatePersistenceOperationContext(context: PersistenceOperationContext): "READY" | "BLOCKED" {
  return context.transactionId.trim() && context.actorId.trim() && context.correlationId.trim() ? "READY" : "BLOCKED";
}

export function assertRepositoryCompatibility<T extends VersionedEntity & { id: string }>(repository: VersionedRepository<T>): PersistenceRepositoryContract<T> {
  return {
    get: (id, context) => { if (validatePersistenceOperationContext(context) === "BLOCKED") return Promise.reject(new Error("PERSISTENCE_CONTEXT_INVALID")); return repository.get(id); },
    insert: (entity, context) => { if (validatePersistenceOperationContext(context) === "BLOCKED") return Promise.reject(new Error("PERSISTENCE_CONTEXT_INVALID")); return repository.insert(entity); },
    update: (entity, expectedVersion, context) => { if (validatePersistenceOperationContext(context) === "BLOCKED") return Promise.reject(new Error("PERSISTENCE_CONTEXT_INVALID")); return repository.update(entity, expectedVersion); }
  };
}

export function assertAppendOnlyCompatibility<T extends { id: string; aggregateId: string }>(repository: AppendOnlyRepository<T>): AppendOnlyPersistenceContract<T> {
  return {
    append: (event, context) => { if (validatePersistenceOperationContext(context) === "BLOCKED") return Promise.reject(new Error("PERSISTENCE_CONTEXT_INVALID")); return repository.append(event); },
    list: (aggregateId, context) => { if (validatePersistenceOperationContext(context) === "BLOCKED") return Promise.reject(new Error("PERSISTENCE_CONTEXT_INVALID")); return repository.list(aggregateId); }
  };
}

export function assertOutboxCompatibility(repository: OutboxRepository): OutboxPersistenceContract {
  return {
    enqueue: (message, context) => { if (validatePersistenceOperationContext(context) === "BLOCKED") return Promise.reject(new Error("PERSISTENCE_CONTEXT_INVALID")); return repository.enqueue(message); },
    claim: (consumerId, limit, context) => { if (!consumerId.trim() || validatePersistenceOperationContext(context) === "BLOCKED") return Promise.reject(new Error("PERSISTENCE_CONTEXT_INVALID")); return repository.claim(limit); },
    acknowledge: (consumerId, id, context) => { if (!consumerId.trim() || !id.trim() || validatePersistenceOperationContext(context) === "BLOCKED") return Promise.reject(new Error("PERSISTENCE_CONTEXT_INVALID")); return repository.acknowledge(id); },
    release: (consumerId, id, context, error, backoffSeconds) => { if (!consumerId.trim() || !id.trim() || validatePersistenceOperationContext(context) === "BLOCKED") return Promise.reject(new Error("PERSISTENCE_CONTEXT_INVALID")); return repository.release(id, error, backoffSeconds); }
  };
}
