import type { ActorContext, DomainResult } from "../domain/shared/contracts.js";
import { DomainError } from "../domain/shared/errors.js";

export type HttpMethod = "GET" | "POST" | "PATCH";

export type TransportRequest<TBody = unknown> = Readonly<{
  method: HttpMethod;
  route: string;
  actor: ActorContext;
  body?: TBody;
  idempotencyKey?: string;
  correlationId: string;
}>;

export type TransportResponse<T> = Readonly<{
  status: 200 | 201 | 400 | 401 | 403 | 404 | 409 | 422 | 500;
  body: DomainResult<T> | Readonly<{ code: string; message: string }>;
  correlationId: string;
}>;

export type RoutePolicy = Readonly<{
  method: HttpMethod;
  route: string;
  permission: string;
  mutation: boolean;
  idempotencyRequired: boolean;
  auditRequired: boolean;
}>;

export const MTA_ROUTE_POLICIES: readonly RoutePolicy[] = [
  { method: "GET", route: "/api/deteni", permission: "deteni.read", mutation: false, idempotencyRequired: false, auditRequired: false },
  { method: "GET", route: "/api/temporary-exit/:id", permission: "temporary_exit.read", mutation: false, idempotencyRequired: false, auditRequired: false },
  { method: "POST", route: "/api/temporary-exit", permission: "temporary_exit.request", mutation: true, idempotencyRequired: true, auditRequired: true },
  { method: "PATCH", route: "/api/temporary-exit/:id/state", permission: "temporary_exit.advance", mutation: true, idempotencyRequired: true, auditRequired: true },
  { method: "GET", route: "/api/headcount", permission: "headcount.read", mutation: false, idempotencyRequired: false, auditRequired: false },
  { method: "GET", route: "/api/reports/regu-jaga", permission: "report.read", mutation: false, idempotencyRequired: false, auditRequired: false },
];

export function assertMutationEnvelope(request: TransportRequest): void {
  if (request.method !== "GET" && !request.idempotencyKey) throw new DomainError("VALIDATION_FAILED", "IDEMPOTENCY_KEY_REQUIRED");
  if (!request.correlationId) throw new DomainError("VALIDATION_FAILED", "CORRELATION_ID_REQUIRED");
}
