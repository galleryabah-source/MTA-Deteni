import type { ActorContext, TemporaryExitState } from "../domain/shared/contracts.js";
import type { CoreAdministrationService } from "../domain/core-administration/service.js";
import type { PlacementService } from "../domain/placement/service.js";
import type { MovementService } from "../domain/movement/service.js";
import type { TemporaryExitService } from "../domain/temporary-exit/service.js";
import type { EscortService } from "../domain/escort/service.js";
import type { DocumentEngineService } from "../domain/document-engine/service.js";
import type { ApprovalLeadershipService } from "../domain/approval-leadership/service.js";

export type MtaWorkflow = Readonly<{
  coreAdministration: CoreAdministrationService;
  placement: PlacementService;
  movement: MovementService;
  temporaryExit: TemporaryExitService;
  escort: EscortService;
  documents: DocumentEngineService;
  approvals: ApprovalLeadershipService;
}>;

/** Application boundary for the canonical temporary-exit chain. */
export class MtaWorkflowService {
  constructor(private readonly services: MtaWorkflow) {}

  async createTemporaryExitCase(input: { exitId: string; detaineeId: string; departureAt: string; returnAt: string; actor: ActorContext }) {
    return this.services.temporaryExit.request({ id: input.exitId, detaineeId: input.detaineeId, plannedDepartureAt: input.departureAt, plannedReturnAt: input.returnAt, actor: input.actor });
  }

  async advanceTemporaryExit(input: { exitId: string; to: TemporaryExitState; actor: ActorContext }) {
    return this.services.temporaryExit.advance(input.exitId, input.to, input.actor);
  }
}
