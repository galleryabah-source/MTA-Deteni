export const OBSERVABILITY_VERSION="P9.10-IMPLEMENTATION-v2";
const SENSITIVE_KEYS=new Set(["authorization","cookie","password","token","access_token","refresh_token","service_role","secret","api_key","apikey","private_key"]);

export function redactValue(value){
 if(value===null||value===undefined||typeof value!=="object")return value;
 if(Array.isArray(value))return value.map(redactValue);
 const out={};
 for(const [k,v] of Object.entries(value)){
  const key=k.toLowerCase();
  out[k]=key.includes("token")||SENSITIVE_KEYS.has(key)?"[REDACTED]":redactValue(v);
 }
 return out;
}

function required(input,key){if(typeof input?.[key]!=="string"||!input[key].trim())throw new Error("OBSERVABILITY_FIELD_REQUIRED:"+key);return input[key].trim();}

export function createObservabilityEvent(input){
 const eventName=required(input,"eventName"),requestId=required(input,"requestId"),correlationId=required(input,"correlationId"),occurredAt=required(input,"occurredAt");
 const level=input.level||"INFO";
 if(!["DEBUG","INFO","WARN","ERROR"].includes(level))throw new Error("OBSERVABILITY_LEVEL_INVALID");
 return Object.freeze({version:OBSERVABILITY_VERSION,eventName,requestId,correlationId,occurredAt,level,metadata:redactValue(input.metadata||{})});
}

export function assertObservabilityContinuity(event,context){
 for(const key of ["requestId","correlationId"])if(event?.[key]!==context?.[key])throw new Error("OBSERVABILITY_CONTEXT_MISMATCH:"+key);
 return true;
}

export function createMetricSample(input){
 const name=required(input,"name");
 if(!Number.isFinite(input.value))throw new Error("METRIC_VALUE_INVALID");
 return Object.freeze({name,value:input.value,requestId:required(input,"requestId"),correlationId:required(input,"correlationId"),occurredAt:required(input,"occurredAt")});
}
