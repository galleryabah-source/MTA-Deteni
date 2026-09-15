import type { ActorContext, TemporaryExitState } from "../domain/shared/contracts";
import type { CoreAdministrationService } from "../domain/core-administration/service";
import type { PlacementService } from "../domain/placement/service";
import type { MovementService } from "../domain/movement/service";
import type { TemporaryExitService } from "../domain/temporary-exit/service";
import type { EscortService } from "../domain/escort/service";
import type { DocumentEngineService } from "../domain/document-engine/service";
import type { ApprovalLeadershipService } from "../domain/approval-leadership/service";

export type MtaWorkflow = Readonly<{
  coreAdministration: CoreAdministrationService;
  placement: PlacementService;
  movement: MovementService;
  temporaryExit: TemporaryExitService;
  escort: EscortService;
  documents: DocumentEngineService;
  approvals: ApprovalLeadershipService;
}>;

/**
 * Application boundary for the canonical temporary-exit chain.
 * It deliberately delegates authorization and persistence to domain ports;
 * this layer only composes the sequence and prevents UI-driven shortcuts.
 */
export class MtaWorkflowService {
  constructor(private readonly services: MtaWorkflow) {}

  async createTemporaryExitCase(input: {
    exitId: string;
    detaineeId: string;
    departureAt: string;
    returnAt: string;
    actor: ActorContext;
  }) {
    return this.services.temporaryExit.request({
      id: input.exitId,
      detaineeId: input.detaineeId,
      plannedDepartureAt: input.departureAt,
      plannedReturnAt: input.returnAt,
      actor: input.actor,
    });
  }

  async advanceTemporaryExit(input: {
    exitId: string;
    to: TemporaryExitState;
    actor: ActorContext;
  }) {
    return this.services.temporaryExit.advance(input.exitId, input.to, input.actor);
  }
}
