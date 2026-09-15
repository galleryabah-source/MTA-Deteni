import test from "node:test";
import assert from "node:assert/strict";
import { assertPostgresBoundary, isWriteEnabled } from "../src/infrastructure/persistence/postgres-boundary.js";

test("P10.545-552 keeps PostgreSQL disabled by default", () => {
  assert.doesNotThrow(() => assertPostgresBoundary({ mode: "DISABLED", migrationFreeze: true, production: false }));
  assert.equal(isWriteEnabled({ mode: "DISABLED", migrationFreeze: true, production: false }), false);
});

test("P10.545-552 requires an explicit non-production target", () => {
  assert.throws(() => assertPostgresBoundary({ mode: "NON_PRODUCTION_READ_ONLY", migrationFreeze: true, production: false }), /POSTGRES_TARGET_REQUIRED/);
});

test("P10.545-552 rejects production PostgreSQL execution", () => {
  assert.throws(() => assertPostgresBoundary({ mode: "NON_PRODUCTION_WRITE", targetName: "prod", migrationFreeze: true, production: true }), /PRODUCTION_POSTGRES_NOT_AUTHORIZED/);
});

test("P10.545-552 permits only explicitly configured non-production write mode", () => {
  assert.equal(isWriteEnabled({ mode: "NON_PRODUCTION_READ_ONLY", targetName: "synthetic-staging", migrationFreeze: true, production: false }), false);
  assert.equal(isWriteEnabled({ mode: "NON_PRODUCTION_WRITE", targetName: "synthetic-staging", migrationFreeze: true, production: false }), true);
});
