import { DomainError } from "../shared/errors.js";
export type Deportation=Readonly<{id:string;detaineeId:string;status:"ELIGIBLE"|"APPROVED"|"DOCUMENTED"|"ESCORT_ASSIGNED"|"DEPARTED"|"CLOSED";approvalId:string;documentId:string;escortAssignmentId:string;departureMovementId?:string;version:number}>;
export type DeportationRepository={get(id:string):Promise<Deportation|null>;save(value:Deportation,expectedVersion:number|null):Promise<void>};
export type DeportationContext=Readonly<{detaineeActive:boolean;approvalValid:boolean;documentValid:boolean;escortValid:boolean;movementRecorded:boolean}>;
export type DeportationDeps=Readonly<{repository:DeportationRepository;canManage:(actor:unknown)=>boolean;resolveContext:(current:Deportation|null,next:Deportation["status"],actor:unknown)=>Promise<DeportationContext>}>;
import { assertDeportationEvidence,assertDeportationIdentity,assertDeportationTransition,assertDepartureEvidence,assertVersion } from "./invariants.js";
export class DeportationService{
 constructor(private readonly deps:DeportationDeps){}
 async create(input:{id:string;detaineeId:string;approvalId:string;documentId:string;escortAssignmentId:string;actor:unknown}):Promise<Deportation>{
  if(!this.deps.canManage(input.actor)) throw new DomainError("FORBIDDEN_SCOPE","Actor is not authorized for deportation.");
  assertDeportationIdentity(input);
  if(await this.deps.repository.get(input.id)) throw new DomainError("CONFLICT","Deportation already exists.");
  const ctx=await this.deps.resolveContext(null,"ELIGIBLE",input.actor); assertDeportationEvidence(ctx);
  const value:Deportation={id:input.id,detaineeId:input.detaineeId,status:"ELIGIBLE",approvalId:input.approvalId,documentId:input.documentId,escortAssignmentId:input.escortAssignmentId,version:1};
  await this.deps.repository.save(value,null); return value;
 }
 async advance(id:string,to:Deportation["status"],actor:unknown):Promise<Deportation>{
  if(!this.deps.canManage(actor)) throw new DomainError("FORBIDDEN_SCOPE","Actor is not authorized for deportation.");
  const current=await this.deps.repository.get(id); if(!current) throw new DomainError("VALIDATION_FAILED","Deportation not found.");
  assertDeportationTransition(current.status,to);
  const ctx=await this.deps.resolveContext(current,to,actor);
  if(to!=="ELIGIBLE") assertDeportationEvidence(ctx);
  assertDepartureEvidence({status:to,movementRecorded:ctx.movementRecorded});
  assertVersion(current,current.version);
  const updated={...current,status:to,departureMovementId:to==="DEPARTED"||to==="CLOSED"?"MOVEMENT_REQUIRED":current.departureMovementId,version:current.version+1};
  await this.deps.repository.save(updated,current.version); return updated;
 }
}