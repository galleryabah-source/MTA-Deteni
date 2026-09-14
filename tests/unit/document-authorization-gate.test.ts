import { describe, expect, it } from "vitest";
import { AuthorizationEngine } from "../../src/lib/security/authorization";
import type { AuthorizationPolicy } from "../../src/lib/security/types";
import {
  buildDocumentAuthorizationRequest,
  evaluateDocumentAuthorization,
} from "../../src/lib/document-engine/authorization-gate";
import type { DocumentApprovalRequest } from "../../src/lib/document-engine/approval-gate";

const policy: AuthorizationPolicy = {
  version: "test-policy-1",
  permissions: [
    {
      name: "LEAVE.APPROVE",
      domain: "TEMPORARY_EXIT",
      action: "APPROVE",
      risk: "HIGH",
    },
    {
      name: "LEAVE.ISSUE",
      domain: "TEMPORARY_EXIT",
      action: "ISSUE",
      risk: "HIGH",
    },
  ],
  rolePermissions: {
    PEJABAT_APPROVER: ["LEAVE.APPROVE", "LEAVE.ISSUE"],
  },
  protectedPermissions: [],
};

const baseApproval = (overrides: Partial<DocumentApprovalRequest> = {}): DocumentApprovalRequest => ({
  documentId: "DOC-SYN-001",
  documentKind: "SURAT_IZIN_KELUAR_SEMENTARA",
  currentLifecycle: "REVIEWED",
  actorUserId: "USER-SYN-001",
  action: "APPROVE",
  requiredApproval: true,
  isAuthorized: false,
  correlationId: "CORR-SYN-001",
  ...overrides,
});

describe("document authorization gate", () => {
  const engine = new AuthorizationEngine(policy);

  it("derives the security domain from document kind", () => {
    const request = buildDocumentAuthorizationRequest({
      approval: baseApproval(),
      subject: {
        userId: "USER-SYN-001",
        roles: ["PEJABAT_APPROVER"],
        active: true,
      },
      permission: "LEAVE.APPROVE",
    });

    expect(request.resource.domain).toBe("TEMPORARY_EXIT");
    expect(request.action).toBe("APPROVE");
    expect(request.resource.workflowState).toBe("REVIEWED");
  });

  it("blocks an actor when the authorization kernel denies permission", () => {
    const decision = evaluateDocumentAuthorization(
      {
        approval: baseApproval(),
        subject: {
          userId: "USER-SYN-001",
          roles: ["RAP"],
          active: true,
        },
        permission: "LEAVE.APPROVE",
      },
      engine,
    );

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("AUTHORIZATION_DENIED");
    expect(decision.authorization.allowed).toBe(false);
    expect(decision.authorization.policyVersion).toBe("test-policy-1");
  });

  it("does not trust a client-supplied authorization boolean", () => {
    const decision = evaluateDocumentAuthorization(
      {
        approval: baseApproval({ isAuthorized: true }),
        subject: {
          userId: "USER-SYN-001",
          roles: ["RAP"],
          active: true,
        },
        permission: "LEAVE.APPROVE",
      },
      engine,
    );

    expect(decision.allowed).toBe(false);
    expect(decision.authorization.allowed).toBe(false);
  });

  it("allows approval only after the security engine grants the permission", () => {
    const decision = evaluateDocumentAuthorization(
      {
        approval: baseApproval(),
        subject: {
          userId: "USER-SYN-001",
          roles: ["PEJABAT_APPROVER"],
          active: true,
        },
        permission: "LEAVE.APPROVE",
      },
      engine,
    );

    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe("APPROVED");
    expect(decision.authorization.reason).toBe("GRANTED");
    expect(decision.guardrails).toContain("AUDIT");
  });

  it("fails closed when correlation identity is inconsistent", () => {
    const engineWithMismatchingDecision = {
      decide: () => ({
        allowed: true,
        reason: "GRANTED" as const,
        correlationId: "OTHER-CORRELATION",
        policyVersion: "test-policy-1",
        obligations: ["AUDIT"],
      }),
    } as AuthorizationEngine;

    const decision = evaluateDocumentAuthorization(
      {
        approval: baseApproval(),
        subject: {
          userId: "USER-SYN-001",
          roles: ["PEJABAT_APPROVER"],
          active: true,
        },
        permission: "LEAVE.APPROVE",
      },
      engineWithMismatchingDecision,
    );

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("AUTHORIZATION_DENIED");
    expect(decision.guardrails).toContain("CORRELATION_ID_MISMATCH");
  });
});
