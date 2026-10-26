export type CorrelationId = string;
export type IdempotencyKey = string;

const SAFE_ID = /^[A-Za-z0-9._:-]{8,200}$/;

export function requireCorrelationId(value?: string): CorrelationId {
  const id = value?.trim();
  if (id && SAFE_ID.test(id)) return id;
  return crypto.randomUUID();
}

export function requireIdempotencyKey(value?: string): IdempotencyKey | undefined {
  const key = value?.trim();
  if (!key) return undefined;
  if (!SAFE_ID.test(key)) throw new Error("Invalid idempotency key format");
  return key;
}
