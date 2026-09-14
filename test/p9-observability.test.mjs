import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHealth, componentHealth, createRequestContext, MetricsRegistry, redact, safeErrorResponse, structuredLog } from '../src/kernel/observability.mjs';

test('OBS-001 liveness/health core UP', () => {
  const health = buildHealth({ appVersion: '0.1.0', environment: 'test', correlationId: 'c1', components: [componentHealth('CORE', 'UP'), componentHealth('DATABASE', 'UP'), componentHealth('AUTH', 'UP'), componentHealth('AI_OPTIONAL', 'DISABLED')] });
  assert.equal(health.status, 'UP');
  assert.equal(health.components.find((x) => x.component === 'AI_OPTIONAL').status, 'DISABLED');
});

test('OBS-003 database DOWN makes readiness DOWN', () => {
  const health = buildHealth({ appVersion: '0.1.0', environment: 'test', correlationId: 'c2', components: [componentHealth('CORE', 'UP'), componentHealth('DATABASE', 'DOWN'), componentHealth('AUTH', 'UP')] });
  assert.equal(health.status, 'DOWN');
});

test('OBS-004 optional AI disabled does not block core', () => {
  const health = buildHealth({ appVersion: '0.1.0', environment: 'test', correlationId: 'c3', components: [componentHealth('CORE', 'UP'), componentHealth('DATABASE', 'UP'), componentHealth('AUTH', 'UP'), componentHealth('AI_OPTIONAL', 'DISABLED')] });
  assert.equal(health.status, 'UP');
});

test('OBS-005/006 correlation context generates and preserves IDs', () => {
  const ctx = createRequestContext({ requestId: 'req-1', correlationId: 'corr-1', actorId: 'u-1', scope: 'scope-1', policyVersion: 'AUTHZ-1.0' });
  assert.deepEqual(ctx, { requestId: 'req-1', correlationId: 'corr-1', actorId: 'u-1', scope: 'scope-1', policyVersion: 'AUTHZ-1.0' });
});

test('OBS-009 structured logs use an allowlist', () => {
  const log = structuredLog({ level: 'info', service: 'mta', correlation_id: 'c1', action: 'READ', payload: 'MUST_NOT_APPEAR' });
  assert.equal(log.payload, undefined); assert.equal(log.correlation_id, 'c1');
});

test('OBS-010/011/012 secret and sensitive fields are redacted or omitted', () => {
  const result = redact({ password: 'x', api_key: 'y', signed_url: 'https://example.invalid/secret', detaineeHealth: 'private', nested: { token: 'z' } });
  assert.equal(result.password, '[REDACTED]'); assert.equal(result.api_key, '[REDACTED]'); assert.equal(result.signed_url, '[REDACTED]'); assert.equal(result.detaineeHealth, '[OMITTED]'); assert.equal(result.nested.token, '[REDACTED]');
});

test('OBS-013 safe error response strips line breaks and bounds message', () => {
  const response = safeErrorResponse('INTERNAL_ERROR', 'safe\nmessage', 'corr-1');
  assert.deepEqual(response, { success: false, error: { code: 'INTERNAL_ERROR', message: 'safe message' }, correlationId: 'corr-1' });
});

test('OBS-015/016 metrics accept bounded counter names', () => {
  const metrics = new MetricsRegistry(); metrics.increment('auth.denied'); metrics.increment('db.latency', 3);
  assert.deepEqual(metrics.snapshot(), { 'auth.denied': 1, 'db.latency': 3 });
  assert.throws(() => metrics.increment('Bad Metric'), /METRIC_INPUT_INVALID/);
});

test('OBS-025 AI-OFF observability remains operational', () => {
  const health = buildHealth({ appVersion: '0.1.0', environment: 'test', correlationId: 'corr-ai-off', components: [componentHealth('CORE', 'UP'), componentHealth('DATABASE', 'UP'), componentHealth('AUTH', 'UP'), componentHealth('AI_OPTIONAL', 'DISABLED')] });
  assert.equal(health.status, 'UP');
});
