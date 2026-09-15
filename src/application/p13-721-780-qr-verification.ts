export type QRVerificationContext = "RUDENIM_STAY" | "TEMPORARY_EXIT" | "DEPORTATION";

export type QRVerificationRequest = Readonly<{
  scanId: string;
  qrToken: string;
  detaineeId: string;
  context: QRVerificationContext;
  scannedAt: string;
  validFrom: string;
  validUntil: string;
}>;

export type QRVerificationResult = Readonly<{
  scanId: string;
  detaineeId: string;
  context: QRVerificationContext;
  valid: boolean;
  reason: "VALID" | "TOKEN_REQUIRED" | "IDENTITY_MISMATCH" | "OUTSIDE_VALIDITY_WINDOW";
}>;

export function verifyOperationalQR(request: QRVerificationRequest): QRVerificationResult {
  if (!request.scanId.trim() || !request.detaineeId.trim() || !request.scannedAt.trim()) throw new Error("QR_VERIFICATION_IDENTITY_REQUIRED");
  if (!request.qrToken.trim()) return { scanId: request.scanId, detaineeId: request.detaineeId, context: request.context, valid: false, reason: "TOKEN_REQUIRED" };
  if (request.qrToken.includes("detainee:")) {
    const encoded = request.qrToken.split("detainee:")[1]?.split("|")[0];
    if (encoded && encoded !== request.detaineeId) return { scanId: request.scanId, detaineeId: request.detaineeId, context: request.context, valid: false, reason: "IDENTITY_MISMATCH" };
  }
  const scanned = Date.parse(request.scannedAt);
  const from = Date.parse(request.validFrom);
  const until = Date.parse(request.validUntil);
  if (![scanned, from, until].every(Number.isFinite) || scanned < from || scanned > until) return { scanId: request.scanId, detaineeId: request.detaineeId, context: request.context, valid: false, reason: "OUTSIDE_VALIDITY_WINDOW" };
  return { scanId: request.scanId, detaineeId: request.detaineeId, context: request.context, valid: true, reason: "VALID" };
}
