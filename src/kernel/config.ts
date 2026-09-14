export type AppEnv = 'development' | 'test' | 'staging' | 'production';

export type AppConfig = Readonly<{
  appName: string;
  appVersion: string;
  appEnv: AppEnv;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  databaseUrl?: string;
  databasePoolSize: number;
  databaseTimeoutMs: number;
  authSecret?: string;
  sessionSecret?: string;
  sessionTtlSeconds: number;
  aiEnabled: boolean;
  aiProvider?: string;
  aiApiKey?: string;
}>;

const required = (env: Record<string, string | undefined>, key: string): string => {
  const value = env[key]?.trim();
  if (!value) throw new Error(`Missing required configuration: ${key}`);
  return value;
};

const integer = (env: Record<string, string | undefined>, key: string, fallback: number): number => {
  const raw = env[key];
  if (raw === undefined || raw.trim() === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) throw new Error(`Invalid positive integer configuration: ${key}`);
  return value;
};

export function loadConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  const appEnv = (env.APP_ENV ?? env.NODE_ENV ?? 'development') as AppEnv;
  if (!['development', 'test', 'staging', 'production'].includes(appEnv)) throw new Error('Invalid APP_ENV');

  const aiEnabled = env.AI_ENABLED === 'true';
  if (aiEnabled) {
    required(env, 'AI_PROVIDER');
    required(env, 'AI_API_KEY');
  }

  const criticalRequired = appEnv === 'production';
  return Object.freeze({
    appName: env.APP_NAME?.trim() || 'MTA DETENI',
    appVersion: env.APP_VERSION?.trim() || '0.1.0',
    appEnv,
    logLevel: (env.LOG_LEVEL as AppConfig['logLevel'] | undefined) ?? 'info',
    databaseUrl: criticalRequired ? required(env, 'DATABASE_URL') : env.DATABASE_URL?.trim(),
    databasePoolSize: integer(env, 'DATABASE_POOL_SIZE', 10),
    databaseTimeoutMs: integer(env, 'DATABASE_TIMEOUT_MS', 5000),
    authSecret: criticalRequired ? required(env, 'AUTH_SECRET') : env.AUTH_SECRET?.trim(),
    sessionSecret: criticalRequired ? required(env, 'SESSION_SECRET') : env.SESSION_SECRET?.trim(),
    sessionTtlSeconds: integer(env, 'SESSION_TTL_SECONDS', 28800),
    aiEnabled,
    aiProvider: env.AI_PROVIDER?.trim(),
    aiApiKey: aiEnabled ? env.AI_API_KEY?.trim() : undefined,
  });
}
