export const ESCORT_USECASE_CONTRACT_VERSION="P10.15-INFERRED-v1";
export type EscortActor={userId:string;dutyActive:boolean;scopeAllowed:boolean;permission:"escort.assign"|"escort.complete"};
export type EscortDecision="ALLOWED"|"AUTH_REQUIRED"|"DUTY_REQUIRED"|"SCOPE_DENIED"|"PERMISSION_DENIED";
const ID=/^[A-Za-z0-9._-]{1,128}$/;
export function authorizeEscort(actor:EscortActor,action:"ASSIGN"|"COMPLETE"):EscortDecision{if(!ID.test(actor.userId))return"AUTH_REQUIRED";if(!actor.dutyActive)return"DUTY_REQUIRED";if(!actor.scopeAllowed)return"SCOPE_DENIED";if((action==="ASSIGN"&&actor.permission!=="escort.assign")||(action==="COMPLETE"&&actor.permission!=="escort.complete"))return"PERMISSION_DENIED";return"ALLOWED";}