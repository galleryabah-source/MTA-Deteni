import type { ActorContext, TemporaryExitState } from "../shared/contracts.js";
import { DomainError } from "../shared/errors.js";
import { transition } from "./state-machine.mjs";
import { assertOperationalContext, assertSchedule, assertTemporaryExitIdentity, assertTransition, assertVersion } from "./invariants.js";

export type TemporaryExit = Readonly<{ id:string; detaineeId:string; state:TemporaryExitState; requestedAt:string; plannedDepartureAt:string; plannedReturnAt:string; version:number }>;
export type TemporaryExitRepository = {
  get(id:string):Promise<TemporaryExit|null>;
  save(exit:TemporaryExit, expectedVersion:number|null):Promise<void>;
};
export type TemporaryExitContext = Readonly<{
  detaineeActive:boolean;
  placementActive:boolean;
  movementRecorded:boolean;
  documentReady:boolean;
  escortAssigned:boolean;
}>;
export type TemporaryExitDeps = Readonly<{
  repository:TemporaryExitRepository;
  now:()=>string;
  canManage:(actor:ActorContext)=>boolean;
  resolveContext?:(exit:TemporaryExit,state:TemporaryExitState,actor:ActorContext)=>Promise<TemporaryExitContext>;
}>;

export class TemporaryExitService {
  constructor(private readonly deps:TemporaryExitDeps) {}

  async request(input:{id:string;detaineeId:string;plannedDepartureAt:string;plannedReturnAt:string;actor:ActorContext}):Promise<TemporaryExit>{
    if(!this.deps.canManage(input.actor)) throw new DomainError("FORBIDDEN_SCOPE","Actor is not authorized for temporary exit.");
    assertTemporaryExitIdentity({id:input.id,detaineeId:input.detaineeId,actorId:input.actor.actorId,correlationId:input.actor.correlationId});
    assertSchedule(input.plannedDepartureAt,input.plannedReturnAt);
    if(await this.deps.repository.get(input.id)) throw new DomainError("CONFLICT","Temporary exit already exists.");
    const exit:TemporaryExit={id:input.id,detaineeId:input.detaineeId,state:"REQUESTED",requestedAt:this.deps.now(),plannedDepartureAt:input.plannedDepartureAt,plannedReturnAt:input.plannedReturnAt,version:1};
    await this.deps.repository.save(exit,null);
    return exit;
  }

  async advance(id:string,to:TemporaryExitState,actor:ActorContext):Promise<TemporaryExit>{
    if(!this.deps.canManage(actor)) throw new DomainError("FORBIDDEN_SCOPE","Actor is not authorized for temporary exit.");
    if(!id.trim()) throw new DomainError("VALIDATION_FAILED","Temporary exit identifier is required.");
    const current=await this.deps.repository.get(id);
    if(!current) throw new DomainError("VALIDATION_FAILED","Temporary exit not found.");
    assertTransition(current.state,to);
    const context=this.deps.resolveContext ? await this.deps.resolveContext(current,to,actor) : {
      detaineeActive:true, placementActive:true, movementRecorded:["DEPARTED","RETURN_PENDING","RETURNED","COMPLETED"].includes(to),
      documentReady:to!=="DOCUMENTED" || true, escortAssigned:to!=="ESCORT_ASSIGNED" || true
    };
    assertOperationalContext({state:to,...context});
    const updated={...current,state:transition(current.state,to).state,version:current.version+1};
    assertVersion(current,current.version);
    await this.deps.repository.save(updated,current.version);
    return updated;
  }
}
