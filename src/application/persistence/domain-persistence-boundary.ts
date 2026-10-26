export const DOMAIN_PERSISTENCE_BOUNDARY_VERSION = "P10.24-v1";

export interface MutationContext {
  transactionId: string;
  requestId: string;
  correlationId: string;
  actorId: string;
  policyVersion: string;
}

export interface DomainMutation<TCommand, TResult> {
  command: TCommand;
  execute(context: MutationContext): Promise<TResult>;
}

export interface DomainRepository<TRecord> {
  getById(id: string): Promise<TRecord | null>;
  insert(record: TRecord, context: MutationContext): Promise<TRecord>;
  update(id: string, record: Partial<TRecord>, context: MutationContext): Promise<TRecord>;
}

export interface PersistenceBoundary {
  runInTransaction<T>(operation: (context: MutationContext) => Promise<T>): Promise<T>;
}

export function validateMutationContext(context: MutationContext): void {
  const required = [
    ["transactionId", context.transactionId],
    ["requestId", context.requestId],
    ["correlationId", context.correlationId],
    ["actorId", context.actorId],
    ["policyVersion", context.policyVersion],
  ] as const;

  for (const [name, value] of required) {
    if (typeof value !== "string" || !value.trim()) {
      throw new Error("MUTATION_CONTEXT_" + name.toUpperCase() + "_REQUIRED");
    }
  }
}
