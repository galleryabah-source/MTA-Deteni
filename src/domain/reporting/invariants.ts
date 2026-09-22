import { DomainError } from "../shared/errors.js";
import type { ReportingSnapshot } from "./snapshot.js";
export function assertReportingSource(input:{sourceRevision:string;authorized:boolean}):void {
 if(!input.authorized) throw new DomainError("FORBIDDEN_SCOPE","Actor is not authorized for reporting.");
 if(!input.sourceRevision.trim()) throw new DomainError("VALIDATION_FAILED","Reporting source revision is required.");
}
export function assertSnapshotIntegrity(snapshot:ReportingSnapshot,expectedCanonical:string):void {
 if(snapshot.rows.length===0) throw new DomainError("VALIDATION_FAILED","Reporting snapshot cannot be empty.");
 const actual=JSON.stringify({snapshotId:snapshot.snapshotId,generatedAt:snapshot.generatedAt,sourceRevision:snapshot.sourceRevision,rows:snapshot.rows});
 if(actual!==expectedCanonical) throw new DomainError("INTEGRITY_FAILURE","Reporting snapshot canonical representation mismatch.");
}
export function assertSourceRevisionStable(before:string,after:string):void {
 if(before!==after) throw new DomainError("STALE_STATE","Reporting source revision changed during snapshot generation.",true);
}
