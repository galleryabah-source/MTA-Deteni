import type { ActorContext, TemporaryExitState } from "../domain/shared/contracts.js";
import { DomainError } from "../domain/shared/errors.js";
import type { TemporaryExitService } from "../domain/temporary-exit/service.js";
import type { AuthorizationPort, AuditOutboxPort, TransactionPort } from "./ports.js";

export type ExitWorkflowReadPort = {
  approvalState(exitId: string): Promise<"APPROVED" | "REJECTED" | "PENDING">;
  documentState(exitId: string): Promise<"VALID" | "INVALID" | "MISSING">;
  escortState(exitId: string): Promise<"ASSIGNED" | "MISSING" | "CANCELLED">;
};

const requiredPermission: Partial<Record<TemporaryExitState, string>> = {
  VALIDATED: "temporary_exit.validate",
  APPROVED: "temporary_exit.approve",
  DOCUMENTED: "temporary_exit.document",
  ESCORT_ASSIGNED: "temporary_exit.assign_escort",
  DEPARTED: "temporary_exit.depart",
  RETURN_PENDING: "temporary_exit.record_return_pending",
  RETURNED: "temporary_exit.record_return",
  COMPLETED: "temporary_exit.close",
};

export class TemporaryExitWorkflow {
  constructor(
    private readonly exitService: TemporaryExitService,
    private readonly reads: ExitWorkflowReadPort,
    private readonly authorization: AuthorizationPort,
    private readonly audit: AuditOutboxPort,
    private readonly transaction: TransactionPort,
  ) {}

  async advance(input: { exitId: string; from: TemporaryExitState; to: TemporaryExitState; actor: ActorContext }): Promise<TemporaryExitState> {
    const permission = requiredPermission[input.to];
    if (!permission || !(await this.authorization.authorize(input.actor, permission, input.exitId))) {
      throw new DomainError("FORBIDDEN_SCOPE", "Workflow actor is not authorized for this transition.");
    }
    if (input.to === "APPROVED" && (await this.reads.approvalState(input.exitId)) !== "APPROVED") {
      throw new DomainError("INVALID_STATE", "Temporary exit cannot advance before approval is recorded.");
    }
    if (input.to === "DEPARTED") {
      if ((await this.reads.documentState(input.exitId)) !== "VALID") throw new DomainError("INVALID_STATE", "Departure requires a valid exit document.");
      if ((await this.reads.escortState(input.exitId)) !== "ASSIGNED") throw new DomainError("INVALID_STATE", "Departure requires an active escort assignment.");
    }

    return this.transaction.run(async () => {
      const updated = await this.exitService.advance(input.exitId, input.to, input.actor);
      await this.audit.append({
        eventId: `AUD-${input.exitId}-${input.to}`,
        eventType: "TEMPORARY_EXIT_TRANSITION",
        aggregateType: "TEMPORARY_EXIT",
        aggregateId: input.exitId,
        actorId: input.actor.actorId,
        correlationId: input.actor.correlationId,
        occurredAt: new Date().toISOString(),
        payloadHash: `${input.from}:${input.to}`,
      });
      await this.audit.enqueue("temporary-exit.transitioned", input.exitId, { from: input.from, to: input.to });
      return updated.state;
    });
  }
}
