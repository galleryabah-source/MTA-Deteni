export type PublicationRequestAdmissionState =
  | "ADMITTED"
  | "REPLAY"
  | "CONFLICT"
  | "REJECTED";

export type PublicationRequestAdmissionReason =
  | "NEW_REQUEST"
  | "IDEMPOTENT_REPLAY"
  | "FINGERPRINT_CONFLICT"
  | "INCOMPLETE_CHAIN"
  | "IDENTITY_DRIFT"
  | "NON_SYNTHETIC"
  | "NOT_READY";

export type PublicationRequestAdmissionInput = Readonly<{
  requestId: string;
  publicationRequestId: string;
  publicationFingerprint: string;
  projectionId: string;
  certificationId: string;
  readinessState: "READY_FOR_PUBLICATION";
  syntheticOnly: true;
}>;

export type PublicationRequestAdmission = Readonly<
  PublicationRequestAdmissionInput & {
    admissionId: string;
    state: PublicationRequestAdmissionState;
    reason: PublicationRequestAdmissionReason;
    externalTransportAllowed: false;
    durablePublicationAllowed: false;
  }
>;

const registry = new Map<string, string>();

function requireText(value: string, field: string): void {
  if (!value.trim()) throw new Error(`${field} must be non-empty`);
}

export function admitPublicationRequest(
  input: PublicationRequestAdmissionInput,
): PublicationRequestAdmission {
  requireText(input.requestId, "requestId");
  requireText(input.publicationRequestId, "publicationRequestId");
  requireText(input.publicationFingerprint, "publicationFingerprint");
  requireText(input.projectionId, "projectionId");
  requireText(input.certificationId, "certificationId");

  if (input.syntheticOnly !== true) {
    return build(input, "REJECTED", "NON_SYNTHETIC");
  }
  if (input.readinessState !== "READY_FOR_PUBLICATION") {
    return build(input, "REJECTED", "NOT_READY");
  }

  const previous = registry.get(input.publicationRequestId);
  if (previous === input.publicationFingerprint) {
    return build(input, "REPLAY", "IDEMPOTENT_REPLAY");
  }
  if (previous !== undefined) {
    return build(input, "CONFLICT", "FINGERPRINT_CONFLICT");
  }

  registry.set(input.publicationRequestId, input.publicationFingerprint);
  return build(input, "ADMITTED", "NEW_REQUEST");
}

function build(
  input: PublicationRequestAdmissionInput,
  state: PublicationRequestAdmissionState,
  reason: PublicationRequestAdmissionReason,
): PublicationRequestAdmission {
  return Object.freeze({
    ...input,
    admissionId: `P13-ADMISSION-${input.publicationRequestId}`,
    state,
    reason,
    externalTransportAllowed: false,
    durablePublicationAllowed: false,
  });
}

export function resetPublicationRequestAdmissionRegistry(): void {
  registry.clear();
}

export function assertPublicationRequestAdmission(
  value: PublicationRequestAdmission,
): void {
  if (value.externalTransportAllowed !== false) {
    throw new Error("external transport must remain blocked");
  }
  if (value.durablePublicationAllowed !== false) {
    throw new Error("durable publication must remain blocked");
  }
  if (value.syntheticOnly !== true) {
    throw new Error("publication admission must remain synthetic-only");
  }
}
