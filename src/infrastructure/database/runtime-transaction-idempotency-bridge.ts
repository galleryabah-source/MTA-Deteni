export const RUNTIME_TRANSACTION_IDEMPOTENCY_VERSION = "P9.29-v1";
export type IdempotencyOutcome="ACQUIRED"|"REPLAY"|"CONFLICT";
export interface RuntimeTransactionContext { transactionId:string; requestId:string; correlationId:string; idempotencyKey:string; requestHash:string; }
export interface RuntimeIdempotencyPort { begin(key:string,requestHash:string):Promise<IdempotencyOutcome>; complete(key:string,responseHash:string):Promise<void>; }
export interface RuntimeTransactionPort { transaction<T>(context:RuntimeTransactionContext,operation:(context:RuntimeTransactionContext)=>Promise<T>):Promise<T>; }
export async function executeRuntimeIdempotent<T>(tx:RuntimeTransactionPort, idem:RuntimeIdempotencyPort, context:RuntimeTransactionContext, operation:(context:RuntimeTransactionContext)=>Promise<T>):Promise<{status:"EXECUTED"|"REPLAY";value?:T}> {
 const outcome=await idem.begin(context.idempotencyKey,context.requestHash);
 if(outcome==="REPLAY") return {status:"REPLAY"};
 if(outcome==="CONFLICT") throw new Error("IDEMPOTENCY_CONFLICT");
 const value=await tx.transaction(context,operation);
 await idem.complete(context.idempotencyKey,"COMPLETED");
 return {status:"EXECUTED",value};
}