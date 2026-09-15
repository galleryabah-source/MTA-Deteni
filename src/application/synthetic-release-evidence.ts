export type ExecutionEvidenceStatus = "PASS" | "FAIL" | "NOT_RUN";

export type SyntheticExecutionEvidence = Readonly<{
  id: string;
  checkpoint: string;
  control: string;
  status: ExecutionEvidenceStatus;
  target: "SYNTHETIC";
  command: string;
  exitCode: number | null;
  observedAt: string;
  outputDigest: string;
}>;

export type SyntheticEvidencePacket = Readonly<{
  packetId: string;
  target: "SYNTHETIC";
  generatedAt: string;
  controls: readonly SyntheticExecutionEvidence[];
}>;

export function createSyntheticExecutionEvidence(
  checkpoint: string,
  control: string,
  command: string,
  status: ExecutionEvidenceStatus = "PASS",
  exitCode: number | null = 0,
  outputDigest = "synthetic://output/empty",
): SyntheticExecutionEvidence {
  return {
    id: `EXEC-${checkpoint.replace(/[^A-Z0-9]+/gi, "-")}-${control.replace(/[^A-Z0-9]+/gi, "-")}`,
    checkpoint,
    control,
    status,
    target: "SYNTHETIC",
    command,
    exitCode,
    observedAt: new Date(0).toISOString(),
    outputDigest,
  };
}

export function evaluateSyntheticEvidencePacket(packet: SyntheticEvidencePacket): "READY" | "BLOCKED" {
  if (packet.target !== "SYNTHETIC" || packet.controls.length === 0 || packet.packetId.trim().length === 0) return "BLOCKED";
  return packet.controls.every((evidence) =>
    evidence.target === "SYNTHETIC" &&
    evidence.id.trim().length > 0 &&
    evidence.checkpoint.trim().length > 0 &&
    evidence.control.trim().length > 0 &&
    evidence.command.trim().length > 0 &&
    evidence.outputDigest.trim().length > 0 &&
    evidence.status === "PASS" &&
    evidence.exitCode === 0,
  ) ? "READY" : "BLOCKED";
}
