import { DomainError } from "../shared/errors.js";

export type Deportation = Readonly<{id:string;detaineeId:string;status:"ELIGIBLE"|"APPROVED"|"DOCUMENTED"|"ESCORT_ASSIGNED"|"DEPARTED"|"CLOSED";approvalId:string;documentId:string;escortAssignmentId:string;departureMovementId?:string;version:number}>;

export function assertDeportationIdentity(input:{id:string;detaineeId:string;approvalId:string;documentId:string;escortAssignmentId:string}):void {
  for(const [name,value] of Object.entries(input)) if(!value.trim()) throw new DomainError("VALIDATION_FAILED",`Deportation ${name} is required.`);
}
export function assertDeportationEvidence(input:{detaineeActive:boolean;approvalValid:boolean;documentValid:boolean;escortValid:boolean}):void {
  if(!input.detaineeActive) throw new DomainError("INVALID_STATE","Detainee must be active for deportation processing.");
  if(!input.approvalValid) throw new DomainError("INVALID_STATE","Valid approval evidence is required.");
  if(!input.documentValid) throw new DomainError("INVALID_STATE","Valid document evidence is required.");
  if(!input.escortValid) throw new DomainError("INVALID_STATE","Valid escort assignment is required.");
}
export function assertDeportationTransition(from:Deportation["status"],to:Deportation["status"]):void {
  const allowed:Record<Deportation["status"],readonly Deportation["status"][]>={
    ELIGIBLE:["APPROVED"],APPROVED:["DOCUMENTED"],DOCUMENTED:["ESCORT_ASSIGNED"],ESCORT_ASSIGNED:["DEPARTED"],DEPARTED:["CLOSED"],CLOSED:[]
  };
  if(!allowed[from].includes(to)) throw new DomainError("INVALID_STATE",`Invalid deportation transition: ${from} → ${to}.`);
}
export function assertDepartureEvidence(input:{status:Deportation["status"];movementRecorded:boolean}):void {
  if((input.status==="DEPARTED"||input.status==="CLOSED")&&!input.movementRecorded) throw new DomainError("INVALID_STATE","Departure movement evidence is required.");
}
export function assertVersion(current:Deportation,expected:number):void {
  if(current.version!==expected) throw new DomainError("STALE_STATE","Deportation changed concurrently.",true);
}
