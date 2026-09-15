export type RuntimeEnvironment = "development" | "test" | "staging" | "production";

export type ReadinessDependency = Readonly<{
  name: string;
  ready: boolean;
  detail?: string;
}>;

export type RuntimeHealth = Readonly<{
  status: "ok" | "degraded" | "failed";
  environment: RuntimeEnvironment;
  version: string;
  dependencies: readonly ReadinessDependency[];
}>;

export type RuntimeConfig = Readonly<{
  environment: RuntimeEnvironment;
  version: string;
  aiEnabled: boolean;
  migrationFreeze: boolean;
}>;

export function evaluateReadiness(config: RuntimeConfig, dependencies: readonly ReadinessDependency[]): RuntimeHealth {
  const failed = dependencies.filter((dependency) => !dependency.ready);
  return {
    status: failed.length === 0 ? "ok" : "failed",
    environment: config.environment,
    version: config.version,
    dependencies: dependencies.map(({ name, ready }) => ({ name, ready })),
  };
}

export function assertSafeRuntimeConfig(config: RuntimeConfig): void {
  if (!config.version.trim()) throw new Error("RUNTIME_VERSION_REQUIRED");
  if (config.environment === "production" && !config.migrationFreeze) {
    throw new Error("MIGRATION_FREEZE_REQUIRED");
  }
}
