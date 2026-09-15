export type PlacementRecord = Readonly<{
  detaineeId: string;
  placementId: string;
  state: "PLACED" | "MOVED" | "EXITED" | "RETURNED";
}>;

export type MovementEvent = Readonly<{
  eventId: string;
  detaineeId: string;
  fromPlacementId: string | null;
  toPlacementId: string | null;
  kind: "MOVE" | "TEMPORARY_EXIT_DEPARTURE" | "TEMPORARY_EXIT_RETURN" | "DEPARTURE";
  headcountDelta: number;
}>;

export type ReconciliationObservation = Readonly<{
  checkpoint: string;
  detaineeId: string;
  placement: PlacementRecord;
  movementEvents: readonly MovementEvent[];
  expectedHeadcount: number;
  observedHeadcount: number;
}>;

export type ReconciliationContract = Readonly<{
  contractId: string;
  target: "SYNTHETIC";
  observations: readonly ReconciliationObservation[];
}>;

const integer = (n: number) => Number.isInteger(n);
const nonNegative = (n: number) => integer(n) && n >= 0;
const nonBlank = (s: string) => s.trim().length > 0;

export function evaluateReconciliation(contract: ReconciliationContract): "READY" | "BLOCKED" {
  if (!nonBlank(contract.contractId) || contract.target !== "SYNTHETIC" || contract.observations.length === 0) return "BLOCKED";
  return contract.observations.every((o) => {
    if (!nonBlank(o.detaineeId) || o.placement.detaineeId !== o.detaineeId || !nonBlank(o.placement.placementId)) return false;
    if (!nonNegative(o.expectedHeadcount) || !nonNegative(o.observedHeadcount) || o.expectedHeadcount !== o.observedHeadcount) return false;
    if (o.movementEvents.some((e) => !nonBlank(e.eventId) || e.detaineeId !== o.detaineeId || !integer(e.headcountDelta))) return false;
    const delta = o.movementEvents.reduce((sum, e) => sum + e.headcountDelta, 0);
    return o.placement.state !== "EXITED" || delta <= 0;
  }) ? "READY" : "BLOCKED";
}
