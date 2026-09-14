import { randomUUID } from 'node:crypto';

const HEALTH = new Set(['UP', 'DEGRADED', 'DOWN', 'DISABLED']);
const SECRET_KEYS = /password|secret|token|api[_-]?key|authorization|signed[_-]?url|connection[_-]?string/i;
const SENSITIVE_KEYS = /detainee|health|medical|document[_-]?content|whatsapp[_-]?message/i;

function safeId(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const text = String(value);
  if (!/^[A-Za-z0-9._:-]{1,128}$/.test(text)) return undefined;
  return text;
}

export function createRequestContext(input = {}) {
  const requestId = safeId(input.requestId) ?? randomUUID();
  const correlationId = safeId(input.correlationId) ?? requestId;
  return Object.freeze({ requestId, correlationId, ...(safeId(input.actorId) ? { actorId: safeId(input.actorId) } : {}), ...(safeId(input.scope) ? { scope: safeId(input.scope) } : {}), ...(safeId(input.policyVersion) ? { policyVersion: safeId(input.policyVersion) } : {}) });
}

export function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== 'object') return value;
  const result = {};
  for (const [key, child] of Object.entries(value)) {
    if (SECRET_KEYS.test(key)) result[key] = '[REDACTED]';
    else if (SENSITIVE_KEYS.test(key)) result[key] = '[OMITTED]';
    else result[key] = redact(child);
  }
  return result;
}

export function safeErrorResponse(code, message, correlationId) {
  if (!/^[A-Z0-9_:-]{1,96}$/.test(code)) throw new Error('INVALID_ERROR_CODE');
  return Object.freeze({ success: false, error: { code, message: String(message).replace(/[\r\n]/g, ' ').slice(0, 240) }, correlationId });
}

export function componentHealth(component, status, extra = {}) {
  if (!HEALTH.has(status)) throw new Error('INVALID_HEALTH_STATUS');
  return Object.freeze({ component, status, checkedAt: extra.checkedAt ?? new Date().toISOString(), ...(extra.latencyMs !== undefined ? { latencyMs: extra.latencyMs } : {}), ...(extra.version ? { version: extra.version } : {}), ...(extra.reasonCode ? { reasonCode: extra.reasonCode } : {}) });
}

export function buildHealth({ appVersion, environment, correlationId, components }) {
  const critical = components.filter((c) => ['CORE', 'DATABASE', 'AUTH'].includes(c.component));
  const status = critical.some((c) => c.status === 'DOWN') ? 'DOWN' : critical.some((c) => c.status === 'DEGRADED') ? 'DEGRADED' : 'UP';
  return Object.freeze({ status, appVersion, environment, checkedAt: new Date().toISOString(), components: components.map((c) => componentHealth(c.component, c.status, c)), correlationId });
}

export class MetricsRegistry {
  #counters = new Map();
  increment(name, value = 1) {
    if (!/^[a-z][a-z0-9_.:-]{0,127}$/.test(name) || !Number.isFinite(value) || value < 0) throw new Error('METRIC_INPUT_INVALID');
    this.#counters.set(name, (this.#counters.get(name) ?? 0) + value);
  }
  snapshot() { return Object.fromEntries(this.#counters); }
}

export function structuredLog(input) {
  const safe = redact(input);
  const allowed = ['level', 'service', 'version', 'environment', 'timestamp', 'request_id', 'correlation_id', 'actor_id', 'action', 'component', 'result', 'error_code', 'latency_ms'];
  return Object.freeze(Object.fromEntries(Object.entries(safe).filter(([key]) => allowed.includes(key))));
}
