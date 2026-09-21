export const DOMAIN_REPOSITORY_CERTIFICATION_VERSION = "P9.25-v1";
export interface RepositoryEvidence { domain:string; mapping:"PASS"|"FAIL"|"MISSING"|"UNVERIFIED"; context:"PASS"|"FAIL"; transaction:"PASS"|"FAIL"; }
export function certifyDomainRepository(e: RepositoryEvidence): "CERTIFIED"|"NOT_CERTIFIED" {
 return e.mapping==="PASS" && e.context==="PASS" && e.transaction==="PASS" ? "CERTIFIED" : "NOT_CERTIFIED";
}