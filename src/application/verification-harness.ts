import type { SyntheticExecutionEvidence, SyntheticEvidencePacket } from "./synthetic-release-evidence.js";

export type SyntheticVerificationStep = Readonly<{
  checkpoint: string;
  control: string;
  command: string;
}>;

export type SyntheticVerificationObservation = Readonly<{
  step: SyntheticVerificationStep;
  status: "PASS" | "FAIL" | "NOT_RUN";
  exitCode: number | null;
  outputDigest: string;
}>;

export type VerificationHarnessResult = Readonly<{
  harnessId: string;
  target: "SYNTHETIC";
  observations: readonly SyntheticVerificationObservation[];
  packet: SyntheticEvidencePacket;
}>;

function nonBlank(value: string): boolean {
  return value.trim().length > 0;
}

export function defaultSyntheticVerificationSteps(): readonly SyntheticVerificationStep[] {
  return [
    { checkpoint: "P10.969", control: "dependency-install", command: "npm install --ignore-scripts --no-audit --no-fund" },
    { checkpoint: "P10.970", control: "typecheck", command: "npm run typecheck" },
    { checkpoint: "P10.971", control: "integration-tests", command: "npm test" },
    { checkpoint: "P10.972", control: "unit-tests", command: "npm run test:unit" },
  ];
}

export function composeSyntheticEvidencePacket(
  harnessId: string,
  observations: readonly SyntheticVerificationObservation[],
  generatedAt = new Date(0).toISOString(),
): VerificationHarnessResult {
  const controls: SyntheticExecutionEvidence[] = observations.map((observation) => ({
    id: `EXEC-${observation.step.checkpoint}-${observation.step.control}`,
    checkpoint: observation.step.checkpoint,
    control: observation.step.control,
    status: observation.status,
    target: "SYNTHETIC",
    command: observation.step.command,
    exitCode: observation.exitCode,
    observedAt: generatedAt,
    outputDigest: observation.outputDigest,
  }));

  return {
    harnessId,
    target: "SYNTHETIC",
    observations,
    packet: { packetId: harnessId, target: "SYNTHETIC", generatedAt, controls },
  };
}

export function validateHarnessShape(result: VerificationHarnessResult): "READY" | "BLOCKED" {
  if (!nonBlank(result.harnessId) || result.target !== "SYNTHETIC") return "BLOCKED";
  if (result.observations.length === 0 || result.packet.controls.length !== result.observations.length) return "BLOCKED";
  if (result.packet.packetId !== result.harnessId || result.packet.target !== "SYNTHETIC") return "BLOCKED";

  return result.observations.every((observation, index) => {
    const evidence = result.packet.controls[index];
    return evidence !== undefined &&
      evidence.checkpoint === observation.step.checkpoint &&
      evidence.control === observation.step.control &&
      evidence.command === observation.step.command &&
      nonBlank(evidence.outputDigest) &&
      (evidence.status === "PASS" ? evidence.exitCode === 0 : true);
  }) ? "READY" : "BLOCKED";
}
