export type IntegrityStatus = "PASS" | "FAIL";

export type IntegrityObservation = Readonly<{
  checkpoint: string;
  control: string;
  status: IntegrityStatus;
  identity: string;
  digest: string;
  details: string;
}>;

export type IntegrityGate = Readonly<{
  gateId: string;
  target: "SYNTHETIC";
  observations: readonly IntegrityObservation[];
}>;

function nonBlank(value: string): boolean {
  return value.trim().length > 0;
}

export function evaluateIntegrityGate(gate: IntegrityGate): "READY" | "BLOCKED" {
  if (!nonBlank(gate.gateId) || gate.target !== "SYNTHETIC" || gate.observations.length === 0) return "BLOCKED";
  return gate.observations.every((observation) =>
    nonBlank(observation.checkpoint) &&
    nonBlank(observation.control) &&
    observation.status === "PASS" &&
    nonBlank(observation.identity) &&
    nonBlank(observation.digest) &&
    nonBlank(observation.details),
  ) ? "READY" : "BLOCKED";
}
