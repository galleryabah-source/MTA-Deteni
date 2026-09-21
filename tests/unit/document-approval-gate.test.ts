import { describe, expect, it } from "vitest";
import { evaluateDocumentApproval } from "../../src/lib/document-engine/approval-gate";

describe("document approval gate", () => {
  const base = {
    documentId: "DOC-SYN-001",
    documentKind: "SURAT_IZIN_KELUAR_SEMENTARA" as const,
    actorUserId: "USER-SYN-001",
    requiredApproval: true,
    isAuthorized: true,
    correlationId: "CORR-SYN-001",
  };

  it("blocks approval from the wrong lifecycle state", () => {
    expect(evaluateDocumentApproval({ ...base, currentLifecycle: "DRAFT", action: "APPROVE" }))
      .toEqual({ allowed: false, reason: "INVALID_WORKFLOW_STATE" });
  });

  it("blocks unauthorized actors", () => {
    expect(evaluateDocumentApproval({ ...base, currentLifecycle: "REVIEWED", action: "APPROVE", isAuthorized: false }))
      .toEqual({ allowed: false, reason: "AUTHORIZATION_DENIED" });
  });

  it("blocks issue without second approval", () => {
    expect(evaluateDocumentApproval({ ...base, currentLifecycle: "APPROVED", action: "ISSUE" }))
      .toEqual({ allowed: false, reason: "SECOND_APPROVAL_REQUIRED" });
  });

  it("blocks self-approval", () => {
    expect(evaluateDocumentApproval({ ...base, currentLifecycle: "APPROVED", action: "ISSUE", secondApproverUserId: base.actorUserId }))
      .toEqual({ allowed: false, reason: "SELF_APPROVAL_BLOCKED" });
  });

  it("allows issue with an independent second approver", () => {
    expect(evaluateDocumentApproval({ ...base, currentLifecycle: "APPROVED", action: "ISSUE", secondApproverUserId: "USER-SYN-002" }))
      .toEqual({ allowed: true, reason: "APPROVED" });
  });
});
