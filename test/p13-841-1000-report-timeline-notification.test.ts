import { strict as assert } from "node:assert";
import { composeReportingWorkspace, assertReportPreviewAllowed } from "../src/application/p13-841-900-reporting-workspace.js";
import { composeImmutableTimeline, assertTimelineEntryOrder } from "../src/application/p13-901-960-immutable-timeline.js";
import { buildOperationalNotification, buildRecommendationBoundary } from "../src/application/p13-961-1000-notification-recommendation.js";

const report = {
  reportId: "SYN-REPORT-1000", reportDate: "2026-09-15", shift: "PAGI" as const, teamName: "Regu Synthetic", generatedAt: "2026-09-15T00:00:00.000Z", sourceSnapshotId: "SNAP-1000",
  sections: ["IDENTITAS_LAPORAN", "PERSONEL_REGU", "KONDISI_DETENI", "KEGIATAN_JAGA", "KEJADIAN_PENTING", "SERAH_TERIMA", "PENGESAHAN"].map((code) => ({ code, title: code, rows: [] })),
};
const workspace = composeReportingWorkspace(report);
assert.equal(workspace.previewAllowed, true);
assertReportPreviewAllowed(workspace);

const events = [
  { eventId: "E1", eventType: "REGISTER", aggregateType: "DETENEE", aggregateId: "AGG-1", actorId: "A1", correlationId: "C1", occurredAt: "2026-09-15T08:00:00.000Z", payloadHash: "h1" },
  { eventId: "E2", eventType: "HEADCOUNT", aggregateType: "DETENEE", aggregateId: "AGG-1", actorId: "A2", correlationId: "C1", occurredAt: "2026-09-15T09:00:00.000Z", payloadHash: "h2" },
];
const timeline = composeImmutableTimeline("AGG-1", events);
assertTimelineEntryOrder(timeline);
assert.throws(() => composeImmutableTimeline("AGG-1", [{ ...events[0], aggregateId: "AGG-2" }]), /TIMELINE_AGGREGATE_DRIFT/);

const notification = buildOperationalNotification({ notificationId: "N1", subject: "Synthetic alert", priority: "WARNING", sourceEvidenceId: "EV1", recipientRole: "KAMTIB", createdAt: "2026-09-15T09:00:00.000Z" });
assert.equal(notification.sourceEvidenceId, "EV1");
const recommendation = buildRecommendationBoundary({ recommendationId: "R1", subject: "Synthetic review", sourceEvidenceId: "EV1", issuedBy: "LEADERSHIP" });
assert.equal(recommendation.requiresHumanDecision, true);
