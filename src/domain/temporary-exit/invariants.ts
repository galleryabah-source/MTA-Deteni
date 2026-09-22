import { DomainError } from "../shared/errors.js";
import type { TemporaryExit, TemporaryExitState } from "./service.js";
import { canTransition } from "./state-machine.mjs";

export function assertTemporaryExitIdentity(input:{id:string; detaineeId:string; actorId:string; correlationId:string}):void {
  for (const [name,value] of Object.entries(input)) if (!value.trim()) throw new DomainError("VALIDATION_FAILED", `Temporary exit ${name} is required.`);
}

export function assertSchedule(departure:string, plannedReturn:string):void {
  if (!departure.trim() || !plannedReturn.trim()) throw new DomainError("VALIDATION_FAILED","Departure and return times are required.");
  if (plannedReturn <= departure) throw new DomainError("VALIDATION_FAILED","Return time must be after departure time.");
}

export function assertTransition(from:TemporaryExitState,to:TemporaryExitState):void {
  if (!canTransition(from,to)) throw new DomainError("INVALID_STATE",`Invalid temporary-exit transition: ${from} → ${to}.`);
}

export function assertVersion(current:TemporaryExit, expectedVersion:number):void {
  if (current.version !== expectedVersion) throw new DomainError("STALE_STATE","Temporary exit changed concurrently.",true);
}

export function assertOperationalContext(input:{
  state:TemporaryExitState;
  detaineeActive:boolean;
  placementActive:boolean;
  movementRecorded:boolean;
  documentReady:boolean;
  escortAssigned:boolean;
}):void {
  if (!input.detaineeActive) throw new DomainError("INVALID_STATE","Detainee is not active.");
  if (!input.placementActive) throw new DomainError("INVALID_STATE","Active placement is required.");
  if ((input.state==="DEPARTED" || input.state==="RETURN_PENDING" || input.state==="RETURNED" || input.state==="COMPLETED") && !input.movementRecorded) {
    throw new DomainError("INVALID_STATE","Required movement evidence is missing.");
  }
  if (input.state==="DOCUMENTED" && !input.documentReady) throw new DomainError("INVALID_STATE","Required document evidence is missing.");
  if (input.state==="ESCORT_ASSIGNED" && !input.escortAssigned) throw new DomainError("INVALID_STATE","Escort assignment is required.");
}
