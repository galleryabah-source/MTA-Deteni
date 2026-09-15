import test from "node:test";
import assert from "node:assert/strict";
import { evaluatePilotCertification } from "../src/application/pilot-readiness.js";
import { assertMutationEnvelope, MTA_ROUTE_POLICIES } from "../src/application/transport-contract.js";
import { validateReguJagaReport } from "../src/application/reporting-contract.js";

const actor = { actorId: "synthetic-actor", role: "EDITOR", domain: "KAMTIB", scope: "synthetic", correlationId: "corr-1" } as const;

test("P10.577-584 certification fails closed on incomplete evidence", () => {
  assert.equal(evaluatePilotCertification({ packetId: "p", target: "SYNTHETIC", migrationFreeze: true, productionAccess: false, aiEnabled: false, evidence: [{ id: "1", checkpoint: "x", control: "y", status: "PENDING" }] }), "BLOCKED");
  assert.equal(evaluatePilotCertification({ packetId: "p", target: "SYNTHETIC", migrationFreeze: true, productionAccess: false, aiEnabled: false, evidence: [{ id: "1", checkpoint: "x", control: "y", status: "PASS" }] }), "READY");
});

test("P10.585-592 mutation routes require idempotency", () => {
  assert.equal(MTA_ROUTE_POLICIES.filter((r) => r.mutation).every((r) => r.idempotencyRequired && r.auditRequired), true);
  assert.throws(() => assertMutationEnvelope({ method: "POST", route: "/api/temporary-exit", actor, correlationId: "corr-1" }), /IDEMPOTENCY_KEY_REQUIRED/);
});

test("P10.601-608 regu jaga report validates required sections", () => {
  const report = { reportId: "r1", reportDate: "2026-09-15", shift: "PAGI", teamName: "SYNTHETIC", generatedAt: "2026-09-15T01:00:00Z", sourceSnapshotId: "snap", sections: [] } as const;
  assert.equal(validateReguJagaReport(report).length, 7);
});
