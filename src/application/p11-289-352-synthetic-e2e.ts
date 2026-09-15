import { evaluateOperationalConsistency, type OperationalConsistencyContract } from "./p11-225-288-operational-consistency.js";

export type SyntheticE2EStep = Readonly<{
  checkpoint: string;
  name: string;
  status: "PASS" | "FAIL";
}>;

export type SyntheticE2ERun = Readonly<{
  runId: string;
  target: "SYNTHETIC";
  steps: readonly SyntheticE2EStep[];
}>;

export function evaluateSyntheticE2E(contract: OperationalConsistencyContract, run: SyntheticE2ERun): "READY" | "BLOCKED" {
  if (!run.runId.trim() || run.target !== "SYNTHETIC" || run.steps.length === 0) return "BLOCKED";
  if (evaluateOperationalConsistency(contract) !== "READY") return "BLOCKED";
  return run.steps.every((step) => step.status === "PASS" && step.checkpoint.trim() && step.name.trim()) ? "READY" : "BLOCKED";
}
