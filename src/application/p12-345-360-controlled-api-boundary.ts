import type { ActorContext } from "../domain/shared/contracts.js";
import type { OperatorCommandSurface } from "./p11-1025-1088-operator-command-surface.js";

export type ApiCommandRequest<TPayload> = Readonly<{
  commandId: string;
  permission: string;
  fingerprint: string;
  payload: TPayload;
  actor: ActorContext;
}>;

export type ApiCommandResponse<TResult> = Readonly<{
  ok: true;
  commandId: string;
  correlationId: string;
  aggregateId: string;
  result: TResult;
}>;

export type ApiErrorResponse = Readonly<{
  ok: false;
  code: "INVALID_REQUEST" | "FORBIDDEN" | "CONFLICT" | "INTERNAL_ERROR";
}>;

export async function executeControlledCommand<TPayload, TResult>(surface: OperatorCommandSurface<TPayload, TResult>, request: ApiCommandRequest<TPayload>): Promise<ApiCommandResponse<TResult> | ApiErrorResponse> {
  if (!request.commandId.trim() || !request.permission.trim() || !request.fingerprint.trim() || !request.actor.actorId.trim() || !request.actor.correlationId.trim() || !request.actor.idempotencyKey?.trim()) return { ok: false, code: "INVALID_REQUEST" };
  try {
    const response = await surface.execute({ commandId: request.commandId, permission: request.permission, fingerprint: request.fingerprint, payload: request.payload, actor: request.actor });
    return { ok: true, commandId: response.commandId, correlationId: response.correlationId, aggregateId: response.aggregateId, result: response.result.result };
  } catch (error) {
    const code = error instanceof Error ? error.message : "INTERNAL_ERROR";
    if (code === "FORBIDDEN") return { ok: false, code: "FORBIDDEN" };
    if (code === "IDEMPOTENCY_CONFLICT" || code === "CONFLICT") return { ok: false, code: "CONFLICT" };
    if (code.endsWith("_REQUIRED")) return { ok: false, code: "INVALID_REQUEST" };
    return { ok: false, code: "INTERNAL_ERROR" };
  }
}
