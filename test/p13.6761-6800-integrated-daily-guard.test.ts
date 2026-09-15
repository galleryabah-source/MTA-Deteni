import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDailyGuardReportJourney } from "../src/application/daily-guard-report-journey.js";
import { DAILY_GUARD_SECTION_ORDER } from "../src/application/daily-guard-report-contract.js";
import type { ReportSnapshot } from "../src/application/report-artifact.js";

const sections = Object.fromEntries(DAILY_GUARD_SECTION_ORDER.map((key) => [key, `Synthetic ${key}`]));
const snapshot: ReportSnapshot = Object.freeze({ snapshotId: "journey-01", sourceVersion: "rev-01", documentNumber: "DOC-DAILY-02", approvalBinding: "approval-02", provenance: Object.freeze(["synthetic-test"]), sections: Object.freeze(sections) });

test("P13.6761 integrated daily guard journey remains a single deterministic chain", () => {
  const journey = buildDailyGuardReportJourney({ snapshot, sectionOrder: DAILY_GUARD_SECTION_ORDER, previewId: "preview-journey-01", downloadId: "download-journey-01" });
  assert.equal(journey.snapshotId, snapshot.snapshotId);
  assert.equal(journey.previewId, "preview-journey-01");
  assert.equal(journey.downloadId, "download-journey-01");
  assert.equal(journey.download.contentType, "text/plain");
  assert.equal(journey.syntheticOnly, true);
});
