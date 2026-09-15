import type { TemporaryExitState } from "../domain/shared/contracts.js";

export type OperationalQrContext = "RUDENIM_STAY" | "TEMPORARY_EXIT" | "DEPORTATION";

export type QrEvidenceBinding = Readonly<{
  qrId: string;
  detaineeId: string;
  context: OperationalQrContext;
  temporaryExitId?: string;
  state?: TemporaryExitState;
  validFrom: string;
  validUntil?: string;
  scannedAt?: string;
  verifiedBy: string;
}>;

export function validateQrEvidenceBinding(binding: QrEvidenceBinding): void {
  if (!binding.qrId.trim() || !binding.detaineeId.trim() || !binding.validFrom.trim() || !binding.verifiedBy.trim()) throw new Error("QR_EVIDENCE_IDENTITY_REQUIRED");
  if (binding.context === "TEMPORARY_EXIT" && (!binding.temporaryExitId || !binding.state)) throw new Error("QR_TEMPORARY_EXIT_CONTEXT_REQUIRED");
  if (binding.context === "DEPORTATION" && binding.state) throw new Error("QR_DEPORTATION_STATE_MUST_BE_SEPARATE");
  if (binding.validUntil && binding.validUntil < binding.validFrom) throw new Error("QR_VALIDITY_ORDER_INVALID");
}

export function assertQrScanWithinWindow(binding: QrEvidenceBinding, scannedAt: string): boolean {
  if (scannedAt < binding.validFrom) return false;
  if (binding.validUntil && scannedAt > binding.validUntil) return false;
  return true;
}
