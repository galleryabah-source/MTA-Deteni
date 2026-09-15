import type { TemporaryExitState } from "../domain/shared/contracts.js";

export type LifecycleEvent = Readonly<{
  checkpoint: string;
  state: TemporaryExitState;
  headcountDelta: number;
  qrContext?: "TEMPORARY_EXIT";
  outcome?: "ACCEPTED" | "REJECTED" | "EXPIRED" | "FUTURE" | "CONTEXT_MISMATCH" | "INACTIVE";
}>;

export type LifecycleContract = Readonly<{
  contractId: string;
  target: "SYNTHETIC";
  events: readonly LifecycleEvent[];
}>;

const expected: readonly TemporaryExitState[] = ["REQUESTED", "VALIDATED", "APPROVED", "DOCUMENTED", "ESCORT_ASSIGNED", "DEPARTED", "RETURN_PENDING", "RETURNED", "COMPLETED"];

export function defaultSyntheticLifecycle(): readonly LifecycleEvent[] {
  return expected.map((state, index) => ({
    checkpoint: `P${161 + index * 8}-${168 + index * 8}`,
    state,
    headcountDelta: state === "DEPARTED" ? -1 : state === "RETURNED" ? 1 : 0,
    ...(state === "DEPARTED" ? { qrContext: "TEMPORARY_EXIT" as const, outcome: "ACCEPTED" as const } : {}),
  }));
}

export function validateLifecycleContract(contract: LifecycleContract): "READY" | "BLOCKED" {
  if (!contract.contractId.trim() || contract.target !== "SYNTHETIC" || contract.events.length !== expected.length) return "BLOCKED";
  return contract.events.every((event, index) =>
    event.state === expected[index] &&
    event.checkpoint.trim().length > 0 &&
    (event.state === "DEPARTED" ? event.headcountDelta === -1 && event.qrContext === "TEMPORARY_EXIT" && event.outcome === "ACCEPTED" : event.headcountDelta === 0 || event.state === "RETURNED") &&
    (event.state === "RETURNED" ? event.headcountDelta === 1 : true) &&
    event.qrContext !== undefined ? event.qrContext === "TEMPORARY_EXIT" : true,
  ) ? "READY" : "BLOCKED";
}
