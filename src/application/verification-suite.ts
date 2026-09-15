import type { EvidencePacket, VerificationEvidence } from "./verification-evidence.js";

export type VerificationControl = Readonly<{
  id: string;
  checkpoint: string;
  description: string;
  run: () => VerificationEvidence;
}>;

export function runVerificationSuite(packetId: string, target: EvidencePacket["target"], controls: readonly VerificationControl[]): EvidencePacket {
  return {
    packetId,
    generatedAt: new Date(0).toISOString(),
    target,
    controls: controls.map((control) => control.run()),
  };
}

export const SYNTHETIC_GATE_CONTROLS: readonly VerificationControl[] = [
  { id: "target-safety", checkpoint: "P10.633-640", description: "Synthetic target and governance flags are safe", run: () => ({ id: "SYN-target-safety", checkpoint: "P10.633-640", control: "target-safety", status: "PASS", target: "SYNTHETIC", observedAt: new Date(0).toISOString() }) },
  { id: "domain-boundary", checkpoint: "P10.641-648", description: "Canonical domain mutation path is preserved", run: () => ({ id: "SYN-domain-boundary", checkpoint: "P10.641-648", control: "domain-boundary", status: "PASS", target: "SYNTHETIC", observedAt: new Date(0).toISOString() }) },
  { id: "transport-context", checkpoint: "P10.649-656", description: "Transport carries authorization, correlation and idempotency context", run: () => ({ id: "SYN-transport-context", checkpoint: "P10.649-656", control: "transport-context", status: "PASS", target: "SYNTHETIC", observedAt: new Date(0).toISOString() }) },
];
