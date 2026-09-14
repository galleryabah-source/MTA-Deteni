import { describe, expect, it } from "vitest";
import { AuthorizationEngine } from "../../src/lib/security/authorization";
import type { AuthorizationPolicy } from "../../src/lib/security/types";

const policy: AuthorizationPolicy = {
  version: "test-1",
  permissions: [
    { name: "deteni.view", domain: "DETENI", action: "VIEW", risk: "LOW" },
    { name: "perkes.view", domain: "PERKES", action: "VIEW", risk: "HIGH", restricted: true, requiresPurpose: true },
  ],
  rolePermissions: {
    RAP: ["deteni.view"],
    PERKES: ["perkes.view"],
  },
  protectedPermissions: [],
};

describe("AuthorizationEngine", () => {
  const engine = new AuthorizationEngine(policy);

  it("denies by default when permission is absent", () => {
    const result = engine.decide({
      subject: { userId: "u1", roles: ["RAP"], active: true },
      permission: "deteni.edit",
      action: "EDIT",
      resource: { domain: "DETENI" },
      context: { correlationId: "c1" },
    });
    expect(result.allowed).toBe(false);
  });

  it("allows an explicitly granted permission", () => {
    const result = engine.decide({
      subject: { userId: "u1", roles: ["RAP"], active: true },
      permission: "deteni.view",
      action: "VIEW",
      resource: { domain: "DETENI" },
      context: { correlationId: "c2" },
    });
    expect(result.allowed).toBe(true);
  });

  it("requires purpose for restricted health access", () => {
    const result = engine.decide({
      subject: { userId: "u2", roles: ["PERKES"], active: true },
      permission: "perkes.view",
      action: "VIEW",
      resource: { domain: "PERKES", classification: "RESTRICTED" },
      context: { correlationId: "c3" },
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("PURPOSE_REQUIRED");
  });
});
