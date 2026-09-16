import assert from "node:assert/strict";
import test from "node:test";
import { assessLocalRuntimeRecoveryExecutionAcknowledgementReplay } from "../src/application/local-runtime-recovery-execution-acknowledgement-replay.js";
import { certifyLocalRuntimeRecoveryExecutionAcknowledgement } from "../src/application/local-runtime-recovery-execution-acknowledgement-certification.js";

test("P13.13801-13920: acknowledgement identity/fingerprint replay is deterministic", () => {
  const acknowledgement = { acknowledgementId: "ACK-R", decisionFingerprint: "FP-R", acknowledged: true, syntheticOnly: true, certificationId: "CERT-R", executionId: "EXEC-R", dispatchId: "DISP-R", evidenceId: "E-R", decisionId: "DEC-R", requestId: "REQ-R" } as const;
  const registry = new Map<string, string>();
  const first = assessLocalRuntimeRecoveryExecutionAcknowledgementReplay({ acknowledgement, registry });
  const replay = assessLocalRuntimeRecoveryExecutionAcknowledgementReplay({ acknowledgement, registry });
  assert.equal(first.disposition, "ADMIT");
  assert.equal(replay.disposition, "REPLAY");
  assert.equal(replay.admitted, false);
  const conflict = assessLocalRuntimeRecoveryExecutionAcknowledgementReplay({ acknowledgement: { ...acknowledgement, decisionFingerprint: "FP-DRIFT" }, registry });
  assert.equal(conflict.disposition, "CONFLICT");
});

test("P13.13921-14040: acknowledgement certification rejects conflict and preserves identity", () => {
  const acknowledgement = { acknowledgementId: "ACK-C", decisionFingerprint: "FP-C", acknowledged: true, syntheticOnly: true, certificationId: "CERT-C", executionId: "EXEC-C", dispatchId: "DISP-C", evidenceId: "E-C", decisionId: "DEC-C", requestId: "REQ-C" } as const;
  const integrated = { certificationId: "CERT-C", executionId: "EXEC-C", dispatchId: "DISP-C", decisionFingerprint: "FP-C", admitted: true, certified: true, syntheticOnly: true } as const;
  const certified = certifyLocalRuntimeRecoveryExecutionAcknowledgement({ certificationId: "ACKCERT-C", acknowledgement, integratedCertification: integrated as never, replay: { acknowledgementId: "ACK-C", fingerprint: "FP-C", disposition: "ADMIT", admitted: true, syntheticOnly: true } });
  assert.equal(certified.certified, true);
  assert.throws(() => certifyLocalRuntimeRecoveryExecutionAcknowledgement({ certificationId: "ACKCERT-X", acknowledgement, integratedCertification: integrated as never, replay: { acknowledgementId: "ACK-C", fingerprint: "FP-DRIFT", disposition: "CONFLICT", admitted: false, syntheticOnly: true } }), /conflict|drift/i);
});
