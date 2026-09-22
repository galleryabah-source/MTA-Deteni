import type { ActorContext } from "../shared/contracts.js";
import { DomainError } from "../shared/errors.js";
import { assertEscortIdentity, assertEscortMovement, assertEscortVersion, assertExitBinding, assertOfficerRoster, assertScope } from "./invariants.js";

export type EscortAssignment = Readonly<{id:string;temporaryExitId:string;officerIds:readonly string[];status:"ASSIGNED"|"ACTIVE"|"COMPLETED"|"CANCELLED";assignedAt:string;version:number}>;
export type EscortRepository = { getById(id:string):Promise<EscortAssignment|null>; getByExit(exitId:string):Promise<EscortAssignment|null>; save(assignment:EscortAssignment,expectedVersion:number|null):Promise<void> };
export type EscortContext = Readonly<{exitState:string;authorized:boolean;officersInScope:boolean;movementRecorded:boolean}>;
export type EscortDeps = Readonly<{repository:EscortRepository;now:()=>string;canManage:(actor:ActorContext)=>boolean;resolveContext?:(assignment:EscortAssignment,actor:ActorContext,nextStatus:EscortAssignment["status"])=>Promise<EscortContext>}>;
const ALLOWED:Record<EscortAssignment["status"],readonly EscortAssignment["status"][]>={ASSIGNED:["ACTIVE","CANCELLED"],ACTIVE:["COMPLETED","CANCELLED"],COMPLETED:[],CANCELLED:[]};

export class EscortService {
  constructor(private readonly deps:EscortDeps){}
  async assign(input:{id:string;temporaryExitId:string;officerIds:readonly string[];actor:ActorContext}):Promise<EscortAssignment>{
    assertEscortIdentity({id:input.id,temporaryExitId:input.temporaryExitId,actorId:input.actor.actorId,correlationId:input.actor.correlationId});
    assertScope({actor:input.actor,authorized:this.deps.canManage(input.actor),officersInScope:true});
    assertOfficerRoster(input.officerIds);
    const ctx=this.deps.resolveContext?await this.deps.resolveContext({id:input.id,temporaryExitId:input.temporaryExitId,officerIds:input.officerIds,status:"ASSIGNED",assignedAt:this.deps.now(),version:1},input.actor,"ASSIGNED"):null;
    if(ctx) { assertExitBinding({temporaryExitId:input.temporaryExitId,exitState:ctx.exitState}); assertScope({actor:input.actor,authorized:ctx.authorized,officersInScope:ctx.officersInScope}); }
    if(await this.deps.repository.getById(input.id)) throw new DomainError("CONFLICT","Escort assignment already exists.");
    if(await this.deps.repository.getByExit(input.temporaryExitId)) throw new DomainError("CONFLICT","An escort assignment already exists for this exit.");
    const assignment:EscortAssignment={id:input.id,temporaryExitId:input.temporaryExitId,officerIds:[...new Set(input.officerIds)],status:"ASSIGNED",assignedAt:this.deps.now(),version:1};
    await this.deps.repository.save(assignment,null);
    return assignment;
  }
  async setStatus(id:string,status:EscortAssignment["status"],actor:ActorContext):Promise<EscortAssignment>{
    if(!this.deps.canManage(actor)) throw new DomainError("FORBIDDEN_SCOPE","Actor is not authorized for escort.");
    if(!id.trim()) throw new DomainError("VALIDATION_FAILED","Escort assignment identifier is required.");
    const current=await this.deps.repository.getById(id);
    if(!current) throw new DomainError("VALIDATION_FAILED","Escort assignment not found.");
    if(!ALLOWED[current.status].includes(status)) throw new DomainError("INVALID_STATE",`Invalid escort transition: ${current.status} → ${status}.`);
    const ctx=this.deps.resolveContext?await this.deps.resolveContext(current,actor,status):{exitState:"DOCUMENTED",authorized:true,officersInScope:true,movementRecorded:status==="COMPLETED"};
    assertExitBinding({temporaryExitId:current.temporaryExitId,exitState:ctx.exitState});
    assertScope({actor,authorized:ctx.authorized,officersInScope:ctx.officersInScope});
    assertEscortMovement({status,movementRecorded:ctx.movementRecorded});
    assertEscortVersion(current,current.version);
    const updated={...current,status,version:current.version+1};
    await this.deps.repository.save(updated,current.version);
    return updated;
  }
}