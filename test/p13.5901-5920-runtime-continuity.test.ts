import { test } from "node:test";
import assert from "node:assert/strict";
import { assertRuntimeSafety, resolveRuntimeCapabilities } from "../src/application/runtime-continuity.js";

test("P13.5901 runtime capability matrix supports LAN/local continuity", () => {
  const cloud = resolveRuntimeCapabilities("CLOUD", "DESKTOP");
  const lan = resolveRuntimeCapabilities("LAN", "TABLET");
  const local = resolveRuntimeCapabilities("LOCAL", "SMARTPHONE");
  assert.equal(cloud.offlineWrites, false);
  assert.equal(lan.multiDeviceLan, true);
  assert.equal(lan.localBackup, true);
  assert.equal(local.offlineWrites, true);
  assert.equal(local.localBackup, true);
  assert.equal(local.multiDeviceLan, false);
  assert.doesNotThrow(() => assertRuntimeSafety(cloud));
  assert.doesNotThrow(() => assertRuntimeSafety(lan));
  assert.doesNotThrow(() => assertRuntimeSafety(local));
});

test("P13.5920 runtime safety rejects contradictory capabilities", () => {
  assert.throws(() => assertRuntimeSafety({ mode: "CLOUD", device: "DESKTOP", offlineWrites: false, localBackup: true, multiDeviceLan: false }), /Cloud mode/);
  assert.throws(() => assertRuntimeSafety({ mode: "LOCAL", device: "TABLET", offlineWrites: false, localBackup: true, multiDeviceLan: false }), /Local mode/);
});
