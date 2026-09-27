import type { DatabaseAdapterConfig, DatabaseAdapterState, DatabaseQuery, DatabaseQueryResult, DatabaseRole, DatabaseTransaction } from "../../application/database-adapter-contract.js";
import { validateDatabaseAdapterConfig } from "../../application/database-adapter-contract.js";

export type P96DatabaseDriver = Readonly<{
  query: <Row extends object = Record<string, unknown>>(text: string, parameters: readonly unknown[]) => Promise<DatabaseQueryResult<Row>>;
  begin: (transactionId: string) => Promise<{
    execute: <Row extends object = Record<string, unknown>>(query: DatabaseQuery) => Promise<DatabaseQueryResult<Row>>;
    commit: () => Promise<void>;
    rollback: () => Promise<void>;
  }>;
  close: () => Promise<void>;
}>;

export type P96DatabaseAdapterOptions = Readonly<{
  config: DatabaseAdapterConfig;
  driver: P96DatabaseDriver;
  production?: boolean;
  migrationFreeze?: boolean;
}>;

export type P96DatabaseHealth = Readonly<{
  ok: boolean;
  state: DatabaseAdapterState;
  role: DatabaseRole;
}>;

const WRITE_PATTERN = /^(?:\s|\/\*[\s\S]*?\*\/|--[^\n]*(?:\n|$))*?(insert|update|delete|merge|truncate|alter|create|drop|grant|revoke|vacuum|refresh)\b/i;

function assertRoleQueryAllowed(role: DatabaseRole, query: DatabaseQuery): void {
  if ((role === "READ_ONLY" || role === "REPORTING" || role === "AI_PROCESSOR") && WRITE_PATTERN.test(query.text)) {
    throw new Error("DATABASE_ROLE_WRITE_BLOCKED");
  }
}

function withTimeout<T>(operation: Promise<T>, timeoutMs: number | undefined, code: string): Promise<T> {
  if (!timeoutMs) return operation;
  return Promise.race([
    operation,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(code)), timeoutMs)),
  ]);
}

export function createP96DatabaseAdapter(options: P96DatabaseAdapterOptions) {
  validateDatabaseAdapterConfig(options.config);
  const production = options.production ?? false;
  const migrationFreeze = options.migrationFreeze ?? true;
  if (options.config.role === "MIGRATION") throw new Error("MIGRATION_ROLE_BLOCKED_BY_GOVERNANCE_FREEZE");
  if (production) throw new Error("PRODUCTION_POSTGRES_NOT_AUTHORIZED");
  if (!migrationFreeze) throw new Error("MIGRATION_FREEZE_REQUIRED");

  let state: DatabaseAdapterState = "READY";
  const assertReady = () => { if (state !== "READY") throw new Error("DATABASE_ADAPTER_NOT_READY"); };

  const execute = async <Row extends object = Record<string, unknown>>(query: DatabaseQuery): Promise<DatabaseQueryResult<Row>> => {
    assertReady();
    assertRoleQueryAllowed(options.config.role, query);
    return withTimeout(options.driver.query<Row>(query.text, query.parameters), options.config.statementTimeoutMs, "DATABASE_QUERY_TIMEOUT");
  };

  const beginTransaction = async (transactionId: string): Promise<DatabaseTransaction> => {
    assertReady();
    if (!transactionId.trim()) throw new Error("TRANSACTION_ID_REQUIRED");
    const tx = await withTimeout(options.driver.begin(transactionId), options.config.statementTimeoutMs, "DATABASE_TRANSACTION_BEGIN_TIMEOUT");
    return {
      transactionId,
      execute: async <Row extends object = Record<string, unknown>>(query: DatabaseQuery) => {
        assertRoleQueryAllowed(options.config.role, query);
        return withTimeout(tx.execute<Row>(query), options.config.statementTimeoutMs, "DATABASE_QUERY_TIMEOUT");
      },
      commit: async () => withTimeout(tx.commit(), options.config.statementTimeoutMs, "DATABASE_TRANSACTION_COMMIT_TIMEOUT"),
      rollback: async () => withTimeout(tx.rollback(), options.config.statementTimeoutMs, "DATABASE_TRANSACTION_ROLLBACK_TIMEOUT"),
    };
  };

  const healthCheck = async (): Promise<P96DatabaseHealth> => {
    if (state !== "READY") return { ok: false, state, role: options.config.role };
    try {
      await withTimeout(options.driver.query("select 1 as ok", []), options.config.statementTimeoutMs, "DATABASE_HEALTHCHECK_TIMEOUT");
      return { ok: true, state, role: options.config.role };
    } catch {
      return { ok: false, state, role: options.config.role };
    }
  };

  const close = async (): Promise<void> => {
    if (state === "CLOSED") return;
    state = "CLOSED";
    await options.driver.close();
  };

  return { get state() { return state; }, role: options.config.role, execute, beginTransaction, healthCheck, close };
}
