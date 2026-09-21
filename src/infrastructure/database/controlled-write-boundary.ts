export const CONTROLLED_WRITE_BOUNDARY_VERSION = "P9.24-v1";
export type WriteDecision = "ALLOW"|"AUTH_REQUIRED"|"PERMISSION_DENIED"|"SCOPE_DENIED"|"DUTY_REQUIRED"|"INVALID_STATE";
export interface WriteContext { authenticated:boolean; permissionAllowed:boolean; scopeAllowed:boolean; dutyActive:boolean; stateAllowed:boolean; }
export function authorizeControlledWrite(c: WriteContext): WriteDecision {
 if(!c.authenticated) return "AUTH_REQUIRED";
 if(!c.permissionAllowed) return "PERMISSION_DENIED";
 if(!c.scopeAllowed) return "SCOPE_DENIED";
 if(!c.dutyActive) return "DUTY_REQUIRED";
 if(!c.stateAllowed) return "INVALID_STATE";
 return "ALLOW";
}