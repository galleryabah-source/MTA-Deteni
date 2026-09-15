import type { ActorContext, DetaineeStatus, Provenance, TemporaryExitState } from "../domain/shared/contracts.js";
import type { Detainee } from "../domain/core-administration/service.js";
import type { Placement } from "../domain/placement/service.js";
import type { MovementEvent } from "../domain/movement/service.js";
import type { CriticalMutationInput, MutationIntegrationStores } from "./mutation-integration.js";
import { executeCriticalMutation } from "./mutation-integration.js";
import type { TransactionRunner } from "./transaction-contract.js";

export type ApplicationMutationContext = Readonly<{
  actor: ActorContext;
  context: CriticalMutationInput<unknown>["context"];
  auditId: string;
  eventId: string;
  occurredAt: string;
}>;

export type ApplicationServiceDeps = Readonly<{
  stores: MutationIntegrationStores;
  transactionRunner: TransactionRunner;
  authorize: (actor: ActorContext, commandType: string, aggregateId: string) => void;
}>;

export type DomainMutation<T> = Readonly<{
  commandType: string;
  aggregateId: string;
  requestHash: string;
  payload: string;
  payloadFingerprint: string;
  responseFingerprint: string;
  run: () => Promise<T>;
}>;

export class MtaApplicationServices {
  constructor(private readonly deps: ApplicationServiceDeps) {}

  async execute<T>(input: ApplicationMutationContext, mutation: DomainMutation<T>): Promise<{ outcome: "COMMITTED" | "REPLAYED"; value: T | undefined }> {
    this.deps.authorize(input.actor, mutation.commandType, mutation.aggregateId);
    const critical: CriticalMutationInput<T> = {
      context: input.context,
      commandType: mutation.commandType,
      aggregateId: mutation.aggregateId,
      requestHash: mutation.requestHash,
      auditId: input.auditId,
      eventId: input.eventId,
      occurredAt: input.occurredAt,
      payload: mutation.payload,
      payloadFingerprint: mutation.payloadFingerprint,
      responseFingerprint: mutation.responseFingerprint,
      runDomainMutation: mutation.run,
    };
    return executeCriticalMutation(critical, this.deps.stores, this.deps.transactionRunner);
  }

  registerDetainee(input: ApplicationMutationContext & { detainee: Detainee; requestHash: string }): Promise<{ outcome: "COMMITTED" | "REPLAYED"; value: Detainee | undefined }> {
    return this.execute(input, { commandType: "DETAINEE_REGISTER", aggregateId: input.detainee.id, requestHash: input.requestHash, payload: JSON.stringify(input.detainee), payloadFingerprint: input.requestHash, responseFingerprint: input.requestHash, run: async () => input.detainee });
  }

  placeDetainee(input: ApplicationMutationContext & { placement: Placement; requestHash: string }): Promise<{ outcome: "COMMITTED" | "REPLAYED"; value: Placement | undefined }> {
    return this.execute(input, { commandType: "PLACEMENT_ASSIGN", aggregateId: input.placement.detaineeId, requestHash: input.requestHash, payload: JSON.stringify(input.placement), payloadFingerprint: input.requestHash, responseFingerprint: input.requestHash, run: async () => input.placement });
  }

  recordMovement(input: ApplicationMutationContext & { movement: MovementEvent; requestHash: string }): Promise<{ outcome: "COMMITTED" | "REPLAYED"; value: MovementEvent | undefined }> {
    return this.execute(input, { commandType: "MOVEMENT_RECORD", aggregateId: input.movement.detaineeId, requestHash: input.requestHash, payload: JSON.stringify(input.movement), payloadFingerprint: input.requestHash, responseFingerprint: input.requestHash, run: async () => input.movement });
  }

  advanceTemporaryExit(input: ApplicationMutationContext & { exitId: string; from: TemporaryExitState; to: TemporaryExitState; requestHash: string; apply: () => Promise<TemporaryExitState> }): Promise<{ outcome: "COMMITTED" | "REPLAYED"; value: TemporaryExitState | undefined }> {
    return this.execute(input, { commandType: "TEMPORARY_EXIT_ADVANCE", aggregateId: input.exitId, requestHash: input.requestHash, payload: JSON.stringify({ exitId: input.exitId, from: input.from, to: input.to }), payloadFingerprint: input.requestHash, responseFingerprint: input.requestHash, run: input.apply });
  }
}

export type { ActorContext, DetaineeStatus, Provenance };
