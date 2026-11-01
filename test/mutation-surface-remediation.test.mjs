import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const api = readFileSync(
  new URL("../supabase/functions/mta-api/index.ts", import.meta.url),
  "utf8",
);

test("MUT-001: detainee root scope lookup selects root-table columns", () => {
  assert.match(
    api,
    /const currentColumns=resource==="detainees"\?"id,scope_id":"detainee_id";/,
  );
  assert.match(api, /select\(currentColumns\)\.eq\("id",id\)/);
  assert.match(
    api,
    /detainees:\{POST:new Set\(\["OWNER","ADMIN","EDITOR"\]\),PATCH:new Set\(\["OWNER","ADMIN","EDITOR"\]\),DELETE:new Set\(\["OWNER","ADMIN"\]\)\}/,
  );
});

test("MUT-002: admin-users create route is collection-only; reset route remains reachable", () => {
  const start = api.indexOf('if(resource==="admin-users"){');
  const end = api.indexOf('if(resource==="admin-config"){', start);
  assert.ok(start >= 0 && end > start, "admin-users route block must exist");

  const block = api.slice(start, end);
  const createRoute = block.indexOf('if(req.method==="POST"&&!id){');
  const resetRoute = block.indexOf(
    'if(req.method==="POST"&&id&&routeParts[2]==="password-reset"){',
  );

  assert.ok(createRoute >= 0, "POST create must match collection route only");
  assert.ok(resetRoute > createRoute, "password reset route must remain in admin-users dispatch");
  assert.ok(
    block.includes('if(req.method==="PATCH"&&id){'),
    "user update must remain an item-level PATCH route",
  );
  assert.ok(
    !block.includes('if(req.method==="POST"){'),
    "unqualified POST branch must not shadow item-level routes",
  );
});

console.log("MTA DETENI mutation-surface remediation contract PASS");
