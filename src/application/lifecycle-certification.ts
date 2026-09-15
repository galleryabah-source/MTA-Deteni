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

const EXPECTED_LIFECYCLE_ORDER: readonly LifecycleStep["name"][] = ["REGISTRATION", "PLACEMENT", "MOVEMENT", "TEMPORARY_EXIT", "REPORTING"];

export function assertLifecycleStep(step: LifecycleStep): void {
  for (const value of [step.name, step.aggregateId, step.commandId, step.eventId, step.correlationId]) if (!value.trim()) throw new Error("Lifecycle step identity is required.");
  if (!Number.isInteger(step.beforeVersion) || !Number.isInteger(step.afterVersion) || step.beforeVersion < 0 || step.afterVersion < 0) throw new Error("Lifecycle step version is invalid.");
  if (step.status === "COMMITTED" && step.afterVersion !== step.beforeVersion + 1) throw new Error("Committed lifecycle step must advance exactly one version.");
  if (step.status === "REPLAYED" && step.afterVersion !== step.beforeVersion) throw new Error("Replayed lifecycle step must not advance the version.");
}

export function certifyLifecycleJourney(input: { journeyId: string; steps: readonly LifecycleStep[]; auditCount: number; outboxCount: number; projectionVersion: number }): LifecycleCertification {
  if (!input.journeyId.trim() || input.steps.length !== EXPECTED_LIFECYCLE_ORDER.length) throw new Error("Lifecycle certification requires exactly five ordered steps.");
  input.steps.forEach(assertLifecycleStep);
  input.steps.forEach((step, index) => { if (step.name !== EXPECTED_LIFECYCLE_ORDER[index]) throw new Error("Lifecycle step order is not canonical."); });
  const correlation = input.steps[0].correlationId;
  if (input.steps.some((step) => step.correlationId !== correlation)) throw new Error("Lifecycle correlation drift detected.");
  if (!Number.isInteger(input.auditCount) || !Number.isInteger(input.outboxCount) || input.auditCount < 0 || input.outboxCount < 0) throw new Error("Lifecycle evidence cardinality is invalid.");
  if (input.auditCount !== input.outboxCount) throw new Error("Audit/outbox cardinality mismatch.");
  const committed = input.steps.filter((step) => step.status === "COMMITTED");
  const terminalVersion = committed.length > 0 ? committed[committed.length - 1].afterVersion : input.steps[input.steps.length - 1].afterVersion;
  if (input.projectionVersion !== terminalVersion) throw new Error("Reporting projection is stale.");
  return Object.freeze({ journeyId: input.journeyId, steps: Object.freeze([...input.steps]), auditCount: input.auditCount, outboxCount: input.outboxCount, projectionVersion: input.projectionVersion, certified: true, syntheticOnly: true });
}

export function assertLifecycleEventBinding<T>(event: LifecycleEventEnvelope<T>, commandId: string, correlationId: string, aggregateId: string): void {
  if (event.commandId !== commandId || event.correlationId !== correlationId || event.aggregateId !== aggregateId) throw new Error("Lifecycle event binding mismatch.");
}
