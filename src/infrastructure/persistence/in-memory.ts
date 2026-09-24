import type { AppendOnlyRepository, OutboxMessage, OutboxRepository, RepositoryResult, VersionedEntity, VersionedRepository } from "./contracts.js";

/** Test/offline-only repositories. Never use as production persistence. */
export class InMemoryVersionedRepository<T extends VersionedEntity & { id: string }> implements VersionedRepository<T> {
  private readonly items = new Map<string, T>();
  async get(id: string): Promise<T | null> { return this.items.get(id) ?? null; }
  async insert(entity: T): Promise<RepositoryResult> {
    if (this.items.has(entity.id)) return "CONFLICT";
    this.items.set(entity.id, entity);
    return "CREATED";
  }
  async update(entity: T, expectedVersion: number): Promise<RepositoryResult> {
    const current = this.items.get(entity.id);
    if (!current || current.version !== expectedVersion) return "CONFLICT";
    this.items.set(entity.id, entity);
    return "UPDATED";
  }
}

export class InMemoryAppendOnlyRepository<T extends { id: string; aggregateId: string }> implements AppendOnlyRepository<T> {
  private readonly events: T[] = [];
  async append(event: T): Promise<"APPENDED" | "DUPLICATE"> {
    if (this.events.some((existing) => existing.id === event.id)) return "DUPLICATE";
    this.events.push(event);
    return "APPENDED";
  }
  async list(aggregateId: string): Promise<readonly T[]> { return this.events.filter((event) => event.aggregateId === aggregateId); }
}

export class InMemoryOutboxRepository implements OutboxRepository {
  private readonly pending = new Map<string, OutboxMessage>();
  async enqueue(message: OutboxMessage): Promise<"ENQUEUED" | "DUPLICATE"> {
    if (this.pending.has(message.id)) return "DUPLICATE";
    this.pending.set(message.id, message);
    return "ENQUEUED";
  }
  async claim(limit: number): Promise<readonly OutboxMessage[]> { return [...this.pending.values()].slice(0, Math.max(0, limit)); }
  async acknowledge(id: string): Promise<void> { this.pending.delete(id); }
  async release(id: string): Promise<void> {
    if (!this.pending.has(id)) return;
    // In-memory messages remain pending; production release performs DB backoff.
  }
}
