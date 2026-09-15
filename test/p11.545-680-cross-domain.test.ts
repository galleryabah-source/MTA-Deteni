import assert from "node:assert/strict";
import test from "node:test";
import { evaluateCrossDomainComposition, type CrossDomainComposition } from "../src/application/p11-545-608-cross-domain-composition.js";
import { evaluateReportConsistency, type ReportConsistencyInput } from "../src/application/p11-609-680-report-reconciliation.js";

const reconciliation = {
  contractId: "RECON-545",
  target: "SYNTHETIC" as const,
  observations: [{ checkpoint: "P11.545", detaineeId: "DET-001", placement: { detaineeId: "DET-001", placementId: "ROOM-A", state: "RETURNED" as const }, movementEvents: [{ eventId: "MOV-001", detaineeId: "DET-001", fromPlacementId: null, toPlacementId: "ROOM-A", kind: "TEMPORARY_EXIT_RETURN" as const, headcountDelta: 1 }], expectedHeadcount: 1, observedHeadcount: 1 }],
};
const aggregate: CrossDomainComposition = { contractId: "XDOM-001", target: "SYNTHETIC", aggregates: [{ detaineeId: "DET-001", detaineeStatus: "ACTIVE", placementId: "ROOM-A", placementState: "RETURNED", headcountIncluded: true }], reconciliation };

test("P11.545-608 accepts coherent synthetic aggregate composition", () => assert.equal(evaluateCrossDomainComposition(aggregate), "READY"));
test("P11.545-608 blocks duplicate detainee identity", () => assert.equal(evaluateCrossDomainComposition({ ...aggregate, aggregates: [...aggregate.aggregates, aggregate.aggregates[0]] }), "BLOCKED"));
test("P11.545-608 blocks closed detainee in headcount", () => assert.equal(evaluateCrossDomainComposition({ ...aggregate, aggregates: [{ ...aggregate.aggregates[0], detaineeStatus: "CLOSED" }] }), "BLOCKED"));

const report: ReportConsistencyInput = {
  snapshotId: "SNAP-001",
  readModelGeneratedAt: "2026-09-15T10:00:00Z",
  expectedActiveCount: 1,
  reportedActiveCount: 1,
  report: {
    reportId: "RPT-001", reportDate: "2026-09-15", shift: "PAGI", teamName: "SYNTHETIC-BRAVO", generatedAt: "2026-09-15T10:00:00Z", sourceSnapshotId: "SNAP-001",
    sections: [
      "IDENTITAS_LAPORAN", "PERSONEL_REGU", "KONDISI_DETENI", "KEGIATAN_JAGA", "KEJADIAN_PENTING", "SERAH_TERIMA", "PENGESAHAN",
    ].map((code) => ({ code, title: code, rows: [{ label: "status", value: "synthetic", provenance: "OPERATIONAL_READ_MODEL" as const }] })),
  },
};

test("P11.609-680 accepts report bound to the same snapshot", () => assert.equal(evaluateReportConsistency(report), "READY"));
test("P11.609-680 blocks report snapshot drift", () => assert.equal(evaluateReportConsistency({ ...report, snapshotId: "SNAP-002" }), "BLOCKED"));
test("P11.609-680 blocks count mismatch", () => assert.equal(evaluateReportConsistency({ ...report, reportedActiveCount: 2 }), "BLOCKED"));
