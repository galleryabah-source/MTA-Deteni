import { strict as assert } from "node:assert";
import { aggregateDailyGuardReport, validateDailyGuardReportAggregation } from "../src/application/daily-guard-report-aggregation.js";

const result = aggregateDailyGuardReport({
  reportDate: "2026-09-22",
  generatedAt: "2026-09-22T03:00:00.000Z",
  detainees: [{ id: "D1", status: "AKTIF" }, { id: "D2", status: "NONAKTIF" }],
  rooms: [{ id: "R1", capacity: 4 }, { id: "R2", capacity: 4 }],
  placements: [{ detaineeId: "D1", roomId: "R1", active: true }],
  movements: [
    { id: "M1", detaineeId: "D1", type: "IN", occurredAt: "2026-09-22T01:00:00.000Z" },
    { id: "M2", detaineeId: "D1", type: "OUT", occurredAt: "2026-09-22T02:00:00.000Z" },
    { id: "M3", detaineeId: "D1", type: "IN", occurredAt: "2026-09-21T02:00:00.000Z" },
  ],
  leaves: [
    { id: "L1", detaineeId: "D1", status: "APPROVED", occurredAt: "2026-09-22T01:30:00.000Z" },
    { id: "L2", detaineeId: "D1", status: "RETURNED", occurredAt: "2026-09-21T01:30:00.000Z", returnedAt: "2026-09-22T02:30:00.000Z" },
  ],
  incidents: [{ id: "I1", severity: "HIGH", occurredAt: "2026-09-22T01:45:00.000Z", status: "OPEN" }],
});
assert.equal(result.totals.detaineesActive, 1);
assert.equal(result.totals.roomsOccupied, 1);
assert.equal(result.totals.movementsToday, 2);
assert.equal(result.totals.movementsIn, 1);
assert.equal(result.totals.movementsOut, 1);
assert.equal(result.totals.leavesToday, 2);
assert.equal(result.totals.leavesApproved, 1);
assert.equal(result.totals.leavesReturned, 1);
assert.equal(result.totals.incidentsToday, 1);
assert.equal(result.totals.incidentsOpen, 1);
validateDailyGuardReportAggregation(result);

assert.throws(() => validateDailyGuardReportAggregation({
  ...result,
  totals: { ...result.totals, roomsOccupied: 99 },
}), /ROOM_COUNT_INVALID/);

console.log("F4_DAILY_GUARD_REPORT_AGGREGATION PASS");
