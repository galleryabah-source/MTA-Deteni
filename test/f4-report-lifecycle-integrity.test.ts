import { strict as assert } from "node:assert";
import {
  F4_REPORT_STATUS,
  attachFinalIntegrity,
  createF4ReportLifecycle,
  finalizeF4Report,
  recordF4IntegrityVerification,
  registerF4Download,
  transitionF4Report,
  validateF4ReportLifecycle,
  verifyF4Integrity,
} from "../src/application/f4-report-lifecycle-integrity.js";

const actor = { actorId: "SYNTH-OP-01", role: "OPERATOR" };
const supervisor = { actorId: "SYNTH-SUP-01", role: "SUPERVISOR" };

let report = createF4ReportLifecycle({
  reportId: "DGR-2026-09-22-R1",
  createdAt: "2026-09-22T08:00:00.000Z",
  actor, correlationId: "COR-001", requestId: "REQ-001",
});

report = transitionF4Report(report, F4_REPORT_STATUS.VALIDATED, {
  actor, occurredAt: "2026-09-22T08:01:00.000Z", correlationId: "COR-002", requestId: "REQ-002",
});
report = transitionF4Report(report, F4_REPORT_STATUS.GENERATED, {
  actor, occurredAt: "2026-09-22T08:02:00.000Z", correlationId: "COR-003", requestId: "REQ-003",
});
report = transitionF4Report(report, F4_REPORT_STATUS.IN_REVIEW, {
  actor: supervisor, occurredAt: "2026-09-22T08:03:00.000Z", correlationId: "COR-004", requestId: "REQ-004",
});
report = transitionF4Report(report, F4_REPORT_STATUS.CHANGES_REQUESTED, {
  actor: supervisor, occurredAt: "2026-09-22T08:04:00.000Z", correlationId: "COR-005", requestId: "REQ-005",
  reason: "Lengkapi bagian closing.",
});
report = transitionF4Report(report, F4_REPORT_STATUS.DRAFT, {
  actor, occurredAt: "2026-09-22T08:05:00.000Z", correlationId: "COR-006", requestId: "REQ-006",
  reason: "Revision cycle.",
});

assert.equal(report.revision.parentRevisionId, "REV-001");
assert.equal(report.revision.revisionId, "REV-002");

report = transitionF4Report(report, F4_REPORT_STATUS.VALIDATED, {
  actor, occurredAt: "2026-09-22T08:06:00.000Z", correlationId: "COR-007", requestId: "REQ-007",
});
report = transitionF4Report(report, F4_REPORT_STATUS.GENERATED, {
  actor, occurredAt: "2026-09-22T08:07:00.000Z", correlationId: "COR-008", requestId: "REQ-008",
});
report = transitionF4Report(report, F4_REPORT_STATUS.IN_REVIEW, {
  actor: supervisor, occurredAt: "2026-09-22T08:08:00.000Z", correlationId: "COR-009", requestId: "REQ-009",
});
report = transitionF4Report(report, F4_REPORT_STATUS.APPROVED, {
  actor: supervisor, occurredAt: "2026-09-22T08:09:00.000Z", correlationId: "COR-010", requestId: "REQ-010",
});

assert.throws(() => finalizeF4Report(report, {
  artifactId: "ART-001", actor: supervisor, occurredAt: "2026-09-22T08:10:00.000Z",
  correlationId: "COR-011", requestId: "REQ-011",
}), /F4_FINALIZE_REQUIRES_INTEGRITY/);

report = attachFinalIntegrity(report, "sha256:synthetic-final-001");
report = finalizeF4Report(report, {
  artifactId: "ART-001", actor: supervisor, occurredAt: "2026-09-22T08:10:00.000Z",
  correlationId: "COR-012", requestId: "REQ-012",
});

assert.equal(report.status, F4_REPORT_STATUS.FINAL);
assert.equal(report.finalArtifactId, "ART-001");
assert.equal(verifyF4Integrity(report, "sha256:synthetic-final-001"), true);
assert.equal(verifyF4Integrity(report, "sha256:tampered"), false);

const verified = recordF4IntegrityVerification(report, {
  observedHash: "sha256:synthetic-final-001",
  actor, occurredAt: "2026-09-22T08:11:00.000Z", correlationId: "COR-013", requestId: "REQ-013",
});
assert.equal(verified.valid, true);
report = verified.report;
assert.equal(report.events.at(-1)?.action, "VERIFY_INTEGRITY");

const failedVerification = recordF4IntegrityVerification(report, {
  observedHash: "sha256:tampered",
  actor, occurredAt: "2026-09-22T08:11:30.000Z", correlationId: "COR-013B", requestId: "REQ-013B",
});
assert.equal(failedVerification.valid, false);
assert.equal(failedVerification.report.events.at(-1)?.action, "VERIFY_INTEGRITY");
report = failedVerification.report;

report = registerF4Download(report, {
  actor, occurredAt: "2026-09-22T08:12:00.000Z", correlationId: "COR-014", requestId: "REQ-014",
});
assert.equal(report.events.at(-1)?.action, "DOWNLOAD");

validateF4ReportLifecycle(report);

assert.throws(() => transitionF4Report(report, F4_REPORT_STATUS.DRAFT, {
  actor, occurredAt: "2026-09-22T08:13:00.000Z", correlationId: "COR-015", requestId: "REQ-015",
}), /F4_INVALID_TRANSITION|F4_FINAL_IMMUTABLE/);

assert.throws(() => validateF4ReportLifecycle({
  ...report,
  status: F4_REPORT_STATUS.FINAL,
  events: report.events.filter((e) => e.action !== "FINALIZE"),
}), /F4_EVENT_CHAIN_BROKEN|F4_STATUS_EVENT_MISMATCH|F4_FINALIZE_EVENT_REQUIRED/);

assert.throws(() => validateF4ReportLifecycle({
  ...report,
  events: [...report.events, {
    ...report.events.at(-1)!,
    id: "BROKEN",
    action: "DOWNLOAD",
    from: F4_REPORT_STATUS.APPROVED,
    to: F4_REPORT_STATUS.FINAL,
  }],
}), /F4_EVENT_CHAIN_BROKEN|F4_FINAL_AUDIT_EVENT_INVALID/);

console.log("F4_REPORT_LIFECYCLE_INTEGRITY PASS");
