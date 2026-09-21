export const LEAVE_WORKFLOW_CONTRACT_VERSION="P10.14-INFERRED-v1";
export type WorkflowActor={userId:string;role:string;dutyActive:boolean;scopeAllowed:boolean};
export type WorkflowDecision="ALLOWED"|"AUTH_REQUIRED"|"DUTY_REQUIRED"|"SCOPE_DENIED"|"INVALID_STATE";
export type LeaveState="DRAFT"|"SUBMITTED"|"REVIEWED"|"APPROVED"|"DEPARTED"|"RETURNED"|"RECEIVED"|"COMPLETED"|"REJECTED"|"CANCELLED";
const ID=/^[A-Za-z0-9._-]{1,128}$/;
const transitions:Record<LeaveState,LeaveState[]>={DRAFT:["SUBMITTED","CANCELLED"],SUBMITTED:["REVIEWED","REJECTED","CANCELLED"],REVIEWED:["APPROVED","REJECTED"],APPROVED:["DEPARTED","CANCELLED"],DEPARTED:["RETURNED"],RETURNED:["RECEIVED"],RECEIVED:["COMPLETED"],COMPLETED:[],REJECTED:[],CANCELLED:[]};
export function authorizeLeaveTransition(actor:WorkflowActor,current:LeaveState,next:LeaveState):WorkflowDecision{if(!ID.test(actor.userId))return"AUTH_REQUIRED";if(!actor.dutyActive)return"DUTY_REQUIRED";if(!actor.scopeAllowed)return"SCOPE_DENIED";if(!transitions[current]?.includes(next))return"INVALID_STATE";return"ALLOWED";}