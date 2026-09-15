import type { ApplicationBoundaryGate } from "./p11-001-032-regression-gate.js";
import type { SyntheticEvidencePacket } from "./synthetic-release-evidence.js";
import { evaluateApplicationBoundaryGate } from "./p11-001-032-regression-gate.js";
import { evaluateSyntheticEvidencePacket } from "./synthetic-release-evidence.js";

export type IntegratedVerificationGate = Readonly<{
  gateId: string;
  target: "SYNTHETIC";
  applicationBoundary: "READY" | "BLOCKED";
  executionEvidence: "READY" | "BLOCKED";
  status: "READY" | "BLOCKED";
  findings: readonly string[];
}>;

function nonBlank(value: string): boolean { return value.trim().length > 0; }

export function composeIntegratedVerificationGate(
  gateId: string,
  applicationGate: ApplicationBoundaryGate,
  evidencePacket: SyntheticEvidencePacket,
): IntegratedVerificationGate {
  const applicationBoundary = evaluateApplicationBoundaryGate(applicationGate);
  const executionEvidence = evaluateSyntheticEvidencePacket(evidencePacket);
  const findings: string[] = [];
  if (applicationBoundary !== "READY") findings.push("application-boundary-blocked");
  if (executionEvidence !== "READY") findings.push("execution-evidence-blocked");
  if (applicationGate.target !== "SYNTHETIC") findings.push("application-target-mismatch");
  if (evidencePacket.target !== "SYNTHETIC") findings.push("evidence-target-mismatch");
  const status = nonBlank(gateId) && findings.length === 0 ? "READY" : "BLOCKED";
  return { gateId, target: "SYNTHETIC", applicationBoundary, executionEvidence, status, findings };
}

export function assertIntegratedVerificationGate(gate: IntegratedVerificationGate): "READY" | "BLOCKED" {
  if (!nonBlank(gate.gateId) || gate.target !== "SYNTHETIC") return "BLOCKED";
  if (gate.applicationBoundary !== "READY" || gate.executionEvidence !== "READY") return "BLOCKED";
  if (gate.findings.length !== 0 || gate.status !== "READY") return "BLOCKED";
  return "READY";
}
