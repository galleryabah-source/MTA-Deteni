import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createP96DatabaseAdapter, type P96DatabaseDriver } from "../src/infrastructure/database/p9.6-database-adapter.js";
import { TemporaryExitService } from "../src/domain/temporary-exit/service.js";

const baseConfig = (overrides = {}) => ({
  role: "APPLICATION",
  databaseUrl: "postgresql://redacted-secret@localhost:5432/mta",
  poolSize: 2,
  statementTimeoutMs: 25,
  ...overrides,
});

function fakeDriver(options: {
  query?: P96DatabaseDriver["query"];
  begin?: P96DatabaseDriver["begin"];
} = {}) {
  const calls: unknown[][] = [];
  const query = options.query ?? (async <Row extends object = Record<string, unknown>>() => ({ rows: [{ ok: 1 } as Row], rowCount: 1 }));
  const begin = options.begin ?? (async () => ({
    execute: async <Row extends object = Record<string, unknown>>() => ({ rows: [] as Row[], rowCount: 0 }),
    commit: async () => {},
    rollback: async () => {},
  }));
  return {
    calls,
    driver: {
      query: async <Row extends object = Record<string, unknown>>(text: string, parameters: readonly unknown[]) => {
        calls.push(["query", text, parameters]);
        return query<Row>(text, parameters);
      },
      begin: async (id: string) => {
        calls.push(["begin", id]);
        return begin(id);
      },
      close: async () => { calls.push(["close"]); },
    } satisfies P96DatabaseDriver,
  };
}
