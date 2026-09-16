export type VersionedAggregate = Readonly<{
  aggregateId: string;
  version: number;
}>;

export type ConcurrencyDecision = "ACCEPT" | "STALE_VERSION";

export function assertVersionedAggregate(input: VersionedAggregate): void {
  if (!input.aggregateId.trim()) throw new Error("Versioned aggregate identity is required.");
  if (!Number.isInteger(input.version) || input.version < 0) throw new Error("Aggregate version must be a non-negative integer.");
}

export function resolveOptimisticConcurrency(current: VersionedAggregate, expectedVersion: number): ConcurrencyDecision {
  assertVersionedAggregate(current);
  if (!Number.isInteger(expectedVersion) || expectedVersion < 0) throw new Error("Expected aggregate version must be a non-negative integer.");
  return current.version === expectedVersion ? "ACCEPT" : "STALE_VERSION";
}

export function nextAggregateVersion(input: VersionedAggregate): VersionedAggregate {
  assertVersionedAggregate(input);
  return Object.freeze({ ...input, version: input.version + 1 });
}

export function assertExpectedVersion(current: VersionedAggregate, expectedVersion: number): void {
  if (resolveOptimisticConcurrency(current, expectedVersion) !== "ACCEPT") {
    throw new Error("STALE_VERSION");
  }
}
