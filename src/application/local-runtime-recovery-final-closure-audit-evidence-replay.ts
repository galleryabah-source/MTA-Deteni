import type { LocalRuntimeRecoveryFinalClosureAuditEvidence } from "./local-runtime-recovery-final-closure-audit-evidence.js";
import { assertLocalRuntimeRecoveryFinalClosureAuditEvidence } from "./local-runtime-recovery-final-closure-audit-evidence.js";
import type { LocalRuntimeRecoveryFinalClosureAuditCertification } from "./local-runtime-recovery-final-closure-audit-certification.js";
import type { LocalRuntimeRecoveryFinalClosureAuditRecord } from "./local-runtime-recovery-final-closure-audit-record.js";
import type { LocalRuntimeRecoveryClosureCertification } from "./local-runtime-recovery-closure-certification.js";
import type { LocalRuntimeRecoveryClosureEvidence } from "./local-runtime-recovery-closure-evidence.js";

export type FinalClosureAuditEvidenceReplayDisposition = "ADMIT" | "REPLAY" | "CONFLICT";
const registry = new Map<string, string>();

export function replayLocalRuntimeRecoveryFinalClosureAuditEvidence(input: { evidence: LocalRuntimeRecoveryFinalClosureAuditEvidence; auditCertification: LocalRuntimeRecoveryFinalClosureAuditCertification; auditRecord: LocalRuntimeRecoveryFinalClosureAuditRecord; closureCertification: LocalRuntimeRecoveryClosureCertification; closureEvidence: LocalRuntimeRecoveryClosureEvidence }): FinalClosureAuditEvidenceReplayDisposition {
  assertLocalRuntimeRecoveryFinalClosureAuditEvidence(input);
  const key = `${input.evidence.evidenceId}:${input.evidence.auditCertificationId}:${input.evidence.auditRecordId}`;
  const existing = registry.get(key);
  if (existing === undefined) { registry.set(key, input.evidence.decisionFingerprint); return "ADMIT"; }
  return existing === input.evidence.decisionFingerprint ? "REPLAY" : "CONFLICT";
}

export function clearLocalRuntimeRecoveryFinalClosureAuditEvidenceReplayRegistry(): void { registry.clear(); }
