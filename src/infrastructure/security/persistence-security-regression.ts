export const PERSISTENCE_SECURITY_REGRESSION_VERSION = "P9.26-v1";
export interface PersistenceSecurityEvidence { rlsEnforced:boolean; serviceCredentialIsolated:boolean; auditMandatory:boolean; outboxAtomic:boolean; migrationFrozen:boolean; aiDisabled:boolean; }
export function evaluatePersistenceSecurity(e: PersistenceSecurityEvidence): "PASS"|"FAIL" {
 return e.rlsEnforced && e.serviceCredentialIsolated && e.auditMandatory && e.outboxAtomic && e.migrationFrozen && e.aiDisabled ? "PASS" : "FAIL";
}