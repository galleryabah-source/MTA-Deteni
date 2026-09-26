export type DatabaseRole = "APPLICATION" | "MIGRATION" | "READ_ONLY" | "REPORTING" | "AI_PROCESSOR";

export type DatabaseAdapterState = "UNINITIALIZED" | "READY" | "CLOSED";

export type DatabaseAdapterConfig = Readonly<{
  role: DatabaseRole;
  databaseUrl: string;
  poolSize?: number;
  statementTimeoutMs?: number;
}>;

export type DatabaseQuery = Readonly<{
  text: string;
  parameters: readonly unknown[];
}>;

export type DatabaseQueryResult<Row extends object = Record<string, unknown>> = Readonly<{
  rows: readonly Row[];
  rowCount: number;
}>;

export type DatabaseTransaction = Readonly<{
  transactionId: string;
  execute: <Row extends object = Record<string, unknown>>(query: DatabaseQuery) => Promise<DatabaseQueryResult<Row>>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
}>;

export type DatabaseAdapter = Readonly<{
  state: DatabaseAdapterState;
  role: DatabaseRole;
  execute: <Row extends object = Record<string, unknown>>(query: DatabaseQuery) => Promise<DatabaseQueryResult<Row>>;
  beginTransaction: (transactionId: string) => Promise<DatabaseTransaction>;
  close: () => Promise<void>;
}>;

export function validateDatabaseAdapterConfig(config: DatabaseAdapterConfig): void {
  if (!config.databaseUrl.trim()) throw new Error("DATABASE_URL is required for a database adapter.");
  if (config.poolSize !== undefined && (!Number.isInteger(config.poolSize) || config.poolSize < 1)) {
    throw new Error("DATABASE_POOL_SIZE must be a positive integer.");
  }
  if (config.statementTimeoutMs !== undefined && (!Number.isInteger(config.statementTimeoutMs) || config.statementTimeoutMs < 1)) {
    throw new Error("DATABASE_TIMEOUT_MS must be a positive integer.");
  }
}

export function assertDatabaseRoleForRuntime(role: DatabaseRole): void {
  if (role === "MIGRATION") throw new Error("MIGRATION_ROLE_BLOCKED_BY_GOVERNANCE_FREEZE");
}

export function createDatabaseAdapterContract(config: DatabaseAdapterConfig): DatabaseAdapter {
  validateDatabaseAdapterConfig(config);
  assertDatabaseRoleForRuntime(config.role);

  let state: DatabaseAdapterState = "UNINITIALIZED";
  const unavailable = async (): Promise<never> => {
    throw new Error("DATABASE_ADAPTER_RUNTIME_NOT_BOUND");
  };

  return {
    get state() {
      return state;
    },
    role: config.role,
    execute: unavailable,
    beginTransaction: async (transactionId: string) => {
      if (!transactionId.trim()) throw new Error("TRANSACTION_ID_REQUIRED");
      throw new Error("DATABASE_ADAPTER_RUNTIME_NOT_BOUND");
    },
    close: async () => {
      state = "CLOSED";
    },
  };
}
