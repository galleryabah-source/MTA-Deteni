export type ApprovalBinding = Readonly<{
  approvalId: string;
  artifactId: string;
  reportId: string;
  approvedBy: string;
  approvedAt: string;
  decision: "APPROVED";
  evidenceHash: string;
}>;

export function buildApprovalBinding(input: Omit<ApprovalBinding, "decision">): ApprovalBinding {
  if (!input.approvalId.trim() || !input.artifactId.trim() || !input.reportId.trim() || !input.approvedBy.trim() || !input.approvedAt.trim() || !input.evidenceHash.trim()) {
    throw new Error("APPROVAL_BINDING_IDENTITY_REQUIRED");
  }
  return { ...input, decision: "APPROVED" };
}

export function assertApprovalBindsToArtifact(binding: ApprovalBinding, artifactId: string, reportId: string, evidenceHash: string): void {
  if (binding.artifactId !== artifactId) throw new Error("APPROVAL_ARTIFACT_MISMATCH");
  if (binding.reportId !== reportId) throw new Error("APPROVAL_REPORT_MISMATCH");
  if (binding.evidenceHash !== evidenceHash) throw new Error("APPROVAL_EVIDENCE_MISMATCH");
}
