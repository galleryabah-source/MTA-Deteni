import { test } from "node:test";
import assert from "node:assert/strict";
import { CoreAdministrationService } from "../src/domain/core-administration/service.js";
import { PlacementService } from "../src/domain/placement/service.js";
import { MovementService } from "../src/domain/movement/service.js";
import { TemporaryExitService } from "../src/domain/temporary-exit/service.js";
import { actor, fixedNow } from "./service-test-support.js";

test("core administration rejects unverified provenance and preserves status invariants", async () => {
  const store = new Map<string, any>();
  const service = new CoreAdministrationService({
    repository: { get: async (id) => store.get(id) ?? null, save: async (d) => { store.set(d.id, d); } },
    audit: { append: async () => "AUD-1" },
    now: fixedNow,
    canManage: (a) => a.domain === "RAP",
  });
  await assert.rejects(() => service.register({ id: "SYN-D1", identityRef: "ID-1", provenance: { sourceType: "MANUAL", capturedAt: fixedNow(), verified: false }, actor: actor("rap-1", "RAP") }));
  const detainee = await service.register({ id: "SYN-D1", identityRef: "ID-1", provenance: { sourceType: "MANUAL", capturedAt: fixedNow(), verified: true, verifiedBy: "rap-1" }, actor: actor("rap-1", "RAP") });
  assert.equal(detainee.status, "ACTIVE");
  await assert.rejects(() => service.changeStatus({ id: "SYN-D1", to: "ACTIVE", actor: actor("rap-1", "RAP") }));
});

test("placement enforces one active placement and bed exclusivity", async () => {
  const store = new Map<string, any>();
  const service = new PlacementService({
    repository: {
      getCurrent: async (id) => store.get(`d:${id}`) ?? null,
      getBedOccupant: async (bed) => [...store.values()].find((p) => p.bedId === bed && p.active)?.detaineeId ?? null,
      save: async (p) => { store.set(`d:${p.detaineeId}`, p); },
    }, now: fixedNow, canManage: (a) => a.domain === "KAMTIB",
  });
  await service.assign({ detaineeId: "SYN-D1", blockId: "B1", roomId: "R1", bedId: "BED1", actor: actor("k-1", "KAMTIB") });
  await assert.rejects(() => service.assign({ detaineeId: "SYN-D1", blockId: "B1", roomId: "R1", bedId: "BED2", actor: actor("k-1", "KAMTIB") }));
  await assert.rejects(() => service.assign({ detaineeId: "SYN-D2", blockId: "B1", roomId: "R1", bedId: "BED1", actor: actor("k-1", "KAMTIB") }));
});

test("movement records append-only events and headcount exposes unknown state", async () => {
  const events: any[] = [];
  const service = new MovementService({
    repository: { append: async (e) => { events.push(e); }, listSince: async (id) => events.filter((e) => e.detaineeId === id) },
    now: fixedNow, canManage: (a) => a.domain === "KAMTIB",
  });
  await service.record({ id: "M1", detaineeId: "SYN-D1", type: "IN", actor: actor("k-1", "KAMTIB") });
  await service.record({ id: "M2", detaineeId: "SYN-D2", type: "TEMPORARY_EXIT_DEPARTURE", actor: actor("k-1", "KAMTIB") });
  const projection = await service.reconcileHeadcount({ detaineeIds: ["SYN-D1", "SYN-D2", "SYN-D3"], since: "2026-09-14T00:00:00.000Z", actor: actor("k-1", "KAMTIB") });
  assert.deepEqual(projection, { occupied: 1, outside: 1, unknown: 1, asOf: fixedNow() });
});

test("temporary exit refuses invalid chronology and bypass transition", async () => {
  const store = new Map<string, any>();
  const service = new TemporaryExitService({ repository: { get: async (id) => store.get(id) ?? null, save: async (e) => { store.set(e.id, e); } }, now: fixedNow, canManage: (a) => a.domain === "KAMTIB" });
  await assert.rejects(() => service.request({ id: "EXIT-1", detaineeId: "SYN-D1", plannedDepartureAt: "2026-09-15T10:00:00Z", plannedReturnAt: "2026-09-15T09:00:00Z", actor: actor("k-1", "KAMTIB") }));
  await service.request({ id: "EXIT-1", detaineeId: "SYN-D1", plannedDepartureAt: "2026-09-15T10:00:00Z", plannedReturnAt: "2026-09-15T12:00:00Z", actor: actor("k-1", "KAMTIB") });
  await assert.rejects(() => service.advance("EXIT-1", "DEPARTED", actor("k-1", "KAMTIB")));
});
