export const DAILY_GUARD_REPORT_VERSION = "DGR-v1";

export type DailyGuardOperationalInput = Readonly<{
  reportDate: string;
  generatedAt: string;
  detainees: readonly Readonly<{ id: string; status: string }>[]; 
  rooms: readonly Readonly<{ id: string; block?: string; room?: string; capacity: number }>[]; 
  placements: readonly Readonly<{ detaineeId: string; roomId?: string; active: boolean }>[]; 
  movements: readonly Readonly<{ id: string; detaineeId: string; type: string; occurredAt: string }>[]; 
  leaves: readonly Readonly<{ id: string; detaineeId?: string; status: string; occurredAt?: string; returnedAt?: string }>[]; 
  incidents?: readonly Readonly<{ id: string; severity?: string; occurredAt: string; status?: string }>[]; 
}>;

export type DailyGuardReportAggregation = Readonly<{
  version: typeof DAILY_GUARD_REPORT_VERSION;
  reportDate: string;
  generatedAt: string;
  totals: Readonly<{
    detaineesActive: number;
    detaineesTotal: number;
    roomsTotal: number;
    roomsOccupied: number;
    placementsActive: number;
    movementsToday: number;
    movementsIn: number;
    movementsOut: number;
    leavesToday: number;
    leavesApproved: number;
    leavesReturned: number;
    incidentsToday: number;
    incidentsOpen: number;
  }>;
  provenance: "synthetic-operational-runtime";
}>;

function isoDate(value: string): string { return value.slice(0, 10); }
function sameDay(value: string | undefined, date: string): boolean { return !!value && isoDate(value) === date; }

export function aggregateDailyGuardReport(input: DailyGuardOperationalInput): DailyGuardReportAggregation {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.reportDate)) throw new Error("DAILY_GUARD_REPORT_DATE_INVALID");
  if (!input.generatedAt.trim()) throw new Error("DAILY_GUARD_REPORT_GENERATED_AT_REQUIRED");

  const activePlacements = input.placements.filter((p) => p.active);
  const occupiedRoomIds = new Set(activePlacements.map((p) => p.roomId).filter(Boolean));
  const movementsToday = input.movements.filter((m) => sameDay(m.occurredAt, input.reportDate));
  const leavesToday = input.leaves.filter((l) => sameDay(l.occurredAt, input.reportDate) || sameDay(l.returnedAt, input.reportDate));
  const incidentsToday = (input.incidents ?? []).filter((i) => sameDay(i.occurredAt, input.reportDate));

  return Object.freeze({
    version: DAILY_GUARD_REPORT_VERSION,
    reportDate: input.reportDate,
    generatedAt: input.generatedAt,
    totals: Object.freeze({
      detaineesActive: input.detainees.filter((d) => d.status === "AKTIF").length,
      detaineesTotal: input.detainees.length,
      roomsTotal: input.rooms.length,
      roomsOccupied: occupiedRoomIds.size,
      placementsActive: activePlacements.length,
      movementsToday: movementsToday.length,
      movementsIn: movementsToday.filter((m) => m.type === "IN").length,
      movementsOut: movementsToday.filter((m) => m.type === "OUT").length,
      leavesToday: leavesToday.length,
      leavesApproved: input.leaves.filter((l) => l.status === "APPROVED" && sameDay(l.occurredAt, input.reportDate)).length,
      leavesReturned: input.leaves.filter((l) => l.status === "RETURNED" && sameDay(l.returnedAt ?? l.occurredAt, input.reportDate)).length,
      incidentsToday: incidentsToday.length,
      incidentsOpen: incidentsToday.filter((i) => i.status !== "CLOSED").length,
    }),
    provenance: "synthetic-operational-runtime",
  });
}

export function validateDailyGuardReportAggregation(result: DailyGuardReportAggregation): void {
  if (result.version !== DAILY_GUARD_REPORT_VERSION) throw new Error("DAILY_GUARD_REPORT_VERSION_INVALID");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result.reportDate)) throw new Error("DAILY_GUARD_REPORT_DATE_INVALID");
  if (result.provenance !== "synthetic-operational-runtime") throw new Error("DAILY_GUARD_REPORT_PROVENANCE_INVALID");
  for (const value of Object.values(result.totals)) if (!Number.isInteger(value) || value < 0) throw new Error("DAILY_GUARD_REPORT_METRIC_INVALID");
  if (result.totals.roomsOccupied > result.totals.roomsTotal) throw new Error("DAILY_GUARD_REPORT_ROOM_COUNT_INVALID");
  if (result.totals.placementsActive > result.totals.detaineesTotal) throw new Error("DAILY_GUARD_REPORT_PLACEMENT_COUNT_INVALID");
  if (result.totals.movementsIn + result.totals.movementsOut > result.totals.movementsToday) throw new Error("DAILY_GUARD_REPORT_MOVEMENT_COUNT_INVALID");
}
