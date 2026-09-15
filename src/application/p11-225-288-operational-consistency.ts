export type PlacementState = "PLACED" | "MOVED" | "EXITED" | "RETURNED";
export type QrValidity = "ACTIVE" | "EXPIRED" | "FUTURE" | "INACTIVE" | "CONTEXT_MISMATCH";

export type OperationalObservation = Readonly<{
  checkpoint: string;
  detaineeId: string;
  placement: PlacementState;
  headcount: number;
  qrContext: "RUDENIM_STAY" | "TEMPORARY_EXIT" | "DEPORTATION";
  qrValidity: QrValidity;
}>;

export type OperationalConsistencyContract = Readonly<{
  contractId: string;
  target: "SYNTHETIC";
  observations: readonly OperationalObservation[];
}>;

function nonNegative(value: number): boolean { return Number.isInteger(value) && value >= 0; }
function nonBlank(value: string): boolean { return value.trim().length > 0; }

export function evaluateOperationalConsistency(contract: OperationalConsistencyContract): "READY" | "BLOCKED" {
  if (!nonBlank(contract.contractId) || contract.target !== "SYNTHETIC" || contract.observations.length === 0) return "BLOCKED";
  return contract.observations.every((o) => {
    if (!nonBlank(o.detaineeId) || !nonNegative(o.headcount)) return false;
    if (o.placement === "EXITED") return o.qrContext === "TEMPORARY_EXIT" && o.qrValidity === "ACTIVE";
    if (o.placement === "RETURNED") return o.qrContext === "RUDENIM_STAY" && o.qrValidity === "ACTIVE";
    return o.placement === "PLACED" || o.placement === "MOVED";
  }) ? "READY" : "BLOCKED";
}
