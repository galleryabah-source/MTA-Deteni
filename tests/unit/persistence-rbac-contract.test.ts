import { describe, expect, it } from "vitest";
import {
  assertNoSuperAdminBypass,
  assertPersistenceAuthorizationContext,
  assertUnitIsolation,
  MTA_DETENI_RLS_CONTRACT,
} from "../../src/lib/security/persistence-rbac-contract";

describe("persistence RBAC/RLS contract", () => {
  const context = {
    userId: "USER-1",
    roles: ["OPERATOR"],
    unitId: "RUDENIM-1",
    domain: "DOCUMENTS" as const,
    mode: "READ" as const,
  };

  it("uses deny-by-default and forbids persistence super-admin bypass", () => {
    expect(MTA_DETENI_RLS_CONTRACT.denyByDefault).toBe(true);
    expect(MTA_DETENI_RLS_CONTRACT.superAdminBypass).toBe(false);
    expect(() => assertNoSuperAdminBypass(["SUPER_ADMIN"])).toThrow("SUPER_ADMIN_PERSISTENCE_BYPASS_FORBIDDEN");
  });

  it("rejects cross-unit access", () => {
    expect(() => assertUnitIsolation({ ...context, resourceOwnerUnitId: "RUDENIM-2" })).toThrow("UNIT_SCOPE_DENIED");
  });

  it("requires purpose for restricted data", () => {
    expect(() => assertPersistenceAuthorizationContext({ ...context, classification: "HIGHLY_RESTRICTED" })).toThrow("PURPOSE_REQUIRED_FOR_RESTRICTED_DATA");
  });

  it("accepts a scoped request", () => {
    expect(() => assertPersistenceAuthorizationContext({ ...context, classification: "INTERNAL" })).not.toThrow();
  });
});
