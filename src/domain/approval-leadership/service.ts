import type { ActorContext } from "../shared/contracts";
import { DomainError } from "../shared/errors";

export type ApprovalDecision = "APPROVED" | "REJECTED" | "REVOKED";
export type Approval = Readonly<{
  id: string;
  subjectType: string;
  subjectId: string;
  decision: ApprovalDecision;
  reason: string;
  actorId: string;
  correlationId: string;
  decidedAt: string;
  secondApprovalRequired: boolean;
  secondApprovedBy?: string;
}>;

export type ApprovalRepository = {
  get(id: string): Promise<Approval | null>;
  save(approval: Approval): Promise<void>;
};

export type ApprovalDeps = Readonly<{
  repository: ApprovalRepository;
  now: () => string;
  canApprove: (actor: ActorContext, subjectType: string) => boolean;
  requiresSecondApproval: (subjectType: string) => boolean;
}>;

export class ApprovalLeadershipService {
  constructor(private readonly deps: ApprovalDeps) {}

  async decide(input: {
    id: string;
    subjectType: string;
    subjectId: string;
    decision: ApprovalDecision;
    reason: string;
    actor: ActorContext;
  }): Promise<Approval> {
    if (!this.deps.canApprove(input.actor, input.subjectType)) throw new DomainError("FORBIDDEN_SCOPE", "Actor is not authorized to approve this subject.");
    if (!input.reason.trim()) throw new DomainError("VALIDATION_FAILED", "Approval reason is required.");
    if (await this.deps.repository.get(input.id)) throw new DomainError("CONFLICT", "Approval decision already exists.");
    const approval: Approval = {
      id: input.id,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      decision: input.decision,
      reason: input.reason,
      actorId: input.actor.actorId,
      correlationId: input.actor.correlationId,
      decidedAt: this.deps.now(),
      secondApprovalRequired: this.deps.requiresSecondApproval(input.subjectType),
    };
    await this.deps.repository.save(approval);
    return approval;
  }

  async secondApprove(id: string, actor: ActorContext): Promise<Approval> {
    const current = await this.deps.repository.get(id);
    if (!current) throw new DomainError("VALIDATION_FAILED", "Approval decision not found.");
    if (!current.secondApprovalRequired) throw new DomainError("INVALID_STATE", "Second approval is not required.");
    if (current.actorId === actor.actorId) throw new DomainError("FORBIDDEN_SCOPE", "Separation of duties prohibits self second-approval.");
    if (current.secondApprovedBy) throw new DomainError("CONFLICT", "Second approval already recorded.");
    const updated = { ...current, secondApprovedBy: actor.actorId };
    await this.deps.repository.save(updated);
    return updated;
  }
}
