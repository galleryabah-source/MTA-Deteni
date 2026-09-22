import type { ActorContext } from "../shared/contracts.js";
import { DomainError } from "../shared/errors.js";
import { assertApprovalIdentity, assertApprovalImmutable, assertApprovalScope, assertRevision, assertSecondApproval } from "./invariants.js";

export type ApprovalDecision="APPROVED"|"REJECTED"|"REVOKED";
export type Approval=Readonly<{id:string;subjectType:string;subjectId:string;decision:ApprovalDecision;reason:string;actorId:string;correlationId:string;decidedAt:string;secondApprovalRequired:boolean;secondApprovedBy?:string;revision:number}>;
export type ApprovalRepository={get(id:string):Promise<Approval|null>;save(approval:Approval):Promise<void>};
export type ApprovalContext=Readonly<{authorized:boolean;scopeValid:boolean}>;
export type ApprovalDeps=Readonly<{repository:ApprovalRepository;now:()=>string;canApprove:(actor:ActorContext,subjectType:string)=>boolean;requiresSecondApproval:(subjectType:string)=>boolean;resolveContext?:(actor:ActorContext,subjectType:string,subjectId:string)=>Promise<ApprovalContext>}>;
export class ApprovalLeadershipService {
  constructor(private readonly deps:ApprovalDeps){}
  async decide(input:{id:string;subjectType:string;subjectId:string;decision:ApprovalDecision;reason:string;actor:ActorContext}):Promise<Approval>{
    assertApprovalIdentity({id:input.id,subjectType:input.subjectType,subjectId:input.subjectId,actorId:input.actor.actorId,correlationId:input.actor.correlationId,reason:input.reason});
    const context=this.deps.resolveContext?await this.deps.resolveContext(input.actor,input.subjectType,input.subjectId):{authorized:this.deps.canApprove(input.actor,input.subjectType),scopeValid:true};
    assertApprovalScope(context);
    const existing=await this.deps.repository.get(input.id);
    assertApprovalImmutable(existing,{subjectType:input.subjectType,subjectId:input.subjectId,decision:input.decision,reason:input.reason});
    assertRevision(1);
    const approval:Approval={id:input.id,subjectType:input.subjectType,subjectId:input.subjectId,decision:input.decision,reason:input.reason,actorId:input.actor.actorId,correlationId:input.actor.correlationId,decidedAt:this.deps.now(),secondApprovalRequired:this.deps.requiresSecondApproval(input.subjectType),revision:1};
    await this.deps.repository.save(approval);
    return approval;
  }
  async secondApprove(id:string,actor:ActorContext):Promise<Approval>{
    const current=await this.deps.repository.get(id);
    if(!current) throw new DomainError("VALIDATION_FAILED","Approval decision not found.");
    const context=this.deps.resolveContext?await this.deps.resolveContext(actor,current.subjectType,current.subjectId):{authorized:this.deps.canApprove(actor,current.subjectType),scopeValid:true};
    assertApprovalScope(context);
    assertSecondApproval(current,actor);
    assertRevision(current.revision,current.revision-1);
    const updated={...current,secondApprovedBy:actor.actorId,revision:current.revision+1};
    await this.deps.repository.save(updated);
    return updated;
  }
}