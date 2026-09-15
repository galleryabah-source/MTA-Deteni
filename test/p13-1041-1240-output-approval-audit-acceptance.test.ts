import assert from "node:assert/strict";
import test from "node:test";
import { composeDocumentOutputWorkspace, assertDocumentOutputMatches } from "../src/application/p13-1041-1100-document-output-workspace.js";
import { buildApprovalBinding, assertApprovalBindsToArtifact } from "../src/application/p13-1101-1160-approval-binding.js";
import { composeOperationalAuditView } from "../src/application/p13-1161-1200-operational-audit-view.js";
import { evaluateCrossDomainAcceptance } from "../src/application/p13-1201-1240-cross-domain-acceptance.js";
import type { ActorContext, AuditEvent } from "../src/domain/shared/contracts.js";

test("document output workspace detects content drift", () => {
  const workspace = composeDocumentOutputWorkspace({ artifactId: "artifact-1", reportId: "report-1", snapshotId: "snapshot-1", format: "TEXT", content: "synthetic report", generatedAt: "2026-09-15T01:00:00Z" });
  assert.doesNotThrow(() => assertDocumentOutputMatches(workspace, "synthetic report"));
  assert.throws(() => assertDocumentOutputMatches(workspace, "tampered report"), /DOCUMENT_OUTPUT_CONTENT_DRIFT/);
});

test("approval binding is exact to artifact, report and evidence", () => {
  const binding = buildApprovalBinding({ approvalId: "approval-1", artifactId: "artifact-1", reportId: "report-1", approvedBy: "operator-1", approvedAt: "2026-09-15T01:10:00Z", evidenceHash: "evidence-1" });
  assert.doesNotThrow(() => assertApprovalBindsToArtifact(binding, "artifact-1", "report-1", "evidence-1"));
  assert.throws(() => assertApprovalBindsToArtifact(binding, "artifact-2", "report-1", "evidence-1"), /APPROVAL_ARTIFACT_MISMATCH/);
});

test("audit view is read-only and role scoped", () => {
  const actor: ActorContext = { actorId: "auditor-1", role: "AUDITOR", domain: "LEADERSHIP", scope: {}, correlationId: "corr-1" };
  const event: AuditEvent = { eventId: "event-1", eventType: "HEADCOUNT_CAPTURED", aggregateType: "DETAINEE", aggregateId: "agg-1", actorId: "operator-1", correlationId: "corr-1", occurredAt: "2026-09-15T01:00:00Z", payloadHash: "hash-1" };
  const view = composeOperationalAuditView(actor, "agg-1", [event]);
  assert.equal(view.readOnly, true);
  assert.throws(() => composeOperationalAuditView({ ...actor, role: "EDITOR" }, "agg-1", [event]), /AUDIT_VIEW_ROLE_DENIED/);
});

test("cross-domain acceptance blocks unsafe governance state", () => {
  const base = { aggregateId: "agg-1", detaineeId: "det-1", correlationId: "corr-1", rapReady: true, perkesReady: true, kamtibReady: true, subbagTuReady: true, leadershipOversightOnly: true, reconciliationMatched: true, syntheticOnly: true, migrationFreeze: true, aiEnabled: false, productionAuthorized: false } as const;
  assert.equal(evaluateCrossDomainAcceptance(base), "ACCEPTED");
  assert.equal(evaluateCrossDomainAcceptance({ ...base, productionAuthorized: true }), "BLOCKED");
  assert.equal(evaluateCrossDomainAcceptance({ ...base, aiEnabled: true }), "BLOCKED");
});
