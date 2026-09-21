import { DomainError } from "../domain/shared/errors.js";
import type { IdempotencyPort, MutationGuard } from "./ports.js";

export async function acquireMutation<T>(
  guard: MutationGuard,
  fingerprint: string,
  idempotency: IdempotencyPort<T>,
): Promise<T | null> {
  const state = await idempotency.begin(guard.idempotencyKey, fingerprint);
  if (state === "REPLAY") {
    const result = await idempotency.replay(guard.idempotencyKey);
    if (result !== null) return result;
    throw new DomainError("INTEGRITY_FAILURE", "Idempotency store reported replay without a stored result.");
  }
  if (state === "CONFLICT") throw new DomainError("CONFLICT", "Idempotency key is bound to a different mutation fingerprint.");
  return null;
}

export async function completeMutation<T>(guard: MutationGuard, result: T, idempotency: IdempotencyPort<T>): Promise<void> {
  await idempotency.complete(guard.idempotencyKey, result);
}
