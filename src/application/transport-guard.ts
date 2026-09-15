import { DomainError } from "../domain/shared/errors.js";
import type { ActorContext } from "../domain/shared/contracts.js";
import { assertMutationEnvelope, MTA_ROUTE_POLICIES, type TransportRequest } from "./transport-contract.js";
import type { AuthorizationPort, AuditOutboxPort, IdempotencyPort } from "./ports.js";

export type GovernedTransportDeps = Readonly<{
  authorization: AuthorizationPort;
  audit: AuditOutboxPort;
  idempotency: IdempotencyPort<unknown>;
}>;

export async function authorizeTransport<TBody>(request: TransportRequest<TBody>, deps: GovernedTransportDeps): Promise<void> {
  assertMutationEnvelope(request);
  const policy = MTA_ROUTE_POLICIES.find((candidate) => candidate.method === request.method && candidate.route === request.route);
  if (!policy) throw new DomainError("VALIDATION_FAILED", "Route is outside the governed MTA transport contract.");
  if (!(await deps.authorization.authorize(request.actor, policy.permission, request.route))) {
    throw new DomainError("FORBIDDEN_SCOPE", "Transport authorization denied.");
  }
  if (policy.mutation) {
    if (!request.idempotencyKey) throw new DomainError("VALIDATION_FAILED", "Mutation requires idempotency key.");
    const fingerprint = `${request.method}:${request.route}:${request.idempotencyKey}`;
    const result = await deps.idempotency.begin(request.idempotencyKey, fingerprint);
    if (result === "REPLAY") throw new DomainError("IDEMPOTENCY_REPLAY", "Mutation has already been processed.");
    if (result === "CONFLICT") throw new DomainError("CONFLICT", "Idempotency key conflicts with another mutation.");
  }
}

export async function completeMutation<T>(request: TransportRequest, result: T, deps: GovernedTransportDeps): Promise<void> {
  if (!request.idempotencyKey) throw new DomainError("VALIDATION_FAILED", "Mutation requires idempotency key.");
  await deps.idempotency.complete(request.idempotencyKey, result);
  await deps.audit.enqueue("mta.mutation.completed", request.route, { correlationId: request.correlationId });
}

export function assertActorContext(actor: ActorContext): void {
  if (!actor.actorId.trim() || !actor.role.trim() || !actor.correlationId.trim()) throw new DomainError("UNAUTHORIZED", "Actor context is incomplete.");
}
