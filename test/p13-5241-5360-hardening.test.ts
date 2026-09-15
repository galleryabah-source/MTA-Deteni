import test from "node:test";
import assert from "node:assert/strict";
import { createEvidenceIntegrity, assertObservedControlEvidence } from "../src/application/p13-5241-5280-evidence-hardening.js";
import { assertRecoveryEvidence } from "../src/application/p13-5281-5320-recovery-evidence.js";
import { normalizeDomain, assertHeadRudenimOversightOnly } from "../src/application/p13-5321-5360-domain-vocabulary.js";

test("evidence integrity uses SHA-256 and rejects tampering", () => {
  const integrity = createEvidenceIntegrity("control=C-001|result=PASS");
  assert.equal(integrity.algorithm, "SHA-256");
  assertObservedControlEvidence({
    evidenceId: "E-001", controlId: "C-001", observedAt: "2026-09-15T00:00:00Z", outputIdentity: "OUT-001", status: "PASS", integrity,
  });
  assert.throws(() => assertObservedControlEvidence({
    evidenceId: "E-001", controlId: "C-001", observedAt: "2026-09-15T00:00:00Z", outputIdentity: "OUT-001", status: "PASS",
    integrity: { ...integrity, digest: "tampered" },
  }));
});

test("recovery evidence requires observable restore controls and human signoff", () => {
  const base = {
    rehearsalId: "DR-001", backupId: "B-001", restoreId: "R-001", backupHash: "hash-a", restoredArtifactHash: "hash-b",
    integrityVerified: true, journalReplayVerified: true, readModelRebuildVerified: true, observedAt: "2026-09-15T00:00:00Z", operatorId: "OP-001",
    syntheticOnly: true as const, productionAuthorized: false as const,
  };
  assert.throws(() => assertRecoveryEvidence(base));
  assertRecoveryEvidence({ ...base, humanSignoffId: "SIGN-001" });
});

test("leadership vocabulary normalizes without granting mutation", () => {
  assert.equal(normalizeDomain("LEADERSHIP"), "HEAD_RUDENIM");
  assert.equal(normalizeDomain("HEAD_RUDENIM"), "HEAD_RUDENIM");
  assertHeadRudenimOversightOnly("HEAD_RUDENIM", false);
  assert.throws(() => assertHeadRudenimOversightOnly("HEAD_RUDENIM", true));
});
