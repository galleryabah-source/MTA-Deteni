export const PUBLICATION_TRANSPORT_GATE_VERSION = "P13.16561-16680-v1";
export type TransportDecision = "READY" | "BLOCKED";
export interface AdmittedPublication { publicationId:string; projectionId:string; certificationId:string; sourceFingerprint:string; admissionFingerprint:string; syntheticOnly:true; externalTransport:false; durablePublication:false; }
export interface TransportGateResult { version:string; decision:TransportDecision; publicationId:string; transportFingerprint:string; externalTransport:false; durablePublication:false; reasonCode:"TRANSPORT_NOT_AUTHORIZED"|"ADMISSION_IDENTITY_INVALID"; }
function required(v:unknown,n:string){if(typeof v!=="string"||!v.trim()) throw new Error("INVALID_"+n.toUpperCase());}
export function evaluatePublicationTransportGate(input:AdmittedPublication):TransportGateResult {
 required(input.publicationId,"publicationId"); required(input.projectionId,"projectionId"); required(input.certificationId,"certificationId"); required(input.sourceFingerprint,"sourceFingerprint"); required(input.admissionFingerprint,"admissionFingerprint");
 const identityOk=input.syntheticOnly===true&&input.externalTransport===false&&input.durablePublication===false;
 return {version:PUBLICATION_TRANSPORT_GATE_VERSION,decision:"BLOCKED",publicationId:input.publicationId,transportFingerprint:JSON.stringify(input),externalTransport:false,durablePublication:false,reasonCode:identityOk?"TRANSPORT_NOT_AUTHORIZED":"ADMISSION_IDENTITY_INVALID"};
}