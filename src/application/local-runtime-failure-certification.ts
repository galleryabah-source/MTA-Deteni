import type { LocalRuntimeFailureEvidence } from "./local-runtime-failure-evidence.js";
import type { LocalRuntimeFailureObservation } from "./local-runtime-failure-observability.js";
import type { LocalRuntimeAuditEnvelope } from "./local-runtime-audit-envelope.js";
import { assertLocalRuntimeFailureEvidence, assertFailureEvidenceBoundary } from "./local-runtime-failure-evidence.js";
import { assertFailureObservationMatchesEvidence } from "./local-runtime-failure-observability.js";

export type LocalRuntimeFailureCertification = Readonly<{
  certificationId: string;
  evidenceId: string;
  observationId: string;
  failureId: string;
  failureClass: LocalRuntimeFailureEvidence["failureClass"];
  requestId: string;
  sessionId: string;
  executionId: string;
  certified: true;
  syntheticOnly: true;
}>;

export function certifyLocalRuntimeFailure(input: { certificationId: string; evidence: LocalRuntimeFailureEvidence; observation: LocalRuntimeFailureObservation; request: Parameters<typeof assertFailureEvidenceBoundary>[0]["request"]; audit?: LocalRuntimeAuditEnvelope }): LocalRuntimeFailureCertification {
  if (!input.certificationId.trim()) throw new Error("Local runtime failure certification identity is required.");
  assertLocalRuntimeFailureEvidence(input.evidence);
  assertFailureEvidenceBoundary({ evidence: input.evidence, audit: input.audit, request: input.request });
  assertFailureObservationMatchesEvidence(input.observation, input.evidence);
  return Object.freeze({ certificationId: input.certificationId, evidenceId: input.evidence.evidenceId, observationId: input.observation.observationId, failureId: input.evidence.failureId, failureClass: input.evidence.failureClass, requestId: input.evidence.requestId, sessionId: input.evidence.sessionId, executionId: input.evidence.executionId, certified: true, syntheticOnly: true });
}
