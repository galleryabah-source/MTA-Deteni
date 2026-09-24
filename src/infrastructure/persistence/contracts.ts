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

export type OutboxMessage = Readonly<{
  id: string;
  topic: string;
  aggregateId: string;
  payload: Readonly<Record<string, unknown>>;
  createdAt: string;
}>;

/**
 * Canonical repository-level outbox lifecycle.
 * Production maps these operations to the existing Supabase/PostgreSQL
 * outbox RPCs; in-memory implementations remain test-only.
 */
export type OutboxRepository = {
  enqueue(message: OutboxMessage): Promise<"ENQUEUED" | "DUPLICATE">;
  claim(limit: number): Promise<readonly OutboxMessage[]>;
  acknowledge(id: string): Promise<void>;
  release(id: string, error?: string, backoffSeconds?: number): Promise<void>;
};
