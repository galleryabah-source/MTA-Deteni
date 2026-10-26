export const REPOSITORY_CONTRACT_VERSION = "P9.17-v1";

export interface RepositoryIdentity {
  resourceType: string;
  resourceId: string;
}

export interface DomainRepository<TRecord, TCreate, TUpdate> {
  getById(identity: RepositoryIdentity): Promise<TRecord | null>;
  insert(input: TCreate): Promise<TRecord>;
  update(identity: RepositoryIdentity, input: TUpdate): Promise<TRecord>;
}

export interface RepositoryMutationContext {
  transactionId: string;
  requestId: string;
  correlationId: string;
  actorId: string;
  policyVersion: string;
}

export function validateRepositoryMutationContext(
  context: RepositoryMutationContext,
): boolean {
  return Boolean(
    context.transactionId &&
    context.requestId &&
    context.correlationId &&
    context.actorId &&
    context.policyVersion
  );
}
