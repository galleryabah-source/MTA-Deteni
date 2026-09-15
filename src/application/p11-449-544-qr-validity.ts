export type OperationalQrContext = "RUDENIM_STAY" | "TEMPORARY_EXIT" | "DEPORTATION";
export type OperationalQrState = "ACTIVE" | "EXPIRED" | "FUTURE" | "INACTIVE";

export type QrValidityObservation = Readonly<{
  checkpoint: string;
  context: OperationalQrContext;
  state: OperationalQrState;
  validFrom: string;
  validUntil: string;
  scannedAt: string;
}>;

export function evaluateQrValidityWindow(observation: QrValidityObservation): "ACCEPTED" | "REJECTED" {
  if (!observation.checkpoint.trim()) return "REJECTED";
  if (!observation.validFrom || !observation.validUntil || !observation.scannedAt) return "REJECTED";
  if (observation.validUntil <= observation.validFrom) return "REJECTED";
  const inside = observation.scannedAt >= observation.validFrom && observation.scannedAt <= observation.validUntil;
  return observation.state === "ACTIVE" && inside ? "ACCEPTED" : "REJECTED";
}

export function isContextCompatible(context: OperationalQrContext, operationalState: "RUDENIM_STAY" | "TEMPORARY_EXIT" | "DEPORTATION"): boolean {
  return context === operationalState;
}
