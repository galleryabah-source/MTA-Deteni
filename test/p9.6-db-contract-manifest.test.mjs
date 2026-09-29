import test from "node:test";
import assert from "node:assert/strict";
import { P96_CONTRACT } from "../p9.6/database-contract.mjs";

test("P9.6 canonical scope contract includes admin-config metadata", () => {
  assert.ok(P96_CONTRACT.columns["public.mta_scopes"].includes("metadata"));
  assert.equal(P96_CONTRACT.scopeAuthorization.metadataPath, "metadata.adminSettings");
});

test("P9.6 scope contract keeps authorization membership explicit", () => {
  assert.deepEqual(P96_CONTRACT.scopeAuthorization.adminRoles, ["OWNER", "ADMIN"]);
  assert.equal(
    P96_CONTRACT.scopeAuthorization.profileMembership,
    "ACTIVE_PROFILE_SCOPE_REQUIRED_FOR_SCOPED_OPERATIONAL_ACCESS",
  );
  assert.equal(P96_CONTRACT.scopeAuthorization.seedRows, false);
});

test("P9.6 canonical scope dependencies are represented by foreign keys", () => {
  assert.equal(
    P96_CONTRACT.foreignKeys.mta_detainees_scope_id_fkey,
    "FOREIGN KEY (scope_id) REFERENCES public.mta_scopes(id) ON DELETE RESTRICT",
  );
  assert.equal(
    P96_CONTRACT.foreignKeys.mta_blocks_scope_id_fkey,
    "FOREIGN KEY (scope_id) REFERENCES public.mta_scopes(id)",
  );
  assert.equal(
    P96_CONTRACT.foreignKeys.mta_rooms_scope_id_fkey,
    "FOREIGN KEY (scope_id) REFERENCES public.mta_scopes(id)",
  );
});
