export type DatabaseEnvironment =
  | "DEVELOPMENT"
  | "TEST"
  | "STAGING"
  | "PRODUCTION";

export type DatabaseRole = "APP_RUNTIME" | "MIGRATION" | "READONLY";

export interface DatabaseConfig {
  environment: DatabaseEnvironment;
  role: DatabaseRole;
  connectionString: string;
  poolSize?: number;
  timeoutMs?: number;
}

export interface DatabaseQuery {
  text: string;
  values?: readonly unknown[];
}

export interface DatabaseResult<Row = unknown> {
  rows: Row[];
  rowCount: number;
}

export interface DatabaseClient {
  query<Row = unknown>(query: DatabaseQuery): Promise<DatabaseResult<Row>>;
  release(): Promise<void>;
}

export interface DatabaseAdapter {
  readonly environment: DatabaseEnvironment;
  readonly role: DatabaseRole;
  connect(): Promise<DatabaseClient>;
  healthcheck(): Promise<{ ok: boolean }>;
  close(): Promise<void>;
}

export function validateDatabaseConfig(config: DatabaseConfig): void {
  if (!config.connectionString.trim()) {
    throw new Error("DATABASE_URL_REQUIRED");
  }

  if (config.role === "MIGRATION" && config.environment === "PRODUCTION") {
    throw new Error("PRODUCTION_MIGRATION_ROLE_REQUIRES_CHANGE_CONTROL");
  }

  if (config.poolSize !== undefined && config.poolSize < 1) {
    throw new Error("DATABASE_POOL_SIZE_INVALID");
  }

  if (config.timeoutMs !== undefined && config.timeoutMs < 1) {
    throw new Error("DATABASE_TIMEOUT_INVALID");
  }
}
