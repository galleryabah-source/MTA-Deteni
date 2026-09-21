import { createHash } from "node:crypto";

export const ACTIVATION_EVIDENCE_PACKET_VERSION = "P10.309-316-v1";

const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

const REQUIRED = [
  "runtimeReadiness",
  "operatorApproval",
  "changeWindow",
  "rollbackVerified",
  "observabilityReady",
  "backupVerified",
  "securityPassed",
  "artifactIntegrityPassed",
];

export function buildActivationEvidencePacket(input) {
  for (const key of REQUIRED) {
    if (input?.[key] !== true) throw new Error(`ACTIVATION_EVIDENCE_MISSING:${key}`);
  }

  const packet = {
    version: ACTIVATION_EVIDENCE_PACKET_VERSION,
    status: "ACTIVATION_EVIDENCE_COMPLETE",
    gates: Object.fromEntries(REQUIRED.map((key) => [key, true])),
    controls: {
      executionAuthorized: false,
      productionCertified: false,
      productionMutation: false,
      externalTransport: false,
    },
  };

  return { ...packet, packetFingerprint: hash(packet) };
}
