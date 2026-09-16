import test from "node:test";
import assert from "node:assert/strict";
import { createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure.js";
import { replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure, resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureReplayRegistry } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-replay.js";
import { certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure } from "../src/application/local-runtime-recovery-operational-audit-publication-dispatch-authorization-decision-evidence-closure-certification.js";

type Certification = Parameters<typeof createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure>[0]["decisionCertification"];
type Evidence = Parameters<typeof createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure>[0]["evidence"];

function certification(overrides: Partial<Certification> = {}): Certification {
  return { certificationId: "decision-cert-1", decisionId: "decision-1", authorizationCertificationId: "auth-cert-1", authorizationId: "auth-1", candidateId: "candidate-1", requestId: "request-1", publicationCertificationId: "publication-cert-1", publicationId: "publication-1", decisionFingerprint: "fp-1", decisionState: "REVIEW_REQUIRED", authorizationGranted: false, dispatchApproved: false, externalTransportRequested: false, dispatchExecuted: false, syntheticOnly: true, replayDisposition: "ADMIT", certified: true, ...overrides } as Certification;
}

function evidence(overrides: Partial<Evidence> = {}): Evidence {
  return { evidenceId: "evidence-1", decisionCertificationId: "decision-cert-1", decisionId: "decision-1", authorizationCertificationId: "auth-cert-1", authorizationId: "auth-1", candidateId: "candidate-1", requestId: "request-1", publicationCertificationId: "publication-cert-1", publicationId: "publication-1", decisionFingerprint: "fp-1", evidenceState: "READY_FOR_REVIEW", authorizationGranted: false, dispatchApproved: false, externalTransportRequested: false, dispatchExecuted: false, syntheticOnly: true, ...overrides } as Evidence;
}

test("P13.18241–18400 closes evidence without granting or executing", () => {
  const c = certification();
  const e = evidence();
  const closure = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure({ closureId: "closure-1", evidence: e, decisionCertification: c });
  assert.equal(closure.closureState, "CLOSED_FOR_REVIEW");
  assert.equal(closure.authorizationGranted, false);
  assert.equal(closure.dispatchApproved, false);
  assert.equal(closure.externalTransportRequested, false);
  assert.equal(closure.dispatchExecuted, false);
  assert.equal(closure.durablePublicationCreated, false);
});

test("P13.18241–18400 closure replay is ADMIT then REPLAY", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureReplayRegistry();
  const c = certification();
  const closure = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure({ closureId: "closure-2", evidence: evidence({ evidenceId: "evidence-2" }), decisionCertification: c });
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure({ closure, decisionCertification: c }), "ADMIT");
  assert.equal(replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure({ closure, decisionCertification: c }), "REPLAY");
});

test("P13.18241–18400 closure rejects fingerprint drift", () => {
  const c = certification();
  const closure = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure({ closureId: "closure-3", evidence: evidence({ evidenceId: "evidence-3" }), decisionCertification: c });
  const drifted = { ...closure, decisionFingerprint: "fp-drift" } as typeof closure;
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureReplayRegistry();
  assert.throws(() => replayLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure({ closure: drifted, decisionCertification: c }));
});

test("P13.18241–18400 certification is immutable and remains non-granting", () => {
  resetLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosureReplayRegistry();
  const c = certification();
  const closure = createLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure({ closureId: "closure-4", evidence: evidence({ evidenceId: "evidence-4" }), decisionCertification: c });
  const certified = certifyLocalRuntimeRecoveryOperationalAuditPublicationDispatchAuthorizationDecisionEvidenceClosure({ certificationId: "closure-cert-1", closure, evidence: closure, decisionCertification: c });
  assert.equal(certified.certified, true);
  assert.equal(certified.replayDisposition, "ADMIT");
  assert.equal(certified.durablePublicationCreated, false);
  assert.throws(() => { (certified as { dispatchApproved: boolean }).dispatchApproved = true; });
});
