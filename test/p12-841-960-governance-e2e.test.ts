import assert from "node:assert/strict";
import test from "node:test";
import { validateCanonicalOperationalEnvelope } from "../src/application/p12-841-880-canonical-operational-envelope.js";
import { assertQrScanWithinWindow, validateQrEvidenceBinding } from "../src/application/p12-881-920-qr-temporary-exit-evidence.js";
import { buildReportingSnapshotIntegrity } from "../src/application/p12-921-960-reporting-snapshot-integrity.js";

const actor = { actorId: "ACT-SYN", role: "OPERATOR", domain: "KAMTIB" as const, scope: {}, correlationId: "CORR-SYN", idempotencyKey: "IDEMP-SYN" };
const operation = { operationId: "OP-SYN", aggregateId: "DET-SYN", detaineeId: "DET-SYN", correlationId: "CORR-SYN", actor, operationType: "TEMPORARY_EXIT", payload: { synthetic: true }, occurredAt: "2026-09-15T08:00:00Z" } as const;

test("P12.841-880 validates the canonical operational envelope", () => validateCanonicalOperationalEnvelope(operation));
test("P12.881-920 binds temporary-exit QR context and validity window", () => {
  const binding = { qrId: "QR-SYN", detaineeId: "DET-SYN", context: "TEMPORARY_EXIT" as const, temporaryExitId: "EXIT-SYN", state: "APPROVED" as const, validFrom: "2026-09-15T08:00:00Z", validUntil: "2026-09-15T18:00:00Z", verifiedBy: "ACT-SYN" };
  validateQrEvidenceBinding(binding);
  assert.equal(assertQrScanWithinWindow(binding, "2026-09-15T09:00:00Z"), true);
  assert.equal(assertQrScanWithinWindow(binding, "2026-09-15T19:00:00Z"), false);
});
test("P12.921-960 produces deterministic report snapshot provenance", () => {
  const snapshot = buildReportingSnapshotIntegrity("SNAP-SYN", "v1", [operation], "2026-09-15T18:00:00Z");
  assert.equal(snapshot.deterministicKey, "v1:OP-SYN");
});
