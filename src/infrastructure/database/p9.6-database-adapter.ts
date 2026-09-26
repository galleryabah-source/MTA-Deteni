import type { DatabaseAdapterConfig, DatabaseAdapterState, DatabaseQuery, DatabaseQueryResult, DatabaseRole, DatabaseTransaction } from "../../application/database-adapter-contract.js";

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

export function createP96DatabaseAdapter(options: P96DatabaseAdapterOptions) {
  const production = options.production ?? false;
  const migrationFreeze = options.migrationFreeze ?? true;
  if (options.config.role === "MIGRATION") throw new Error("MIGRATION_ROLE_BLOCKED_BY_GOVERNANCE_FREEZE");
  if (production) throw new Error("PRODUCTION_POSTGRES_NOT_AUTHORIZED");
  if (!migrationFreeze) throw new Error("MIGRATION_FREEZE_REQUIRED");

  let state: DatabaseAdapterState = "READY";
  const assertReady = () => { if (state !== "READY") throw new Error("DATABASE_ADAPTER_NOT_READY"); };

  const execute = async <Row extends object = Record<string, unknown>>(query: DatabaseQuery): Promise<DatabaseQueryResult<Row>> => {
    assertReady();
    return options.driver.query<Row>(query.text, query.parameters);
  };

  const beginTransaction = async (transactionId: string): Promise<DatabaseTransaction> => {
    assertReady();
    if (!transactionId.trim()) throw new Error("TRANSACTION_ID_REQUIRED");
    const tx = await options.driver.begin(transactionId);
    return { transactionId, execute: tx.execute, commit: tx.commit, rollback: tx.rollback };
  };

  const healthCheck = async (): Promise<P96DatabaseHealth> => {
    if (state !== "READY") return { ok: false, state, role: options.config.role };
    try {
      await options.driver.query("select 1 as ok", []);
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
