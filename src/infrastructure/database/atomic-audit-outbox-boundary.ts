export const ATOMIC_AUDIT_OUTBOX_VERSION = "P9.30-v1";
export interface AtomicPersistencePorts { transaction<T>(operation:()=>Promise<T>):Promise<T>; auditAvailable():Promise<boolean>; appendAudit():Promise<void>; appendOutbox():Promise<void>; mutate():Promise<void>; }
export async function executeAtomicCriticalMutation(p:AtomicPersistencePorts):Promise<"EXECUTED"|"FAILED_SAFE"> {
 if(!await p.auditAvailable()) return "FAILED_SAFE";
 try { await p.transaction(async()=>{ await p.mutate(); await p.appendAudit(); await p.appendOutbox(); }); return "EXECUTED"; }
 catch { return "FAILED_SAFE"; }
}