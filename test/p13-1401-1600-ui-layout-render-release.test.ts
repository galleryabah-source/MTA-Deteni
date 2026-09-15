import assert from "node:assert/strict";
import test from "node:test";
import { resolveResponsiveLayout } from "../src/application/p13-1461-1510-responsive-layout-model.js";
import { buildSyntheticReleaseManifest, assertSyntheticReleaseManifestSafe } from "../src/application/p13-1551-1600-synthetic-release-manifest.js";
import { renderReportContract } from "../src/application/p13-1511-1550-report-rendering-adapter.js";

test("responsive layout keeps phone/tablet operator actions usable", () => {
  assert.equal(resolveResponsiveLayout("PHONE", "COMPACT").bottomNavigation, true);
  assert.equal(resolveResponsiveLayout("TABLET", "COMFORTABLE").stickyActions, true);
  assert.equal(resolveResponsiveLayout("DESKTOP", "COMFORTABLE").mode, "MULTI_PANEL");
});

test("report rendering preserves report identity and template version", () => {
  const report = { reportId: "synthetic-report-001", reportDate: "2026-09-15", shift: "PAGI", teamName: "Bravo", generatedAt: "2026-09-15T08:00:00Z", sourceSnapshotId: "snapshot-001", sections: [{ code: "IDENTITAS_LAPORAN", title: "Identitas", rows: [{ label: "Regu", value: "Bravo", provenance: "MANUAL_VERIFIED" }] }] } as const;
  const rendered = renderReportContract({ report, format: "TEXT", templateVersion: "RGR-1.0" });
  assert.equal(rendered.reportId, report.reportId);
  assert.equal(rendered.templateVersion, "RGR-1.0");
  assert.match(rendered.content, /Regu: Bravo/);
});

test("synthetic release manifest cannot authorize production", () => {
  const manifest = buildSyntheticReleaseManifest({ manifestId: "manifest-001", version: "v1.42", branch: "phase-p12.961-13.200", evidenceIds: ["evidence-001"], generatedAt: "2026-09-15T08:00:00Z" });
  assertSyntheticReleaseManifestSafe(manifest);
  assert.equal(manifest.productionAuthorized, false);
  assert.equal(manifest.aiEnabled, false);
});
