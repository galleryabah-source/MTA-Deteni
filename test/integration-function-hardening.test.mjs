import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const shell = read("web/mta-unified-shell-v2.js");
const movement = read("web/movement-v9.js");
const runtime = read("web/mta-app-runtime-full.js");
const preview = read("web/preview-v5.js");

test("movement navigation has one canonical owner", () => {
  assert.match(shell, /if\(v==='movement'\)\{if\(typeof window\.MTAMovementView\?\.render==='function'\)return window\.MTAMovementView\.render\(\)/);
  assert.match(shell, /window\.mtaUnifiedOpenMovement=openMovementForDetainee/);
});

test("QR action preserves detainee context into movement", () => {
  assert.ok(shell.includes("mtaUnifiedOpenMovement(\\'${esc(id)}\\')"));
  assert.match(preview, /window\.p5openMovement=id=>\{show\('movement'\)/);
  assert.match(preview, /#p9moveForm select\[name="detaineeId"\]/);
});

test("placement has one canonical mutation boundary", () => {
  assert.match(shell, /function assignPlacementCommand\(/);
  assert.match(runtime, /window\.mtaUnifiedAssignPlacement/);
  assert.match(movement, /window\.mtaUnifiedAssignPlacement/);

  const detaineeFn = runtime.match(/function addDetainee\(existing\)\{[\s\S]*?\n\}\nfunction editDetainee/);
  assert.ok(detaineeFn, "addDetainee function must exist");
  assert.doesNotMatch(detaineeFn[0], /db\.placements\.unshift\(/);

  const placementFn = runtime.match(/function addPlacement\(\)[\s\S]*?function movement/);
  assert.ok(placementFn, "addPlacement function must exist");
  assert.doesNotMatch(placementFn[0], /db\.placements\.unshift\(/);

  assert.doesNotMatch(movement, /d\.placements\.unshift\(/);
});

test("leave transition has one canonical command boundary", () => {
  assert.match(shell, /function advanceLeaveCommand\(/);
  assert.match(runtime, /window\.mtaUnifiedAdvanceLeave\(db,id\)/);
  const legacyAdvance = runtime.match(/function advanceLeave\(id\)\{[\s\S]*?\n\}/);
  assert.ok(legacyAdvance, "legacy advanceLeave wrapper must exist");
  assert.doesNotMatch(legacyAdvance[0], /l\.status=next/);
  assert.doesNotMatch(legacyAdvance[0], /appendLocalAudit\(/);
});

test("movement audit writer is defined and correlation is propagated", () => {
  assert.match(movement, /const appendAudit=\(/);
  assert.match(movement, /placementCommand\(d,[\s\S]*correlationId\)/);
  assert.match(movement, /appendAudit\(d,'MOVEMENT_CREATE','MOVEMENT',movement\.id,'SUCCESS',correlationId\)/);
});

test("integration hardening remains synthetic and does not add production DB capabilities", () => {
  assert.doesNotMatch(shell, /DATABASE_URL|postgres(?:ql)?:\/\//i);
  assert.doesNotMatch(movement, /DATABASE_URL|postgres(?:ql)?:\/\//i);
  assert.doesNotMatch(runtime, /DATABASE_URL|postgres(?:ql)?:\/\//i);
});
