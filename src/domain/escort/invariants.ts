import { DomainError } from "../shared/errors.js";
import type { ActorContext } from "../shared/contracts.js";
import type { EscortAssignment } from "./service.js";

export function assertEscortIdentity(input:{id:string;temporaryExitId:string;actorId:string;correlationId:string}):void {
  for(const [name,value] of Object.entries(input)) if(!value.trim()) throw new DomainError("VALIDATION_FAILED",`Escort ${name} is required.`);
}
export function assertOfficerRoster(officerIds:readonly string[]):void {
  const unique=[...new Set(officerIds.map(v=>v.trim()).filter(Boolean))];
  if(unique.length===0) throw new DomainError("VALIDATION_FAILED","At least one escort officer is required.");
  if(unique.length!==officerIds.length) throw new DomainError("CONFLICT","Escort officer assignment contains duplicates or blank identities.");
}
export function assertScope(input:{actor:ActorContext;authorized:boolean;officersInScope:boolean}):void {
  if(!input.authorized) throw new DomainError("FORBIDDEN_SCOPE","Actor is not authorized for escort.");
  if(!input.officersInScope) throw new DomainError("FORBIDDEN_SCOPE","Escort officers are outside the authorized scope.");
}
export function assertExitBinding(input:{temporaryExitId:string;exitState:string}):void {
  if(!input.temporaryExitId.trim()) throw new DomainError("VALIDATION_FAILED","Temporary exit binding is required.");
  if(input.exitState!=="DOCUMENTED") throw new DomainError("INVALID_STATE","Escort assignment requires a DOCUMENTED temporary exit.");
}
export function assertEscortMovement(input:{status:EscortAssignment["status"];movementRecorded:boolean}):void {
  if((input.status==="ACTIVE"||input.status==="COMPLETED")&&!input.movementRecorded) throw new DomainError("INVALID_STATE","Escort operational status requires movement evidence.");
}
export function assertEscortVersion(current:EscortAssignment,expectedVersion:number):void {
  if(current.version!==expectedVersion) throw new DomainError("STALE_STATE","Escort assignment changed concurrently.",true);
}
