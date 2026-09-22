import { DomainError } from "../shared/errors.js";
import type { ActorContext } from "../shared/contracts.js";
import type { Approval } from "./service.js";

export function assertApprovalIdentity(input:{id:string;subjectType:string;subjectId:string;actorId:string;correlationId:string;reason:string}):void {
  for(const [name,value] of Object.entries(input)) if(!value.trim()) throw new DomainError("VALIDATION_FAILED",`Approval ${name} is required.`);
}
export function assertApprovalScope(input:{authorized:boolean;scopeValid:boolean}):void {
  if(!input.authorized || !input.scopeValid) throw new DomainError("FORBIDDEN_SCOPE","Approval authority or scope is insufficient.");
}
export function assertSeparationOfDuties(actorId:string, firstApproverId:string):void {
  if(actorId===firstApproverId) throw new DomainError("FORBIDDEN_SCOPE","Separation of duties prohibits self-approval.");
}
export function assertSecondApproval(current:Approval, actor:ActorContext):void {
  if(!current.secondApprovalRequired) throw new DomainError("INVALID_STATE","Second approval is not required.");
  assertSeparationOfDuties(actor.actorId,current.actorId);
  if(current.secondApprovedBy) throw new DomainError("CONFLICT","Second approval already recorded.");
}
export function assertApprovalImmutable(existing:Approval|null,input:{subjectType:string;subjectId:string;decision:Approval["decision"];reason:string}):void {
  if(!existing) return;
  if(existing.subjectType!==input.subjectType || existing.subjectId!==input.subjectId || existing.decision!==input.decision || existing.reason!==input.reason) {
    throw new DomainError("INTEGRITY_FAILURE","Approval evidence is immutable.");
  }
  throw new DomainError("CONFLICT","Approval decision already exists.");
}
export function assertRevision(revision:number,previousRevision?:number):void {
  if(!Number.isInteger(revision)||revision<1) throw new DomainError("VALIDATION_FAILED","Approval revision must be a positive integer.");
  if(previousRevision!==undefined&&revision!==previousRevision+1) throw new DomainError("CONFLICT","Approval revision must increment sequentially.");
}
