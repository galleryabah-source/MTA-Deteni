export type QrContext = "DETAINEE" | "BLOCK" | "TEMPORARY_EXIT" | "DEPORTATION";

export type QrPayload = Readonly<{
  version: 1;
  context: QrContext;
  subjectId: string;
  detaineeId: string;
  issuedAt: string;
  expiresAt?: string;
}>;

export function createQrPayload(input: Omit<QrPayload, "version">): QrPayload {
  if (!input.subjectId.trim() || !input.detaineeId.trim()) throw new Error("QR identifiers are required.");
  if (!input.issuedAt.trim()) throw new Error("QR issuedAt is required.");
  if (input.expiresAt && input.expiresAt <= input.issuedAt) throw new Error("QR expiresAt must be after issuedAt.");
  return { version: 1, ...input };
}

export function assertQrOperation(payload: QrPayload, operation: "DISPLAY" | "TEMPORARY_EXIT_SCAN" | "DEPORTATION_SCAN"): void {
  const allowed = operation === "DISPLAY"
    ? payload.context === "DETAINEE" || payload.context === "BLOCK"
    : operation === "TEMPORARY_EXIT_SCAN"
      ? payload.context === "TEMPORARY_EXIT"
      : payload.context === "DEPORTATION";
  if (!allowed) throw new Error("QR context is not valid for this operation.");
}
