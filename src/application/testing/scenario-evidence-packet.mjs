import { createHash } from "node:crypto";

export const SCENARIO_EVIDENCE_PACKET_VERSION = "P10.213-220-v1";

const sha256 = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

const REQUIRED_EVIDENCE = [
  "DETAINEE_CREATED",
  "PLACEMENT_ASSIGNED",
  "MOVEMENT_RECORDED",
  "LEAVE_CREATED",
  "LEAVE_APPROVED",
  "DOCUMENT_GENERATED",
  "ESCORT_ASSIGNED",
  "DEPARTED",
  "RETURNED",
  "COMPLETED",
];

export function composeScenarioEvidencePacket(input) {
  if (!input.manifestFingerprint) throw new Error("MANIFEST_FINGERPRINT_REQUIRED");
  if (!input.readinessFingerprint) throw new Error("READINESS_FINGERPRINT_REQUIRED");
  if (input.syntheticOnly !== true) throw new Error("EVIDENCE_MUST_BE_SYNTHETIC");
  if (!Array.isArray(input.events) || input.events.length !== REQUIRED_EVIDENCE.length) {
    throw new Error("EVIDENCE_EVENT_COUNT_INVALID");
  }

  const seen = new Set();
  for (const [index, event] of input.events.entries()) {
    if (!event || event.type !== REQUIRED_EVIDENCE[index]) {
      throw new Error(`EVIDENCE_ORDER_INVALID:${index}`);
    }
    if (typeof event.eventId !== "string" || !event.eventId.trim()) {
      throw new Error(`EVIDENCE_EVENT_ID_INVALID:${index}`);
    }
    if (seen.has(event.eventId)) throw new Error(`EVIDENCE_EVENT_ID_DUPLICATE:${event.eventId}`);
    seen.add(event.eventId);
    if (event.subjectId !== input.subjectId) {
      throw new Error(`EVIDENCE_SUBJECT_MISMATCH:${event.eventId}`);
    }
  }

  const payload = {
    version: SCENARIO_EVIDENCE_PACKET_VERSION,
    scenarioId: input.scenarioId,
    subjectId: input.subjectId,
    manifestFingerprint: input.manifestFingerprint,
    readinessFingerprint: input.readinessFingerprint,
    events: input.events.map(({eventId,type,subjectId,sourceId,verified}) => ({
      eventId,type,subjectId,sourceId,verified: verified === true,
    })),
    controls: {
      auditRequired: true,
      outboxRequired: true,
      productionMutation: false,
      externalTransport: false,
    },
  };

  return {
    ...payload,
    packetFingerprint: sha256(payload),
  };
}

export function verifyScenarioEvidencePacket(packet) {
  try {
    const rebuilt = composeScenarioEvidencePacket({
      ...packet,
      syntheticOnly: true,
    });
    return rebuilt.packetFingerprint === packet.packetFingerprint;
  } catch {
    return false;
  }
}

export { REQUIRED_EVIDENCE };
