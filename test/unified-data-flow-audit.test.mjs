import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const read=(p)=>readFileSync(p,"utf8");

test("UDF QR scan entrypoints delegate to unified resolver",()=>{
  const v5=read("web/preview-v5.js");
  const v6=read("web/preview-v6.js");
  assert.match(v5,/window\.p5resolve=\(\)=>\{[^\n]*window\.mtaUnifiedResolve\(raw\)/);
  assert.match(v6,/window\.p6manualScan=\(\)=>\{[^\n]*window\.mtaUnifiedResolve\(raw\)/);
});

test("UDF leave return delegates to canonical leave transition",()=>{
  const v5=read("web/preview-v5.js");
  assert.match(v5,/window\.p5return=id=>\{if\(typeof window\.mtaUnifiedAdvanceLeave==='function'\)/);
  assert.match(v5,/window\.mtaUnifiedAdvanceLeave\(ensure\(\),id\)/);
});

test("UDF movement UI delegates mutation to canonical command",()=>{
  const movement=read("web/movement-v9.js");
  assert.match(movement,/typeof window\.mtaUnifiedCreateMovement!=='function'/);
  assert.match(movement,/window\.mtaUnifiedCreateMovement\(d,/);
  assert.doesNotMatch(movement,/d\.movements\.unshift\(movement\)/);
});

test("UDF shell exposes canonical movement mutation command",()=>{
  const shell=read("web/mta-unified-shell-v2.js");
  assert.match(shell,/function createMovementCommand\(state,options=\{\}\)/);
  assert.match(shell,/window\.mtaUnifiedCreateMovement=createMovementCommand/);
});

test("UDF governance baseline remains explicit",()=>{
  const audit=read("docs/03-implementation/UNIFIED-DATA-FLOW-AUDIT-BASELINE-v1.0.md");
  assert.match(audit,/Unified Data Flow Audit: NOT CERTIFIED/);
  assert.match(audit,/Production DB: LOCKED/);
});
