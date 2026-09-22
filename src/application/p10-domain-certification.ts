export const P10_DOMAIN_CERTIFICATION_VERSION="P10-DOMAIN-CERT-v1";
export const P10_DOMAIN_CERTS=Object.freeze([
 "DETAINEE","PLACEMENT","MOVEMENT","TEMPORARY_EXIT","DOCUMENT_EVIDENCE","ESCORT","APPROVAL","INTEGRATION","DEPORTATION","REPORTING"
] as const);
export type P10DomainCertification=Readonly<Record<(typeof P10_DOMAIN_CERTS)[number],boolean>>;
export function assertP10DomainCertification(result:P10DomainCertification):void {
 for(const key of P10_DOMAIN_CERTS) if(result[key]!==true) throw new Error(`P10_DOMAIN_CERT_INCOMPLETE:${key}`);
}
export function assertNoSchemaMutation(input:{migrationExecuted:boolean}):void {
 if(input.migrationExecuted) throw new Error("P10_SCHEMA_MUTATION_FORBIDDEN");
}
