import assert from "node:assert/strict";
import test from "node:test";
import { getLocalRuntimeFailureMatrix } from "../src/application/local-runtime-failure-recovery-matrix.js";
import { createLocalRuntimeFailureEvidence } from "../src/application/local-runtime-failure-evidence.js";
import { createLocalRuntimeFailureObservation } from "../src/application/local-runtime-failure-observability.js";
import { certifyLocalRuntimeFailure } from "../src/application/local-runtime-failure-certification.js";
import { createLocalRuntimeRecoveryDisposition } from "../src/application/local-runtime-recovery-disposition.js";
import { certifyLocalRuntimeFailureRecoveryJourney } from "../src/application/local-runtime-failure-recovery-journey.js";
import { certifyLocalRuntimeSafetyEnvelope } from "../src/application/local-runtime-safety-certification.js";
import { createLocalRuntimeRecoveryDecision } from "../src/application/local-runtime-recovery-decision-integrity.js";
import { MemoryRecoveryDecisionRegistry, assertRecoveryDecisionReplayResult } from "../src/application/local-runtime-recovery-decision-replay.js";
import type { LocalRuntimeRequest, LocalRuntimeResponse } from "../src/application/local-runtime-adapter.js";
import type { OperationalSession } from "../src/application/offline-operational-session.js";
import type { RuntimeExecutionContext } from "../src/application/runtime-execution-boundary.js";

const context = { executionId: "EXEC-RP", runtimeMode: "LOCAL", deviceClass: "DESKTOP", networkScopeId: "NET-RP", certificationJourneyId: "J-RP", authenticated: true, syntheticOnly: true } as RuntimeExecutionContext;
const session = { sessionId: "S-RP", executionId: "EXEC-RP", deviceId: "DEV-RP", installationId: "INST-RP", networkScopeId: "NET-RP", runtimeMode: "LOCAL", state: "ACTIVE", syntheticOnly: true } as OperationalSession;
const request = { requestId: "REQ-RP", actorId: "ACT-RP", device: { deviceId: "DEV-RP", installationId: "INST-RP", networkScopeId: "NET-RP", deviceClass: "DESKTOP" }, method: "POST", path: "/mta-local/mutate", headers: {}, idempotencyKey: "IDEMP-RP", boundary: { serviceId: "SVC-RP", listenScope: "LOOPBACK_ONLY", allowsInternetExposure: false, requiresAuthenticatedDevice: true } } as LocalRuntimeRequest;

function makeEnvelope(index: number) {
  const entry = getLocalRuntimeFailureMatrix()[index];
  const evidence = createLocalRuntimeFailureEvidence({ evidenceId: `E-RP-${index}`, failureId: `F-RP-${index}`, failureClass: entry.failureClass, request, response: { requestId: request.requestId, status: "REJECTED", syntheticOnly: true } as LocalRuntimeResponse, session, context, observedAt: "2026-09-16T04:00:00Z" });
  const observation = createLocalRuntimeFailureObservation({ observationId: `O-RP-${index}`, evidence });
  const failure = certifyLocalRuntimeFailure({ certificationId: `C-RP-${index}`, evidence, observation, request });
  const disposition = createLocalRuntimeRecoveryDisposition({ dispositionId: `D-RP-${index}`, evidence, scenario: entry.scenario });
  const journey = certifyLocalRuntimeFailureRecoveryJourney({ journeyId: `J-RP-${index}`, scenario: entry.scenario, evidence, certification: failure, disposition });
  return certifyLocalRuntimeSafetyEnvelope({ envelopeId: `ENV-RP-${index}`, journey, certification: failure, disposition });
}

test("P13.12721-12840: identical decision replay is idempotent", () => {
  const envelope = makeEnvelope(0);
  const decision = createLocalRuntimeRecoveryDecision({ decisionId: "DEC-RP", envelope });
  const registry = new MemoryRecoveryDecisionRegistry();
  assert.equal(registry.admit(decision, envelope).action, "ADMIT");
  const replay = registry.admit(decision, envelope);
  assert.equal(replay.action, "REPLAY");
  assertRecoveryDecisionReplayResult(replay);
});

test("P13.12721-12840: same decision identity with different fingerprint is a conflict", () => {
  const firstEnvelope = makeEnvelope(0);
  const secondEnvelope = makeEnvelope(1);
  const registry = new MemoryRecoveryDecisionRegistry();
  const first = createLocalRuntimeRecoveryDecision({ decisionId: "DEC-CONFLICT", envelope: firstEnvelope });
  const second = createLocalRuntimeRecoveryDecision({ decisionId: "DEC-CONFLICT", envelope: secondEnvelope });
  assert.equal(registry.admit(first, firstEnvelope).action, "ADMIT");
  const conflict = registry.admit(second, secondEnvelope);
  assert.equal(conflict.action, "CONFLICT");
  assert.throws(() => assertRecoveryDecisionReplayResult(conflict), /requires review/i);
});
