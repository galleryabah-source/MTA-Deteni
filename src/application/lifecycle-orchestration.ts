import type { ActorContext, TemporaryExitState } from "../domain/shared/contracts.js";
import type { Detainee } from "../domain/core-administration/service.js";
import type { Placement } from "../domain/placement/service.js";
import type { MovementEvent } from "../domain/movement/service.js";
import type { MtaApplicationServices, ApplicationMutationContext } from "./mta-application-services.js";

export type LifecycleCommandEnvelope<T> = Readonly<{
  commandId: string;
  correlationId: string;
  aggregateId: string;
  expectedVersion: number;
  requestHash: string;
  payload: T;
}>;

export type LifecycleEventEnvelope<T> = Readonly<{
  eventId: string;
  commandId: string;
  correlationId: string;
  aggregateId: string;
  resultingVersion: number;
  eventType: string;
  payload: T;
}>;

export type LifecycleReadRefresh = Readonly<{
  aggregateId: string;
  sourceVersion: number;
  projectionVersion: number;
  refreshed: boolean;
}>;

export function assertLifecycleEnvelope(input: LifecycleCommandEnvelope<unknown>): void {
  for (const value of [input.commandId, input.correlationId, input.aggregateId, input.requestHash]) if (!value.trim()) throw new Error("Lifecycle command identity/hash is required.");
  if (!Number.isInteger(input.expectedVersion) || input.expectedVersion < 0) throw new Error("Lifecycle expected version is invalid.");
}

export function assertLifecycleEventEnvelope<T>(input: LifecycleEventEnvelope<T>): void {
  for (const value of [input.eventId, input.commandId, input.correlationId, input.aggregateId, input.eventType]) if (!value.trim()) throw new Error("Lifecycle event identity is required.");
  if (!Number.isInteger(input.resultingVersion) || input.resultingVersion <= 0) throw new Error("Lifecycle resulting version is invalid.");
}

export function createLifecycleEvent<T>(input: LifecycleEventEnvelope<T>): LifecycleEventEnvelope<T> {
  assertLifecycleEventEnvelope(input);
  return Object.freeze({ ...input });
}

export function assertVersionPropagation(expectedVersion: number, resultingVersion: number): void {
  if (resultingVersion !== expectedVersion + 1) throw new Error("Optimistic version propagation mismatch.");
}

export function assertReadRefresh(input: LifecycleReadRefresh): void {
  if (!input.aggregateId.trim() || input.sourceVersion < 0 || input.projectionVersion < 0) throw new Error("Read-model refresh identity/version is invalid.");
  if (input.refreshed && input.projectionVersion !== input.sourceVersion) throw new Error("Refreshed projection must equal aggregate source version.");
}

export type LifecycleOrchestrator = Readonly<{
  register: (ctx: ApplicationMutationContext & { command: LifecycleCommandEnvelope<Detainee> }) => Promise<unknown>;
  place: (ctx: ApplicationMutationContext & { command: LifecycleCommandEnvelope<Placement> }) => Promise<unknown>;
  movement: (ctx: ApplicationMutationContext & { command: LifecycleCommandEnvelope<MovementEvent> }) => Promise<unknown>;
  temporaryExit: (ctx: ApplicationMutationContext & { command: LifecycleCommandEnvelope<{ exitId: string; from: TemporaryExitState; to: TemporaryExitState }>; apply: () => Promise<TemporaryExitState> }) => Promise<unknown>;
}>;

export function createLifecycleOrchestrator(services: MtaApplicationServices): LifecycleOrchestrator {
  return Object.freeze({
    register: (ctx) => services.registerDetainee({ ...ctx, detainee: ctx.command.payload, requestHash: ctx.command.requestHash }),
    place: (ctx) => services.placeDetainee({ ...ctx, placement: ctx.command.payload, requestHash: ctx.command.requestHash }),
    movement: (ctx) => services.recordMovement({ ...ctx, movement: ctx.command.payload, requestHash: ctx.command.requestHash }),
    temporaryExit: (ctx) => services.advanceTemporaryExit({ ...ctx, exitId: ctx.command.payload.exitId, from: ctx.command.payload.from, to: ctx.command.payload.to, requestHash: ctx.command.requestHash, apply: ctx.apply }),
  });
}

export function assertLifecycleActorCorrelation(actor: ActorContext, correlationId: string): void {
  if (!actor.correlationId || actor.correlationId !== correlationId) throw new Error("Actor correlation binding mismatch.");
}
