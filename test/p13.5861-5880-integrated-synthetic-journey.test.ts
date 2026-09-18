import { test } from "node:test";
import assert from "node:assert/strict";
import { MovementService } from "../src/domain/movement/service.js";
import { PlacementService } from "../src/domain/placement/service.js";
import { TemporaryExitService } from "../src/domain/temporary-exit/service.js";
import { TemporaryExitWorkflow } from "../src/application/temporary-exit-workflow.js";
import { createReportingSnapshot } from "../src/domain/reporting/snapshot.js";
import { actor, fixedNow } from "./service-test-support.js";

test("P13.5861 integrated synthetic journey preserves domain ownership boundaries", async () => {
  const detaineeId = "SYN-DET-0100";
  const exits = new Map<string, any>();
  const placements = new Map<string, any>();
  const beds = new Map<string, string>();
  const movements: any[] = [];
  const audit: string[] = [];

  const placement = new PlacementService({
    repository: {
      getCurrent: async (id) => placements.get(id) ?? null,
      getBedOccupant: async (bedId) => beds.get(bedId) ?? null,
      save: async (value) => { placements.set(value.detaineeId, value); if (value.active) beds.set(value.bedId, value.detaineeId); },
    },
    now: fixedNow,
    canManage: (a) => a.domain === "KAMTIB",
  });
  const movement = new MovementService({
    repository: {
      append: async (event) => { movements.push(event); return; },
      listSince: async (id) => movements.filter((event) => event.detaineeId === id),
    },
    now: fixedNow,
    canManage: (a) => a.domain === "KAMTIB",
  });
  const exitService = new TemporaryExitService({
    repository: { get: async (id) => exits.get(id) ?? null, save: async (value) => { exits.set(value.id, value); } },
    now: fixedNow,
    canManage: (a) => a.domain === "KAMTIB",
  });

  const kamtib = actor("kamtib-100", "KAMTIB");
  const head = actor("head-100", "HEAD_RUDENIM");
  const tu = actor("tu-100", "SUBBAG_TU");

  await placement.assign({ detaineeId, blockId: "SYN-BLOCK-10", roomId: "SYN-ROOM-10", bedId: "SYN-BED-10", actor: kamtib });
  await movement.record({ id: "SYN-MOV-0100-IN", detaineeId, type: "IN", toPlacementRef: "SYN-BED-10", actor: kamtib });
  await exitService.request({ id: "SYN-EXIT-0100", detaineeId, plannedDepartureAt: "2026-09-15T10:00:00Z", plannedReturnAt: "2026-09-15T12:00:00Z", actor: kamtib });

  let approved = false;
  let documented = false;
  let escorted = false;
  const workflow = new TemporaryExitWorkflow(
    exitService,
    {
      currentState: async (id) => exits.get(id)?.state ?? null,
      approvalState: async () => approved ? "APPROVED" : "PENDING",
      documentState: async () => documented ? "VALID" : "MISSING",
      escortState: async () => escorted ? "ASSIGNED" : "MISSING",
    },
    { authorize: async (a, permission) => {
      if (permission === "temporary_exit.approve") return a.domain === "HEAD_RUDENIM";
      if (permission === "temporary_exit.document") return a.domain === "SUBBAG_TU";
      return a.domain === "KAMTIB";
    } },
    { append: async (event) => audit.push(`${event.aggregateType}:${event.eventType}`), enqueue: async () => undefined },
    { run: async (work) => work() },
  );

  await workflow.advance({ exitId: "SYN-EXIT-0100", from: "REQUESTED", to: "VALIDATED", actor: kamtib });
  approved = true;
  await workflow.advance({ exitId: "SYN-EXIT-0100", from: "VALIDATED", to: "APPROVED", actor: head });
  documented = true;
  await workflow.advance({ exitId: "SYN-EXIT-0100", from: "APPROVED", to: "DOCUMENTED", actor: tu });
  escorted = true;
  await workflow.advance({ exitId: "SYN-EXIT-0100", from: "DOCUMENTED", to: "ESCORT_ASSIGNED", actor: kamtib });
  await workflow.advance({ exitId: "SYN-EXIT-0100", from: "ESCORT_ASSIGNED", to: "DEPARTED", actor: kamtib });
  await movement.record({ id: "SYN-MOV-0100-EXIT", detaineeId, type: "TEMPORARY_EXIT_DEPARTURE", actor: kamtib });
  await workflow.advance({ exitId: "SYN-EXIT-0100", from: "DEPARTED", to: "RETURN_PENDING", actor: kamtib });
  await workflow.advance({ exitId: "SYN-EXIT-0100", from: "RETURN_PENDING", to: "RETURNED", actor: kamtib });
  await movement.record({ id: "SYN-MOV-0100-RETURN", detaineeId, type: "TEMPORARY_EXIT_RETURN", actor: kamtib });
  await workflow.advance({ exitId: "SYN-EXIT-0100", from: "RETURNED", to: "COMPLETED", actor: kamtib });

  const snapshot = createReportingSnapshot({
    snapshotId: "SYN-REPORT-0100",
    generatedAt: fixedNow(),
    sourceRevision: "SYN-JOURNEY-0100",
    rows: [{ detaineeId, placement: placements.get(detaineeId)?.bedId ?? null, exitState: exits.get("SYN-EXIT-0100")?.state ?? null, movementCount: movements.length, auditCount: audit.length }],
  });

  assert.equal(exits.get("SYN-EXIT-0100").state, "COMPLETED");
  assert.equal(movements.length, 3);
  assert.equal(audit.length, 8);
  assert.equal(snapshot.rows[0].exitState, "COMPLETED");
  assert.equal(snapshot.rows[0].movementCount, 3);
});
