import type { OutboxEventContract } from "../../application/outbox-runtime-contract.js";

export type VersionedEntity = Readonly<{ version: number }>;
export type RepositoryResult = "CREATED" | "UPDATED" | "CONFLICT";

export type VersionedRepository<T extends VersionedEntity> = {
  get(id: string): Promise<T | null>;
  insert(entity: T): Promise<RepositoryResult>;
  update(entity: T, expectedVersion: number): Promise<RepositoryResult>;
};

export type AppendOnlyRepository<T> = {
  append(event: T): Promise<"APPENDED" | "DUPLICATE">;
  list(aggregateId: string): Promise<readonly T[]>;
};

export type OutboxRepository = {
  enqueue(event: OutboxEventContract): Promise<"ENQUEUED" | "DUPLICATE">;
  claim(limit: number): Promise<readonly OutboxEventContract[]>;
  acknowledge(eventId: string): Promise<void>;
};
