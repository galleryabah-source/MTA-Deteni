export type QrScanContext = "RUDENIM_STAY" | "TEMPORARY_EXIT" | "DEPORTATION";
export type QrScanOutcome = "ACCEPTED" | "REJECTED" | "EXPIRED" | "FUTURE" | "CONTEXT_MISMATCH" | "INACTIVE";

export type QrVerificationResult = Readonly<{
  outcome: QrScanOutcome;
  context: QrScanContext;
  detaineeId?: string;
  nextAction: "CONTINUE" | "STOP" | "REVIEW";
}>;

export function createQrResult(context: QrScanContext, outcome: QrScanOutcome, detaineeId?: string): QrVerificationResult {
  const nextAction = outcome === "ACCEPTED" ? "CONTINUE" : outcome === "CONTEXT_MISMATCH" ? "REVIEW" : "STOP";
  return { context, outcome, nextAction, ...(detaineeId ? { detaineeId } : {}) };
}
