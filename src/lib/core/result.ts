export type CoreErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "NOT_FOUND"
  | "POLICY_BLOCKED"
  | "DEPENDENCY_UNAVAILABLE"
  | "INTERNAL_ERROR";

export interface CoreError {
  readonly code: CoreErrorCode;
  readonly message: string;
  readonly correlationId: string;
  readonly retryable: boolean;
  readonly details?: Readonly<Record<string, unknown>>;
}

export type CoreResult<T> =
  | { readonly ok: true; readonly value: T; readonly correlationId: string }
  | { readonly ok: false; readonly error: CoreError };

export const ok = <T>(value: T, correlationId: string): CoreResult<T> => ({
  ok: true,
  value,
  correlationId,
});

export const fail = (
  error: CoreError,
): CoreResult<never> => ({ ok: false, error });
