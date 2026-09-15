export type QrContext = "RUDENIM_STAY" | "TEMPORARY_EXIT" | "DEPORTATION";

export type OperationalQr = Readonly<{
  detaineeId: string;
  issuedAt: string;
  validUntil?: string;
  context: QrContext;
  active: boolean;
}>;

export function isOperationalQrUsable(qr: OperationalQr, nowIso: string, requestedContext: QrContext): boolean {
  if (!qr.active || qr.detaineeId.trim() === "") return false;
  if (qr.context !== requestedContext && !(qr.context === "RUDENIM_STAY" && requestedContext === "RUDENIM_STAY")) return false;
  if (qr.validUntil && nowIso >= qr.validUntil) return false;
  return nowIso >= qr.issuedAt;
}

export type ReportSnapshot = Readonly<{
  snapshotId: string;
  capturedAt: string;
  detaineeCount: number;
  sourceVersion: string;
}>;

export function assertReportSnapshot(snapshot: ReportSnapshot): void {
  if (!snapshot.snapshotId || !snapshot.sourceVersion) throw new Error("REPORT_SNAPSHOT_METADATA_REQUIRED");
  if (!Number.isInteger(snapshot.detaineeCount) || snapshot.detaineeCount < 0) throw new Error("REPORT_SNAPSHOT_COUNT_INVALID");
}
