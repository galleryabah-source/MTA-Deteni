export const WORKFLOW_EVIDENCE_CONTRACT_VERSION = "P10.18-v1";

export type WorkflowEvidenceType =
  | "STATE_TRANSITION"
  | "DOCUMENT_EVENT"
  | "ESCORT_EVENT"
  | "MOVEMENT_EVENT"
  | "RETURN_EVENT";

export interface WorkflowEvidence {
  evidenceId: string;
  requestId: string;
  type: WorkflowEvidenceType;
  subjectId: string;
  sourceId: string;
  occurredAt: string;
  verified: boolean;
  correlationId: string;
}

export type EvidenceDecision = "ACCEPTED" | "REJECTED";

export function validateWorkflowEvidence(e: WorkflowEvidence): EvidenceDecision {
  if (!e.evidenceId || !e.requestId || !e.subjectId || !e.sourceId || !e.correlationId) return "REJECTED";
  if (!e.occurredAt || Number.isNaN(Date.parse(e.occurredAt))) return "REJECTED";
  return "ACCEPTED";
}
