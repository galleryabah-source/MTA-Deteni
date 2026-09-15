import { evaluateReconciliation, type ReconciliationContract } from "./p11-353-448-reconciliation.js";

export type AggregateSnapshot = Readonly<{
  detaineeId: string;
  detaineeStatus: "ACTIVE" | "TRANSFERRED" | "DEPARTED" | "CLOSED";
  placementId: string;
  placementState: "PLACED" | "MOVED" | "EXITED" | "RETURNED";
  headcountIncluded: boolean;
}>;

export type CrossDomainComposition = Readonly<{
  contractId: string;
  target: "SYNTHETIC";
  aggregates: readonly AggregateSnapshot[];
  reconciliation: ReconciliationContract;
}>;

const nonBlank = (s: string) => s.trim().length > 0;

export function evaluateCrossDomainComposition(contract: CrossDomainComposition): "READY" | "BLOCKED" {
  if (!nonBlank(contract.contractId) || contract.target !== "SYNTHETIC" || contract.aggregates.length === 0) return "BLOCKED";
  if (evaluateReconciliation(contract.reconciliation) !== "READY") return "BLOCKED";
  const ids = new Set<string>();
  for (const aggregate of contract.aggregates) {
    if (!nonBlank(aggregate.detaineeId) || !nonBlank(aggregate.placementId) || ids.has(aggregate.detaineeId)) return "BLOCKED";
    ids.add(aggregate.detaineeId);
    if (aggregate.detaineeStatus === "CLOSED" && aggregate.headcountIncluded) return "BLOCKED";
    if (aggregate.detaineeStatus === "DEPARTED" && aggregate.headcountIncluded) return "BLOCKED";
    if (aggregate.placementState === "EXITED" && aggregate.headcountIncluded) return "BLOCKED";
    if (aggregate.placementState === "RETURNED" && !aggregate.headcountIncluded) return "BLOCKED";
  }
  return "READY";
}
