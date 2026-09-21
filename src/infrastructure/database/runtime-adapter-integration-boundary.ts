export const RUNTIME_ADAPTER_INTEGRATION_VERSION = "P9.27-v1";
export type AdapterDecision = "READY"|"BLOCKED";
export interface RuntimeAdapterContext { environment:"DEVELOPMENT"|"TEST"|"STAGING"|"PRODUCTION"; role:"APP_RUNTIME"|"READONLY"|"MIGRATION"; connectionConfigured:boolean; secretsExternalized:boolean; }
export function evaluateRuntimeAdapter(c:RuntimeAdapterContext):AdapterDecision {
 if(!c.connectionConfigured || !c.secretsExternalized) return "BLOCKED";
 if(c.environment==="PRODUCTION" && c.role==="MIGRATION") return "BLOCKED";
 return "READY";
}