export type EvidenceStatus = "PASS" | "FAIL" | "NOT_RUN";

export type VerificationEvidence = Readonly<{
  id: string;
  checkpoint: string;
  control: string;
  status: EvidenceStatus;
  target: "SYNTHETIC" | "NON_PRODUCTION";
  observedAt: string;
  evidenceRef?: string;
  notes?: string;
}>;

export type EvidencePacket = Readonly<{
  packetId: string;
  generatedAt: string;
  target: "SYNTHETIC" | "NON_PRODUCTION";
  controls: readonly VerificationEvidence[];
}>;

export function evaluateEvidencePacket(packet: EvidencePacket): "READY" | "BLOCKED" {
  if (packet.target === "NON_PRODUCTION" && packet.controls.some((c) => c.target !== "NON_PRODUCTION")) return "BLOCKED";
  if (packet.controls.length === 0) return "BLOCKED";
  return packet.controls.every((c) => c.status === "PASS") ? "READY" : "BLOCKED";
}

export function createSyntheticEvidence(
  checkpoint: string,
  control: string,
  status: EvidenceStatus = "PASS",
): VerificationEvidence {
  return {
    id: `SYN-${checkpoint.replace(/[^A-Z0-9]+/gi, "-")}-${control.replace(/[^A-Z0-9]+/gi, "-")}`,
    checkpoint,
    control,
    status,
    target: "SYNTHETIC",
    observedAt: new Date(0).toISOString(),
    evidenceRef: `synthetic://${checkpoint}/${control}`,
  };
}
