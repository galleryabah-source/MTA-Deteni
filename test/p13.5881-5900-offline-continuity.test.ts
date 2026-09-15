import { test } from "node:test";
import assert from "node:assert/strict";
import { assertLanContinuity, enqueueOfflineCommand, reconcileOfflineCommand } from "../src/application/offline-continuity.js";

test("P13.5881 offline command is deterministic and idempotent", () => {
  const command = enqueueOfflineCommand({ commandId: "SYN-OFF-0001", aggregateId: "SYN-DET-0200", commandType: "MOVEMENT_RECORD", payloadHash: "HASH-0200", idempotencyKey: "IDEMP-0200", createdAt: "2026-09-15T08:00:00.000Z" });
  assert.equal(command.state, "PENDING");
  assert.deepEqual(reconcileOfflineCommand({ command, existingIdempotencyKeys: [], aggregateRevisionMatches: true }), { commandId: "SYN-OFF-0001", action: "APPLY" });
  assert.deepEqual(reconcileOfflineCommand({ command, existingIdempotencyKeys: ["IDEMP-0200"], aggregateRevisionMatches: true }), { commandId: "SYN-OFF-0001", action: "SKIP_DUPLICATE" });
});

test("P13.5890 reconnect detects aggregate conflict instead of silently overwriting", () => {
  const command = enqueueOfflineCommand({ commandId: "SYN-OFF-0002", aggregateId: "SYN-DET-0201", commandType: "PLACEMENT_ASSIGN", payloadHash: "HASH-0201", idempotencyKey: "IDEMP-0201", createdAt: "2026-09-15T08:01:00.000Z" });
  assert.deepEqual(reconcileOfflineCommand({ command, existingIdempotencyKeys: [], aggregateRevisionMatches: false }), { commandId: "SYN-OFF-0002", action: "REVIEW_CONFLICT" });
});

test("P13.5900 LAN continuity fails closed on unresolved syncing work", () => {
  const command = { ...enqueueOfflineCommand({ commandId: "SYN-OFF-0003", aggregateId: "SYN-DET-0202", commandType: "REPORT_SNAPSHOT", payloadHash: "HASH-0202", idempotencyKey: "IDEMP-0202", createdAt: "2026-09-15T08:02:00.000Z" }), state: "SYNCING" as const };
  assert.throws(() => assertLanContinuity("ONLINE", [command]), /unresolved syncing queue/);
  assert.doesNotThrow(() => assertLanContinuity("OFFLINE", [command]));
});
