export type PostgresExecutionMode = "DISABLED" | "NON_PRODUCTION_READ_ONLY" | "NON_PRODUCTION_WRITE";

export type PostgresBoundaryConfig = Readonly<{
  mode: PostgresExecutionMode;
  targetName?: string;
  migrationFreeze: boolean;
  production: boolean;
}>;

export function assertPostgresBoundary(config: PostgresBoundaryConfig): void {
  if (config.mode === "DISABLED") return;
  if (!config.targetName?.trim()) throw new Error("POSTGRES_TARGET_REQUIRED");
  if (config.production) throw new Error("PRODUCTION_POSTGRES_NOT_AUTHORIZED");
  if (!config.migrationFreeze) throw new Error("MIGRATION_FREEZE_REQUIRED");
}

export function isWriteEnabled(config: PostgresBoundaryConfig): boolean {
  assertPostgresBoundary(config);
  return config.mode === "NON_PRODUCTION_WRITE";
}
