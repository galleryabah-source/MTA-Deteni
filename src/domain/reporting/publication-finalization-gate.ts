export const PUBLICATION_FINALIZATION_GATE_VERSION = "P13.16681-16800-v1";

export type FinalizationDecision = "BLOCKED";

export interface TransportGatedPublication {
  publicationId: string;
  projectionId: string;
  certificationId: string;
  sourceFingerprint: string;
  admissionFingerprint: string;
  transportFingerprint: string;
  syntheticOnly: true;
  externalTransport: false;
  durablePublication: false;
}

export interface FinalizationGateResult {
  version: string;
  decision: FinalizationDecision;
  publicationId: string;
  finalizationFingerprint: string;
  durablePublication: false;
  reasonCode:
    | "FINALIZATION_NOT_AUTHORIZED"
    | "TRANSPORT_IDENTITY_INVALID";
}

function required(value: unknown, name: string): void {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("INVALID_" + name.toUpperCase());
  }
}

export function evaluatePublicationFinalizationGate(
  input: TransportGatedPublication,
): FinalizationGateResult {
  required(input.publicationId, "publicationId");
  required(input.projectionId, "projectionId");
  required(input.certificationId, "certificationId");
  required(input.sourceFingerprint, "sourceFingerprint");
  required(input.admissionFingerprint, "admissionFingerprint");
  required(input.transportFingerprint, "transportFingerprint");

  const identityOk =
    input.syntheticOnly === true &&
    input.externalTransport === false &&
    input.durablePublication === false;

  return {
    version: PUBLICATION_FINALIZATION_GATE_VERSION,
    decision: "BLOCKED",
    publicationId: input.publicationId,
    finalizationFingerprint: JSON.stringify(input),
    durablePublication: false,
    reasonCode: identityOk
      ? "FINALIZATION_NOT_AUTHORIZED"
      : "TRANSPORT_IDENTITY_INVALID",
  };
}
