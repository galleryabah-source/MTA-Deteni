import type { ActorContext } from "../domain/shared/contracts.js";

export type OperatorSurfaceAction = Readonly<{
  actionId: string;
  actor: ActorContext;
  permission: string;
  aggregateId: string;
  detaineeId: string;
  correlationId: string;
}>;

export function validateOperatorSurfaceAction(action: OperatorSurfaceAction): void {
  if (!action.actionId.trim() || !action.aggregateId.trim() || !action.detaineeId.trim() || !action.correlationId.trim() || !action.permission.trim()) throw new Error("OPERATOR_SURFACE_IDENTITY_REQUIRED");
  if (action.actor.correlationId !== action.correlationId) throw new Error("OPERATOR_SURFACE_CORRELATION_MISMATCH");
}
