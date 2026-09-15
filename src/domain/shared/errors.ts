export const DOMAIN_ERROR_CODES = {
  VALIDATION_FAILED: "VALIDATION_FAILED",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN_SCOPE: "FORBIDDEN_SCOPE",
  CONFLICT: "CONFLICT",
  STALE_STATE: "STALE_STATE",
  INVALID_STATE: "INVALID_STATE",
  IDEMPOTENCY_REPLAY: "IDEMPOTENCY_REPLAY",
  INTEGRITY_FAILURE: "INTEGRITY_FAILURE",
  RESTRICTED_DATA: "RESTRICTED_DATA",
  SYSTEM_FAILURE: "SYSTEM_FAILURE",
} as const;

export type DomainErrorCode = (typeof DOMAIN_ERROR_CODES)[keyof typeof DOMAIN_ERROR_CODES];

export class DomainError extends Error {
  public readonly code: DomainErrorCode;
  public readonly retryable: boolean;

  constructor(code: DomainErrorCode, message: string, retryable = false) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.retryable = retryable;
  }
}
