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


export function verifyQrScan(input: {
  payload: { context: QrContextLike; detaineeId: string; issuedAt: string; expiresAt?: string };
  expectedContext: QrScanContext;
  now?: string;
  activeDetainee?: boolean;
}): QrVerificationResult {
  const now = new Date(input.now ?? new Date().toISOString()).getTime();
  const issued = new Date(input.payload.issuedAt).getTime();
  const expires = input.payload.expiresAt ? new Date(input.payload.expiresAt).getTime() : undefined;
  if (!Number.isFinite(issued) || (expires !== undefined && !Number.isFinite(expires))) {
    return createQrResult(input.expectedContext, "REJECTED", input.payload.detaineeId);
  }
  if (issued > now) return createQrResult(input.expectedContext, "FUTURE", input.payload.detaineeId);
  if (expires !== undefined && now >= expires) return createQrResult(input.expectedContext, "EXPIRED", input.payload.detaineeId);
  if (input.expectedContext === "RUDENIM_STAY" && input.payload.context !== "DETAINEE") {
    return createQrResult(input.expectedContext, "CONTEXT_MISMATCH", input.payload.detaineeId);
  }
  if (input.expectedContext === "TEMPORARY_EXIT" && input.payload.context !== "TEMPORARY_EXIT") {
    return createQrResult(input.expectedContext, "CONTEXT_MISMATCH", input.payload.detaineeId);
  }
  if (input.expectedContext === "DEPORTATION" && input.payload.context !== "DEPORTATION") {
    return createQrResult(input.expectedContext, "CONTEXT_MISMATCH", input.payload.detaineeId);
  }
  if (input.activeDetainee === false) return createQrResult(input.expectedContext, "INACTIVE", input.payload.detaineeId);
  return createQrResult(input.expectedContext, "ACCEPTED", input.payload.detaineeId);
}

export type QrContextLike = "DETAINEE" | "BLOCK" | "TEMPORARY_EXIT" | "DEPORTATION";
