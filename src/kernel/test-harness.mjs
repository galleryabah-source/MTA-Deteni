import { createHash } from 'node:crypto';

const ALLOWED_RESULTS = new Set(['PASS', 'FAIL', 'BLOCKED', 'NOT_RUN']);

export function assertTestEnvironment(env = process.env) {
  const appEnv = env.APP_ENV ?? env.NODE_ENV;
  const databaseUrl = env.DATABASE_URL ?? '';
  if (appEnv === 'production' || /^prod(uction)?[:/]/i.test(databaseUrl)) throw new Error('TEST_ENVIRONMENT_PRODUCTION_FORBIDDEN');
  if (!['test', 'development', 'staging'].includes(appEnv)) throw new Error('TEST_ENVIRONMENT_AMBIGUOUS');
  return Object.freeze({ environment: appEnv, aiEnabled: env.AI_ENABLED === 'true', migrationFreeze: env.MIGRATION_FREEZE !== 'false' });
}

export function recordTest(registry, input) {
  if (!/^(?:[A-Z]+|KERNEL-CERT)-\d{3}$/.test(input.testId)) throw new Error('TEST_ID_INVALID');
  if (!ALLOWED_RESULTS.has(input.result)) throw new Error('TEST_RESULT_INVALID');
  registry.push(Object.freeze({ testId: input.testId, requirement: input.requirement ?? null, sourceContract: input.sourceContract ?? null, result: input.result, severity: input.severity ?? 'P1', evidence: input.evidence ?? null }));
}

export function buildEvidenceBundle({ runId, commitSha, environment, appVersion, fixtureVersion, aiEnabled, migrationFreeze, results, correlationIds = [] }) {
  if (!runId || !commitSha || !environment || !appVersion || !fixtureVersion) throw new Error('EVIDENCE_METADATA_REQUIRED');
  const normalized = results.map((r) => ({ testId: r.testId, result: r.result, severity: r.severity ?? 'P1', evidence: r.evidence ?? null }));
  const payload = JSON.stringify({ runId, commitSha, environment, appVersion, fixtureVersion, aiEnabled: Boolean(aiEnabled), migrationFreeze: Boolean(migrationFreeze), results: normalized, correlationIds });
  return Object.freeze({ runId, commitSha, environment, appVersion, fixtureVersion, configurationMode: aiEnabled ? 'AI_ON' : 'AI_OFF', migrationFreeze: Boolean(migrationFreeze), results: normalized, correlationIds: [...correlationIds], evidenceSha256: createHash('sha256').update(payload).digest('hex') });
}
