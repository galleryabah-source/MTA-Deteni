export type MutationIdentity = Readonly<{
  idempotencyKey: string;
  fingerprint: string;
  actorId: string;
  correlationId: string;
}>;

export type IdempotencyDecision = "ACQUIRED" | "REPLAY" | "CONFLICT";

const nonBlank = (value: string) => value.trim().length > 0;

export function evaluateIdempotencyIdentity(value: MutationIdentity): "READY" | "BLOCKED" {
  return nonBlank(value.idempotencyKey) && nonBlank(value.fingerprint) && nonBlank(value.actorId) && nonBlank(value.correlationId)
    ? "READY" : "BLOCKED";
}

export function resolveIdempotency(existingFingerprint: string | null, requestedFingerprint: string): IdempotencyDecision {
  if (!nonBlank(requestedFingerprint)) return "CONFLICT";
  if (existingFingerprint === null) return "ACQUIRED";
  return existingFingerprint === requestedFingerprint ? "REPLAY" : "CONFLICT";
}
