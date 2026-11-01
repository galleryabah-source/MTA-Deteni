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

test("master block and room updates fail closed pending transactional commands", () => {
  assert.match(api, /BLOCK_MASTER_COMMAND_REQUIRED/);
  assert.match(api, /ROOM_MASTER_COMMAND_REQUIRED/);
  assert.match(api, /resource==="blocks"\\|\\|resource==="rooms"/);
  assert.match(api, /req.method==="PATCH"\\|\\|req.method==="DELETE"/);
  assert.doesNotMatch(api, /blocks:\\{POST:new Set\\(\\["OWNER","ADMIN"\\]\\),PATCH:/);
  assert.doesNotMatch(api, /rooms:\\{POST:new Set\\(\\["OWNER","ADMIN"\\]\\),PATCH:/);
});

test("new rooms require an active block in the same canonical scope", () => {
  assert.match(api, /mta_blocks"\\)\\.select\\("scope_id,status"\\)\\.eq\\("id",blockId\\)/);
  assert.match(api, /BLOCK_INACTIVE/);
  assert.match(api, /body=\\{\\.\\.\\.body,scope_id:canonicalScopeId\\}/);
});

console.log("MTA DETENI protected domain mutation boundary regression PASS");
