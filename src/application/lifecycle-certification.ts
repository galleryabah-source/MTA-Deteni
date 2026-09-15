import type { LifecycleEventEnvelope } from "./lifecycle-orchestration.js";

export type LifecycleStep = Readonly<{
  name: "REGISTRATION" | "PLACEMENT" | "MOVEMENT" | "TEMPORARY_EXIT" | "REPORTING";
  aggregateId: string;
  commandId: string;
  eventId: string;
  correlationId: string;
  beforeVersion: number;
  afterVersion: number;
  status: "COMMITTED" | "REPLAYED" | "COMPENSATED";
}>;

export type LifecycleCertification = Readonly<{
  journeyId: string;
  steps: readonly LifecycleStep[];
  auditCount: number;
  outboxCount: number;
  projectionVersion: number;
  certified: true;
  syntheticOnly: true;
}>;

export function assertLifecycleStep(step: LifecycleStep): void {
  for (const value of [step.name, step.aggregateId, step.commandId, step.eventId, step.correlationId]) if (!value.trim()) throw new Error("Lifecycle step identity is required.");
  if (!Number.isInteger(step.beforeVersion) || !Number.isInteger(step.afterVersion)) throw new Error("Lifecycle step version is invalid.");
  if (step.status === "COMMITTED" && step.afterVersion !== step.beforeVersion + 1) throw new Error("Committed lifecycle step must advance exactly one version.");
}

export function certifyLifecycleJourney(input: { journeyId: string; steps: readonly LifecycleStep[]; auditCount: number; outboxCount: number; projectionVersion: number }): LifecycleCertification {
  if (!input.journeyId.trim() || input.steps.length === 0) throw new Error("Lifecycle certification requires a journey and steps.");
  input.steps.forEach(assertLifecycleStep);
  const correlation = input.steps[0].correlationId;
  if (input.steps.some((step) => step.correlationId !== correlation)) throw new Error("Lifecycle correlation drift detected.");
  if (input.auditCount !== input.outboxCount) throw new Error("Audit/outbox cardinality mismatch.");
  const committed = input.steps.filter((step) => step.status === "COMMITTED");
  if (committed.length > 0 && input.projectionVersion !== committed[committed.length - 1].afterVersion) throw new Error("Reporting projection is stale.");
  return Object.freeze({ journeyId: input.journeyId, steps: Object.freeze([...input.steps]), auditCount: input.auditCount, outboxCount: input.outboxCount, projectionVersion: input.projectionVersion, certified: true, syntheticOnly: true });
}

export function assertLifecycleEventBinding<T>(event: LifecycleEventEnvelope<T>, commandId: string, correlationId: string, aggregateId: string): void {
  if (event.commandId !== commandId || event.correlationId !== correlationId || event.aggregateId !== aggregateId) throw new Error("Lifecycle event binding mismatch.");
}
