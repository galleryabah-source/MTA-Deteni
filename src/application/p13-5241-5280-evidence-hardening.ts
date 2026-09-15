import { createHash } from "node:crypto";

export type EvidenceIntegrity = Readonly<{
  algorithm: "SHA-256";
  canonicalPayload: string;
  digest: string;
}>;

export type ObservedControlEvidence = Readonly<{
  evidenceId: string;
  controlId: string;
  observedAt: string;
  outputIdentity: string;
  status: "PASS" | "FAIL" | "NOT_RUN";
  integrity: EvidenceIntegrity;
}>;

export function createEvidenceIntegrity(canonicalPayload: string): EvidenceIntegrity {
  if (!canonicalPayload.trim()) throw new Error("EVIDENCE_CANONICAL_PAYLOAD_REQUIRED");
  return {
    algorithm: "SHA-256",
    canonicalPayload,
    digest: createHash("sha256").update(canonicalPayload, "utf8").digest("hex"),
  };
}

export function assertObservedControlEvidence(input: ObservedControlEvidence): void {
  if (!input.evidenceId.trim() || !input.controlId.trim() || !input.observedAt.trim() || !input.outputIdentity.trim()) {
    throw new Error("OBSERVED_CONTROL_EVIDENCE_IDENTITY_REQUIRED");
  }
  if (input.status !== "PASS") throw new Error(`OBSERVED_CONTROL_EVIDENCE_NOT_PASS:${input.controlId}:${input.status}`);
  if (input.integrity.algorithm !== "SHA-256" || !input.integrity.canonicalPayload.trim() || !input.integrity.digest.trim()) {
    throw new Error("OBSERVED_CONTROL_EVIDENCE_INTEGRITY_REQUIRED");
  }
  const expected = createEvidenceIntegrity(input.integrity.canonicalPayload).digest;
  if (expected !== input.integrity.digest) throw new Error("OBSERVED_CONTROL_EVIDENCE_INTEGRITY_MISMATCH");
}
