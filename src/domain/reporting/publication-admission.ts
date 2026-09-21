export const PUBLICATION_ADMISSION_VERSION = "P13.16441-16560-v1";

export type AdmissionDecision = "ADMIT" | "REPLAY" | "CONFLICT" | "REJECT";

export interface PublicationCertification {
  publicationId: string;
  readinessState: "READY_FOR_PUBLICATION";
  projectionId: string;
  certificationId: string;
  sourceFingerprint: string;
  syntheticOnly: true;
}

export interface PublicationRequest {
  requestId: string;
  publicationId: string;
  projectionId: string;
  certificationId: string;
  sourceFingerprint: string;
  requestedAt: string;
  syntheticOnly: true;
}

export interface PublicationAdmission {
  version: string;
  decision: AdmissionDecision;
  requestId: string;
  publicationId: string;
  projectionId: string;
  certificationId: string;
  sourceFingerprint: string;
  admissionFingerprint: string;
  externalTransport: false;
  durablePublication: false;
}

const required = (value: unknown, name: string): string => {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`INVALID_${name.toUpperCase()}`);
  return value;
};

const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value as Record<string, unknown>).sort().map(k => `${JSON.stringify(k)}:${canonical((value as Record<string, unknown>)[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
};

export function fingerprintAdmission(input: Omit<PublicationAdmission, "admissionFingerprint">): string {
  let hash = 0;
  for (const ch of canonical(input)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash.toString(16).padStart(8, "0");
}

export function admitPublication(
  certification: PublicationCertification,
  request: PublicationRequest,
  prior?: PublicationAdmission
): PublicationAdmission {
  required(certification.publicationId, "publicationId");
  required(certification.projectionId, "projectionId");
  required(certification.certificationId, "certificationId");
  required(certification.sourceFingerprint, "sourceFingerprint");
  required(request.requestId, "requestId");
  required(request.publicationId, "publicationId");
  required(request.projectionId, "projectionId");
  required(request.certificationId, "certificationId");
  required(request.sourceFingerprint, "sourceFingerprint");

  if (certification.readinessState !== "READY_FOR_PUBLICATION") throw new Error("CERTIFICATION_NOT_READY");
  if (certification.syntheticOnly !== true || request.syntheticOnly !== true) throw new Error("NON_SYNTHETIC_STATE");
  if (request.publicationId !== certification.publicationId) throw new Error("PUBLICATION_ID_DRIFT");
  if (request.projectionId !== certification.projectionId) throw new Error("PROJECTION_ID_DRIFT");
  if (request.certificationId !== certification.certificationId) throw new Error("CERTIFICATION_ID_DRIFT");
  if (request.sourceFingerprint !== certification.sourceFingerprint) throw new Error("SOURCE_FINGERPRINT_DRIFT");

  const material: Omit<PublicationAdmission, "admissionFingerprint"> = {
    version: PUBLICATION_ADMISSION_VERSION,
    decision: "ADMIT",
    requestId: request.requestId,
    publicationId: request.publicationId,
    projectionId: request.projectionId,
    certificationId: request.certificationId,
    sourceFingerprint: request.sourceFingerprint,
    externalTransport: false,
    durablePublication: false
  };

  const fingerprint = fingerprintAdmission(material);
  if (prior) {
    const sameIdentity =
      prior.requestId === request.requestId &&
      prior.publicationId === request.publicationId &&
      prior.projectionId === request.projectionId &&
      prior.certificationId === request.certificationId &&
      prior.sourceFingerprint === request.sourceFingerprint;
    if (sameIdentity && prior.admissionFingerprint === fingerprint) return { ...material, decision: "REPLAY", admissionFingerprint: fingerprint };
    throw new Error("PUBLICATION_ADMISSION_CONFLICT");
  }
  return { ...material, admissionFingerprint: fingerprint };
}
