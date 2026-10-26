import assert from "node:assert/strict";
import test from "node:test";
import {
  validateDatabaseConfig,
  type DatabaseConfig,
} from "../src/infrastructure/database/database-adapter";

test("P9.6 accepts a runtime database contract", () => {
  const config: DatabaseConfig = {
    environment: "DEVELOPMENT",
    role: "APP_RUNTIME",
    connectionString: "postgresql://synthetic-test",
    poolSize: 5,
    timeoutMs: 5000,
  };

  assert.doesNotThrow(() => validateDatabaseConfig(config));
});

test("P9.6 rejects missing DATABASE_URL", () => {
  assert.throws(
    () =>
      validateDatabaseConfig({
        environment: "TEST",
        role: "APP_RUNTIME",
        connectionString: "",
      }),
    /DATABASE_URL_REQUIRED/,
  );
});

test("P9.6 prevents an uncontrolled production migration role", () => {
  assert.throws(
    () =>
      validateDatabaseConfig({
        environment: "PRODUCTION",
        role: "MIGRATION",
        connectionString: "postgresql://controlled",
      }),
    /PRODUCTION_MIGRATION_ROLE_REQUIRES_CHANGE_CONTROL/,
  );
});

test("P9.6 rejects invalid pool and timeout settings", () => {
  assert.throws(
    () =>
      validateDatabaseConfig({
        environment: "TEST",
        role: "APP_RUNTIME",
        connectionString: "postgresql://synthetic-test",
        poolSize: 0,
      }),
    /DATABASE_POOL_SIZE_INVALID/,
  );

  assert.throws(
    () =>
      validateDatabaseConfig({
        environment: "TEST",
        role: "APP_RUNTIME",
        connectionString: "postgresql://synthetic-test",
        timeoutMs: 0,
      }),
    /DATABASE_TIMEOUT_INVALID/,
  );
});
