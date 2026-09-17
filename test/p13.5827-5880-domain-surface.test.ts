import { test } from "node:test";
import assert from "node:assert/strict";
import { MovementService } from "../src/domain/movement/service.js";
import { PlacementService } from "../src/domain/placement/service.js";
import { ApprovalLeadershipService } from "../src/domain/approval-leadership/service.js";
import { DomainError } from "../src/domain/shared/errors.js";
import { actor, fixedNow } from "./service-test-support.js";

const expectCode = async (work: () => Promise<unknown>, code: string) => {
  await assert.rejects(work, (error: unknown) => error instanceof DomainError && error.code === code);
};

test("P13.5827 movement is append-only and headcount distinguishes outside from unknown", async () => {
  const events: any[] = [];
  const repository = {
    append: async (event: any) => { events.push(event); },
    listSince: async (detaineeId: string) => events.filter((event) => event.detaineeId === detaineeId),
  };
  const service = new MovementService({ repository, now: fixedNow, canManage: (a) => a.domain === "KAMTIB" });
  const kamtib = actor("kamtib-1", "KAMTIB");

  const departure = await service.record({ id: "SYN-MOV-0001", detaineeId: "SYN-DET-0001", type: "TEMPORARY_EXIT_DEPARTURE", actor: kamtib });
  assert.equal(events.length, 1);
  assert.equal(departure.type, "TEMPORARY_EXIT_DEPARTURE");
  assert.equal(departure.actorId, "kamtib-1");

  const projection = await service.reconcileHeadcount({ detaineeIds: ["SYN-DET-0001", "SYN-DET-0002"], since: "2026-09-15T00:00:00.000Z", actor: kamtib });
  assert.deepEqual(projection, { occupied: 0, outside: 1, unknown: 1, asOf: fixedNow() });

  await expectCode(() => service.record({ id: "SYN-MOV-0002", detaineeId: "SYN-DET-0001", type: "TRANSFER", actor: actor("rap-1", "RAP") }), "FORBIDDEN_SCOPE");
  assert.equal(events.length, 1);
});

test("P13.5830 placement enforces one active placement and bed exclusivity", async () => {
  const placements = new Map<string, any>();
  const beds = new Map<string, string>();
  const repository = {
    getCurrent: async (detaineeId: string) => placements.get(detaineeId) ?? null,
    getBedOccupant: async (bedId: string) => beds.get(bedId) ?? null,
    save: async (placement: any) => {
      placements.set(placement.detaineeId, placement);
      if (placement.active) beds.set(placement.bedId, placement.detaineeId);
    },
  };
  const service = new PlacementService({ repository, now: fixedNow, canManage: (a) => a.domain === "KAMTIB" });
  const kamtib = actor("kamtib-1", "KAMTIB");

  await service.assign({ detaineeId: "SYN-DET-0001", blockId: "SYN-BLOCK-A", roomId: "SYN-ROOM-01", bedId: "SYN-BED-01", actor: kamtib });
  await expectCode(() => service.assign({ detaineeId: "SYN-DET-0001", blockId: "SYN-BLOCK-A", roomId: "SYN-ROOM-02", bedId: "SYN-BED-02", actor: kamtib }), "CONFLICT");
  await expectCode(() => service.assign({ detaineeId: "SYN-DET-0002", blockId: "SYN-BLOCK-A", roomId: "SYN-ROOM-01", bedId: "SYN-BED-01", actor: kamtib }), "CONFLICT");

  const closed = await service.close("SYN-DET-0001", kamtib);
  assert.equal(closed.active, false);
  const reassigned = await service.assign({ detaineeId: "SYN-DET-0001", blockId: "SYN-BLOCK-A", roomId: "SYN-ROOM-02", bedId: "SYN-BED-02", actor: kamtib });
  assert.equal(reassigned.version, 3);
});

test("P13.5840 approval uses canonical HEAD_RUDENIM and enforces separation of duties", async () => {
  const approvals = new Map<string, any>();
  const repository = {
    get: async (id: string) => approvals.get(id) ?? null,
    save: async (approval: any) => { approvals.set(approval.id, approval); },
  };
  const service = new ApprovalLeadershipService({
    repository,
    now: fixedNow,
    canApprove: (a, subjectType) => a.domain === "HEAD_RUDENIM" && subjectType === "TEMPORARY_EXIT",
    requiresSecondApproval: (subjectType) => subjectType === "TEMPORARY_EXIT",
  });

  const approval = await service.decide({ id: "SYN-APP-0001", subjectType: "TEMPORARY_EXIT", subjectId: "SYN-EXIT-0001", decision: "APPROVED", reason: "Synthetic governance approval", actor: actor("head-1", "HEAD_RUDENIM") });
  assert.equal(approval.actorId, "head-1");
  assert.equal(approval.secondApprovalRequired, true);

  await expectCode(() => service.secondApprove("SYN-APP-0001", actor("head-1", "HEAD_RUDENIM")), "FORBIDDEN_SCOPE");
  const second = await service.secondApprove("SYN-APP-0001", actor("head-2", "HEAD_RUDENIM"));
  assert.equal(second.secondApprovedBy, "head-2");
  await expectCode(() => service.decide({ id: "SYN-APP-0002", subjectType: "TEMPORARY_EXIT", subjectId: "SYN-EXIT-0001", decision: "APPROVED", reason: "Synthetic", actor: actor("kamtib-1", "KAMTIB") }), "FORBIDDEN_SCOPE");
});
