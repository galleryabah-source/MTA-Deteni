import type { LocalRuntimeRecoveryFinalClosureAuditEvidence } from "./local-runtime-recovery-final-closure-audit-evidence.js";
import { assertLocalRuntimeRecoveryFinalClosureAuditEvidence } from "./local-runtime-recovery-final-closure-audit-evidence.js";
import { replayLocalRuntimeRecoveryFinalClosureAuditEvidence, type FinalClosureAuditEvidenceReplayDisposition } from "./local-runtime-recovery-final-closure-audit-evidence-replay.js";
import type { LocalRuntimeRecoveryFinalClosureAuditCertification } from "./local-runtime-recovery-final-closure-audit-certification.js";
import type { LocalRuntimeRecoveryFinalClosureAuditRecord } from "./local-runtime-recovery-final-closure-audit-record.js";
import type { LocalRuntimeRecoveryClosureCertification } from "./local-runtime-recovery-closure-certification.js";
import type { LocalRuntimeRecoveryClosureEvidence } from "./local-runtime-recovery-closure-evidence.js";

export type LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification = Readonly<{
  certificationId: string;
  evidenceId: string;
  auditCertificationId: string;
  auditRecordId: string;
  closureCertificationId: string;
  closureEvidenceId: string;
  decisionFingerprint: string;
  replayDisposition: "ADMIT" | "REPLAY";
  certified: true;
  syntheticOnly: true;
}>;

export function certifyLocalRuntimeRecoveryFinalClosureAuditEvidence(input: { certificationId: string; evidence: LocalRuntimeRecoveryFinalClosureAuditEvidence; auditCertification: LocalRuntimeRecoveryFinalClosureAuditCertification; auditRecord: LocalRuntimeRecoveryFinalClosureAuditRecord; closureCertification: LocalRuntimeRecoveryClosureCertification; closureEvidence: LocalRuntimeRecoveryClosureEvidence }): LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification {
  if (!input.certificationId.trim()) throw new Error("Final closure audit evidence certification identity is required.");
  assertLocalRuntimeRecoveryFinalClosureAuditEvidence(input);
  const replayDisposition = replayLocalRuntimeRecoveryFinalClosureAuditEvidence(input);
  if (replayDisposition === "CONFLICT") throw new Error("Final closure audit evidence certification conflict.");
  return Object.freeze({ certificationId: input.certificationId, evidenceId: input.evidence.evidenceId, auditCertificationId: input.auditCertification.certificationId, auditRecordId: input.auditRecord.auditRecordId, closureCertificationId: input.closureCertification.certificationId, closureEvidenceId: input.closureEvidence.evidenceId, decisionFingerprint: input.evidence.decisionFingerprint, replayDisposition, certified: true, syntheticOnly: true });
}

export function assertLocalRuntimeRecoveryFinalClosureAuditEvidenceCertification(input: LocalRuntimeRecoveryFinalClosureAuditEvidenceCertification, evidence: LocalRuntimeRecoveryFinalClosureAuditEvidence): void {
  if (!input.certified || !input.syntheticOnly || input.replayDisposition === "CONFLICT") throw new Error("Final closure audit evidence certification must be certified, non-conflicted and synthetic-only.");
  if (input.evidenceId !== evidence.evidenceId || input.auditCertificationId !== evidence.auditCertificationId || input.auditRecordId !== evidence.auditRecordId || input.closureCertificationId !== evidence.closureCertificationId || input.closureEvidenceId !== evidence.closureEvidenceId || input.decisionFingerprint !== evidence.decisionFingerprint) throw new Error("Final closure audit evidence certification drift.");
}

export type { FinalClosureAuditEvidenceReplayDisposition };
