export type RepositoryEntity = Readonly<{ id: string; version: number }>;

export type RepositoryResult<T extends RepositoryEntity> = Readonly<{
  entity: T;
  source: "MEMORY";
}>;

export interface AggregateRepository<T extends RepositoryEntity> {
  get(id: string): RepositoryResult<T> | undefined;
  save(entity: T): RepositoryResult<T>;
  remove(id: string): void;
  list(): readonly RepositoryResult<T>[];
}

export type RepositoryNames = "DETAINEE" | "PLACEMENT" | "MOVEMENT" | "TEMPORARY_EXIT" | "REPORT" | "AUDIT";

export type RepositoryRegistry = Readonly<Record<RepositoryNames, AggregateRepository<RepositoryEntity>>>;

export function assertRepositoryEntity(entity: RepositoryEntity): void {
  if (!entity.id.trim()) throw new Error("Repository entity identity is required.");
  if (!Number.isInteger(entity.version) || entity.version < 0) throw new Error("Repository entity version is invalid.");
}

export function createMemoryRepository<T extends RepositoryEntity>(): AggregateRepository<T> {
  const records = new Map<string, T>();
  return {
    get: (id) => {
      const entity = records.get(id);
      return entity ? Object.freeze({ entity, source: "MEMORY" as const }) : undefined;
    },
    save: (entity) => {
      assertRepositoryEntity(entity);
      const previous = records.get(entity.id);
      if (previous && entity.version < previous.version) throw new Error("Repository version regression is not allowed.");
      const frozen = Object.freeze({ ...entity });
      records.set(entity.id, frozen);
      return Object.freeze({ entity: frozen, source: "MEMORY" as const });
    },
    remove: (id) => { records.delete(id); },
    list: () => Object.freeze([...records.values()].map((entity) => Object.freeze({ entity, source: "MEMORY" as const }))),
  };
}

export function createMemoryRepositoryRegistry(): RepositoryRegistry {
  return Object.freeze({
    DETAINEE: createMemoryRepository(),
    PLACEMENT: createMemoryRepository(),
    MOVEMENT: createMemoryRepository(),
    TEMPORARY_EXIT: createMemoryRepository(),
    REPORT: createMemoryRepository(),
    AUDIT: createMemoryRepository(),
  });
}
