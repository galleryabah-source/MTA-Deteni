import { test } from "node:test";
import assert from "node:assert/strict";
import { assertDailyGuardSectionOrder, assertDailyGuardSnapshot, DAILY_GUARD_SECTION_ORDER } from "../src/application/daily-guard-report-contract.js";
import type { ReportSnapshot } from "../src/application/report-artifact.js";

const sections = Object.fromEntries(DAILY_GUARD_SECTION_ORDER.map((key) => [key, `Synthetic ${key}`]));
const snapshot: ReportSnapshot = Object.freeze({ snapshotId: "daily-contract-01", sourceVersion: "rev-01", documentNumber: "DOC-DAILY-01", approvalBinding: "approval-01", provenance: Object.freeze(["synthetic-test"]), sections: Object.freeze(sections) });

test("P13.6681 canonical daily guard section order is stable", () => {
  assert.doesNotThrow(() => assertDailyGuardSectionOrder(DAILY_GUARD_SECTION_ORDER));
  assert.throws(() => assertDailyGuardSectionOrder([...DAILY_GUARD_SECTION_ORDER].reverse()), /canonical contract/);
});

test("P13.6682 daily guard snapshot requires every canonical section", () => {
  assert.doesNotThrow(() => assertDailyGuardSnapshot(snapshot));
  const incomplete = { ...snapshot, sections: Object.freeze({ ...sections, PENGESAHAN: "" }) } as ReportSnapshot;
  assert.throws(() => assertDailyGuardSnapshot(incomplete), /PENGESAHAN/);
});
