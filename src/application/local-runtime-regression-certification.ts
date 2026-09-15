import type { LocalRuntimeAuditEnvelope } from "./local-runtime-audit-envelope.js";
import type { LocalRuntimeObservation } from "./local-runtime-observability.js";
import type { LocalRuntimeSessionHandshake } from "./local-runtime-session-handshake.js";
import type { OperationalSession } from "./offline-operational-session.js";
import type { RuntimeExecutionContext } from "./runtime-execution-boundary.js";
import type { SessionContinuityProof } from "./local-runtime-session-continuity.js";
import { assertLocalRuntimeAuditEnvelope } from "./local-runtime-audit-envelope.js";
import { assertLocalRuntimeObservation, assertObservationMatchesAudit } from "./local-runtime-observability.js";
import { assertLocalRuntimeSessionHandshake } from "./local-runtime-session-handshake.js";
import { assertSessionContinuityProof, assertHandshakeReusableForSession } from "./local-runtime-session-continuity.js";

export type LocalRuntimeRegressionCertification = Readonly<{
  certificationId: string;
  evidenceId: string;
  observationId: string;
  handshakeId: string;
  sessionId: string;
  executionId: string;
  requestId: string;
  certified: true;
  syntheticOnly: true;
}>;

export function certifyLocalRuntimeRegression(input: {
  certificationId: string;
  audit: LocalRuntimeAuditEnvelope;
  observation: LocalRuntimeObservation;
  handshake: LocalRuntimeSessionHandshake;
  session: OperationalSession;
  context: RuntimeExecutionContext;
  continuityProof: SessionContinuityProof;
  now: string;
}): LocalRuntimeRegressionCertification {
  if (!input.certificationId.trim()) throw new Error("Local runtime regression certification identity is required.");
  assertLocalRuntimeAuditEnvelope(input.audit);
  assertLocalRuntimeObservation(input.observation);
  assertObservationMatchesAudit(input.observation, input.audit);
  assertLocalRuntimeSessionHandshake(input.handshake, input.now);
  assertSessionContinuityProof(input.continuityProof);
  assertHandshakeReusableForSession({ session: input.session, handshake: input.handshake, context: input.context, now: input.now });
  if (input.continuityProof.decision !== "READY") throw new Error("Local runtime regression requires READY session continuity.");
  if (input.continuityProof.sessionId !== input.session.sessionId || input.continuityProof.executionId !== input.context.executionId) throw new Error("Local runtime regression continuity identity drift.");
  if (input.audit.evidenceId !== input.observation.evidenceId || input.audit.requestId !== input.observation.requestId) throw new Error("Local runtime regression evidence binding drift.");
  if (input.audit.sessionId !== input.session.sessionId || input.audit.executionId !== input.context.executionId) throw new Error("Local runtime regression audit/session drift.");
  if (input.audit.deviceId !== input.session.deviceId || input.audit.installationId !== input.session.installationId || input.audit.networkScopeId !== input.session.networkScopeId) throw new Error("Local runtime regression device scope drift.");
  return Object.freeze({ certificationId: input.certificationId, evidenceId: input.audit.evidenceId, observationId: input.observation.observationId, handshakeId: input.handshake.handshakeId, sessionId: input.session.sessionId, executionId: input.context.executionId, requestId: input.audit.requestId, certified: true, syntheticOnly: true });
}
