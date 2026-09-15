export type PilotEvidenceStatus = "MISSING" | "PENDING" | "PASS" | "FAIL" | "WAIVED";

export type PilotEvidence = Readonly<{
  id: string;
  checkpoint: string;
  control: string;
  status: PilotEvidenceStatus;
  evidenceRef?: string;
  observedAt?: string;
  reviewer?: string;
  notes?: string;
}>;

export type PilotCertification = Readonly<{
  packetId: string;
  target: "SYNTHETIC" | "NON_PRODUCTION";
  migrationFreeze: true;
  productionAccess: false;
  aiEnabled: false;
  evidence: readonly PilotEvidence[];
}>;

export function evaluatePilotCertification(packet: PilotCertification): "READY" | "BLOCKED" {
  if (packet.target === "NON_PRODUCTION" && packet.migrationFreeze !== true) return "BLOCKED";
  if (packet.productionAccess || packet.aiEnabled) return "BLOCKED";
  return packet.evidence.every((item) => item.status === "PASS" || item.status === "WAIVED") ? "READY" : "BLOCKED";
}
