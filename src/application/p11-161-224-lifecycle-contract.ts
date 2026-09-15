import type { TemporaryExitState } from "../domain/shared/contracts.js";

export type LifecycleEvent = Readonly<{
  checkpoint: string;
  state: TemporaryExitState;
  headcountDelta: number;
  qrContext?: "TEMPORARY_EXIT";
  outcome?: "ACCEPTED" | "REJECTED" | "EXPIRED" | "FUTURE" | "CONTEXT_MISMATCH" | "INACTIVE";
}>;

export type LifecycleContract = Readonly<{ contractId: string; target: "SYNTHETIC"; events: readonly LifecycleEvent[] }>;

const expected: readonly TemporaryExitState[] = ["REQUESTED", "VALIDATED", "APPROVED", "DOCUMENTED", "ESCORT_ASSIGNED", "DEPARTED", "RETURN_PENDING", "RETURNED", "COMPLETED"];

export function defaultSyntheticLifecycle(): readonly LifecycleEvent[] {
  return expected.map((state, index) => ({
    checkpoint: `P${161 + index * 8}-${168 + index * 8}`,
    state,
    headcountDelta: state === "DEPARTED" ? -1 : state === "RETURNED" ? 1 : 0,
    ...(state === "DEPARTED" ? { qrContext: "TEMPORARY_EXIT" as const, outcome: "ACCEPTED" as const } : {}),
  }));
}

function validEvent(event: LifecycleEvent, index: number): boolean {
  if (event.state !== expected[index] || !event.checkpoint.trim()) return false;
  if (event.state === "DEPARTED") return event.headcountDelta === -1 && event.qrContext === "TEMPORARY_EXIT" && event.outcome === "ACCEPTED";
  if (event.state === "RETURNED") return event.headcountDelta === 1 && event.qrContext === undefined;
  return event.headcountDelta === 0 && event.qrContext === undefined && event.outcome === undefined;
}

export function validateLifecycleContract(contract: LifecycleContract): "READY" | "BLOCKED" {
  if (!contract.contractId.trim() || contract.target !== "SYNTHETIC" || contract.events.length !== expected.length) return "BLOCKED";
  return contract.events.every(validEvent) ? "READY" : "BLOCKED";
}
