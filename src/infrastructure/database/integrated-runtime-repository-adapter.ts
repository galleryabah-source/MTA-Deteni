export const INTEGRATED_RUNTIME_REPOSITORY_ADAPTER_VERSION = "P10.34-v1";

export interface RuntimeRepositoryContext {
  transactionId: string;
  requestId: string;
  correlationId: string;
  actorId: string;
  policyVersion: string;
}

export interface RuntimeRepository<TRecord> {
  getById(id: string, context: RuntimeRepositoryContext): Promise<TRecord | null>;
  insert(record: TRecord, context: RuntimeRepositoryContext): Promise<TRecord>;
  update(id: string, patch: Partial<TRecord>, context: RuntimeRepositoryContext): Promise<TRecord>;
}

export interface IntegratedRuntimeRepositories {
  detainee: RuntimeRepository<unknown>;
  placement: RuntimeRepository<unknown>;
  movement: RuntimeRepository<unknown>;
  leave: RuntimeRepository<unknown>;
  document: RuntimeRepository<unknown>;
}

export function validateRuntimeRepositoryContext(
  context: RuntimeRepositoryContext,
): boolean {
  return Object.values(context).every(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
}

export function createIntegratedRuntimeRepositories(
  repositories: IntegratedRuntimeRepositories,
  context: RuntimeRepositoryContext,
): IntegratedRuntimeRepositories {
  if (!validateRuntimeRepositoryContext(context)) {
    throw new Error("RUNTIME_REPOSITORY_CONTEXT_INVALID");
  }
  return repositories;
}
