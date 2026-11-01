import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const api = readFileSync(
  new URL("../supabase/functions/mta-api/index.ts", import.meta.url),
  "utf8",
);

test("protected lifecycle resources have no generic mutation role policy", () => {
  const policyStart = api.indexOf("const MUTATION_ROLE_POLICY={");
  const policyEnd = api.indexOf("};", policyStart);
  assert.ok(policyStart >= 0 && policyEnd > policyStart);
  const policy = api.slice(policyStart, policyEnd);
  for (const resource of ["placements", "movements", "leaves", "documents"]) {
    assert.doesNotMatch(policy, new RegExp(resource + ":"));
  }
});

test("MOVE_DETAINEE is dispatched before generic movement writes are denied", () => {
  const command = api.indexOf('if(req.method==="POST" && resource==="movements" && body?.command==="MOVE_DETAINEE")');
  const guard = api.indexOf('movements:"MOVEMENT_CANONICAL_COMMAND_REQUIRED"');
  const genericAuth = api.indexOf("const authorizationDecision=await authorizeGenericMutation");
  const genericRpc = api.indexOf('admin.rpc("mta_execute_idempotent_mutation"');
  assert.ok(command >= 0 && guard > command && genericAuth > guard && genericRpc > guard);
  assert.match(api, /mta_execute_movement_transaction/);
});

test("placements, leaves, and documents fail closed until dedicated commands exist", () => {
  for (const [resource, code] of [
    ["placements", "PLACEMENT_CANONICAL_COMMAND_REQUIRED"],
    ["leaves", "LEAVE_CANONICAL_COMMAND_REQUIRED"],
    ["documents", "DOCUMENT_CANONICAL_COMMAND_REQUIRED"],
  ]) {
    assert.match(api, new RegExp(resource + ':"' + code + '"'));
  }
  assert.match(api, /if\(WRITE_METHODS\.has\(req\.method\)&&canonicalWriteRequired\)/);
});

test("block and room scope identities cannot be rebound by PATCH", () => {
  assert.match(api, /BLOCK_SCOPE_IMMUTABLE/);
  assert.match(api, /ROOM_SCOPE_IMMUTABLE/);
  assert.match(api, /if\(current\.data\.scope_id!==canonicalScopeId\)/);
});

test("room block relation is checked against the actor's canonical scope", () => {
  assert.match(api, /mta_blocks"\)\.select\("scope_id,status"\)\.eq\("id",String\(body\.block_id\)\)/);
  assert.match(api, /BLOCK_INACTIVE/);
  assert.match(api, /ROOM_HAS_ACTIVE_PLACEMENTS/);
});

test("room capacity and deactivation cannot violate current occupancy", () => {
  assert.match(api, /mta_placements"\)\.select\("id",\{count:"exact",head:true\}\)\.eq\("room_id",id\)\.is\("until",null\)/);
  assert.match(api, /ROOM_CAPACITY_BELOW_OCCUPANCY/);
  assert.match(api, /ROOM_OCCUPIED_CANNOT_DEACTIVATE/);
  assert.match(api, /BLOCK_HAS_ACTIVE_ROOMS/);
});

console.log("MTA DETENI protected domain mutation boundary regression PASS");
