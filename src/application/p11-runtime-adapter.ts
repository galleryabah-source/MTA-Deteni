export const P11_ADAPTER_VERSION="P11-RUNTIME-ADAPTER-v1";
export type RuntimeCommand=Readonly<{journeyId:string;stage:string;requestId:string;correlationId:string;actorId:string;resourceType:string;resourceId:string;idempotencyKey:string;payload:Record<string,unknown>}>;
export type RuntimeResult=Readonly<{accepted:boolean;status:"SUCCESS"|"DENIED"|"FAILED";code:string;journeyId:string;stage:string;requestId:string;correlationId:string;idempotencyKey:string;resourceId:string}>;
export interface RuntimeAdapter{execute(command:RuntimeCommand):Promise<RuntimeResult>}
export function assertRuntimeCommand(c:RuntimeCommand){for(const k of ["journeyId","requestId","correlationId","actorId","resourceType","resourceId","idempotencyKey"] as const)if(!c[k]?.trim())throw new Error("P11_ADAPTER_REQUIRED:"+k);return c;}
export function normalizeRuntimeResult(c:RuntimeCommand,r:Partial<RuntimeResult>):RuntimeResult{return Object.freeze({accepted:r.accepted===true,status:r.status??"FAILED",code:r.code??"UNHANDLED_RUNTIME_RESULT",journeyId:c.journeyId,stage:c.stage,requestId:c.requestId,correlationId:c.correlationId,idempotencyKey:c.idempotencyKey,resourceId:c.resourceId});}
