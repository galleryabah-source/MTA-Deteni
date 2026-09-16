import type { LocalRuntimeFailureEvidence } from "./local-runtime-failure-evidence.js";
import type { LocalRuntimeFailureCertification } from "./local-runtime-failure-certification.js";
import type { LocalRuntimeRecoveryDispositionEvidence } from "./local-runtime-recovery-disposition.js";
import { resolveLocalRuntimeRecoveryDisposition, type LocalRuntimeFailureScenario } from "./local-runtime-failure-recovery-matrix.js";

export type LocalRuntimeFailureRecoveryJourney = Readonly<{
  journeyId: string;
  scenario: LocalRuntimeFailureScenario;
  evidenceId: string;
  certificationId: string;
  dispositionId: string;
  disposition: LocalRuntimeRecoveryDispositionEvidence["disposition"];
  terminal: boolean;
  retryAllowed: boolean;
  syntheticOnly: true;
}>;

export function certifyLocalRuntimeFailureRecoveryJourney(input: { journeyId: string; scenario: LocalRuntimeFailureScenario; evidence: LocalRuntimeFailureEvidence; certification: LocalRuntimeFailureCertification; disposition: LocalRuntimeRecoveryDispositionEvidence }): LocalRuntimeFailureRecoveryJourney {
  if (!input.journeyId.trim()) throw new Error("Local runtime failure recovery journey identity is required.");
  if (!input.evidence.syntheticOnly || !input.certification.syntheticOnly || !input.disposition.syntheticOnly) throw new Error("Local runtime failure recovery journey must be synthetic-only.");
  if (input.certification.evidenceId !== input.evidence.evidenceId || input.certification.failureId !== input.evidence.failureId) throw new Error("Local runtime recovery certification/evidence drift.");
  if (input.disposition.evidenceId !== input.evidence.evidenceId || input.disposition.failureId !== input.evidence.failureId) throw new Error("Local runtime recovery disposition/evidence drift.");
  if (input.disposition.scenario !== input.scenario) throw new Error("Local runtime recovery journey scenario drift.");
  const expected = resolveLocalRuntimeRecoveryDisposition({ scenario: input.scenario, failureClass: input.evidence.failureClass });
  if (input.disposition.disposition !== expected.disposition || input.disposition.retryAllowed !== expected.retryAllowed) throw new Error("Local runtime recovery journey disposition drift.");
  return Object.freeze({ journeyId: input.journeyId, scenario: input.scenario, evidenceId: input.evidence.evidenceId, certificationId: input.certification.certificationId, dispositionId: input.disposition.dispositionId, disposition: input.disposition.disposition, terminal: !input.disposition.retryAllowed, retryAllowed: input.disposition.retryAllowed, syntheticOnly: true });
}
