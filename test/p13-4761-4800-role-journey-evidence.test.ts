import test from "node:test";
import assert from "node:assert/strict";
import { assertRoleJourneyEvidence } from "../src/application/p13-4761-4800-role-journey-evidence";

test("role journey evidence protects leadership oversight boundary", () => {
  const base = { role: "ADMIN" as const, journeyId: "J-ADMIN", evidenceId: "E-ADMIN", outputIdentity: "O-ADMIN", observed: true, passed: true, operationalMutationAllowed: true };
  assert.doesNotThrow(() => assertRoleJourneyEvidence([base]));
  assert.doesNotThrow(() => assertRoleJourneyEvidence([{ ...base, role: "HEAD_RUDENIM", operationalMutationAllowed: false }]));
  assert.throws(() => assertRoleJourneyEvidence([{ ...base, role: "HEAD_RUDENIM", operationalMutationAllowed: true }]), /LEADERSHIP_OPERATIONAL_MUTATION_BLOCKED/);
  assert.throws(() => assertRoleJourneyEvidence([{ ...base, observed: false }]), /ROLE_JOURNEY_NOT_OBSERVED/);
});
