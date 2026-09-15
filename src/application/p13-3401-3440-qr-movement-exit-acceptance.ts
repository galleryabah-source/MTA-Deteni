export type QrOperationalContext = "RUDENIM_STAY" | "TEMPORARY_EXIT" | "DEPORTATION";

export type QrMovementEvidence = Readonly<{
  evidenceId: string;
  detaineeId: string;
  qrContext: QrOperationalContext;
  movementId: string;
  scannedAt: string;
  valid: boolean;
}>;

export function assertQrMovementEvidence(evidence: QrMovementEvidence): void {
  if (!evidence.evidenceId.trim() || !evidence.detaineeId.trim() || !evidence.movementId.trim() || !evidence.scannedAt.trim()) throw new Error("QR_MOVEMENT_EVIDENCE_IDENTITY_REQUIRED");
  if (!evidence.valid) throw new Error("QR_MOVEMENT_EVIDENCE_INVALID");
}

export function assertTemporaryExitContext(evidence: QrMovementEvidence): void {
  assertQrMovementEvidence(evidence);
  if (evidence.qrContext !== "TEMPORARY_EXIT") throw new Error("QR_TEMPORARY_EXIT_CONTEXT_REQUIRED");
}
