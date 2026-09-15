export type DatabaseEnvironment = "DEVELOPMENT" | "TEST" | "STAGING" | "PRODUCTION";
export type DatabaseAccessMode = "READ" | "WRITE" | "TRANSACTION";

export type DatabaseConfig = Readonly<{
  environment: DatabaseEnvironment;
  url: string;
  poolSize: number;
  timeoutMs: number;
  allowProduction: boolean;
}>;

export type DatabaseAdapter = Readonly<{
  execute: (sql: string, params?: readonly unknown[]) => Promise<unknown>;
  transaction: <T>(work: (tx: DatabaseTransaction) => Promise<T>) => Promise<T>;
}>;

export type DatabaseTransaction = Readonly<{
  execute: (sql: string, params?: readonly unknown[]) => Promise<unknown>;
}>;

export const DATABASE_GOVERNANCE = Object.freeze({
  migrationAllowed: false,
  liveProductionExecutionAllowed: false,
  syntheticRepositoryDataOnly: true,
});

export function validateDatabaseConfig(config: DatabaseConfig): void {
  if (!config.url.trim()) throw new Error("Database URL is required.");
  if (!Number.isInteger(config.poolSize) || config.poolSize < 1) throw new Error("Database pool size must be a positive integer.");
  if (!Number.isInteger(config.timeoutMs) || config.timeoutMs < 1) throw new Error("Database timeout must be a positive integer.");
  if (config.environment === "PRODUCTION" && !config.allowProduction) throw new Error("Production database access is not authorized.");
}

export function assertDatabaseAccess(mode: DatabaseAccessMode, config: DatabaseConfig): void {
  validateDatabaseConfig(config);
  if (mode !== "READ" && !config.allowProduction && config.environment === "PRODUCTION") {
    throw new Error("Database mutation is not authorized for this environment.");
  }
  if (mode === "TRANSACTION" && !config.url.trim()) throw new Error("Transaction requires a database target.");
}

export function createDatabaseAdapter(factory: Readonly<{
  execute: DatabaseAdapter["execute"];
  transaction: DatabaseAdapter["transaction"];
}> , config: DatabaseConfig): DatabaseAdapter {
  validateDatabaseConfig(config);
  return Object.freeze({
    execute: async (sql, params) => {
      assertDatabaseAccess("READ", config);
      return factory.execute(sql, params);
    },
    transaction: async (work) => {
      assertDatabaseAccess("TRANSACTION", config);
      return factory.transaction(work);
    },
  });
}

export type SchemaObjectKind = "TABLE" | "INDEX" | "CONSTRAINT" | "ENUM" | "FUNCTION";
export type SchemaComparisonStatus = "MATCH" | "MISSING" | "EXTRA" | "DRIFT" | "NOT_INSPECTED";

export type SchemaContractEntry = Readonly<{
  kind: SchemaObjectKind;
  name: string;
  expectedDefinition: string;
  status: SchemaComparisonStatus;
}>;

export type SchemaContractMatrix = Readonly<{
  contractVersion: string;
  inspectedEnvironment: DatabaseEnvironment | "NOT_CONNECTED";
  migrationAllowed: false;
  entries: readonly SchemaContractEntry[];
}>;

export function createSchemaContractMatrix(input: Readonly<{
  contractVersion: string;
  inspectedEnvironment: SchemaContractMatrix["inspectedEnvironment"];
  entries: readonly SchemaContractEntry[];
}>): SchemaContractMatrix {
  if (!input.contractVersion.trim()) throw new Error("Schema contract version is required.");
  if (input.entries.some((entry) => !entry.name.trim() || !entry.expectedDefinition.trim())) throw new Error("Schema contract entries require identity and expected definition.");
  return Object.freeze({
    contractVersion: input.contractVersion,
    inspectedEnvironment: input.inspectedEnvironment,
    migrationAllowed: false,
    entries: Object.freeze(input.entries.map((entry) => Object.freeze({ ...entry }))),
  });
}

export function assertMigrationFreeze(matrix: SchemaContractMatrix): void {
  if (matrix.migrationAllowed !== false || DATABASE_GOVERNANCE.migrationAllowed) throw new Error("Migration freeze has been violated.");
}

export function assertNoUnreviewedSchemaDrift(matrix: SchemaContractMatrix): void {
  assertMigrationFreeze(matrix);
  const blocking = matrix.entries.filter((entry) => entry.status === "MISSING" || entry.status === "DRIFT");
  if (blocking.length > 0) throw new Error(`Schema contract has ${blocking.length} unreviewed blocking difference(s).`);
}
