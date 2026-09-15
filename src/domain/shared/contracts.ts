export const DETAINEE_STATUSES = [
  "ACTIVE",
  "TRANSFERRED",
  "DEPARTED",
  "CLOSED",
] as const;

export const TEMPORARY_EXIT_STATES = [
  "REQUESTED",
  "VALIDATED",
  "APPROVED",
  "DOCUMENTED",
  "ESCORT_ASSIGNED",
  "DEPARTED",
  "RETURN_PENDING",
  "RETURNED",
  "COMPLETED",
] as const;

export type DetaineeStatus = (typeof DETAINEE_STATUSES)[number];
export type TemporaryExitState = (typeof TEMPORARY_EXIT_STATES)[number];

export type DomainName = "RAP" | "PERKES" | "KAMTIB" | "SUBBAG_TU" | "LEADERSHIP";

export type ActorContext = Readonly<{
  actorId: string;
  role: string;
  domain: DomainName;
  scope: Readonly<Record<string, string>>;
  correlationId: string;
  idempotencyKey?: string;
}>;

export type Provenance = Readonly<{
  sourceType: "MANUAL" | "IMPORT" | "OCR" | "WHATSAPP" | "AI_ASSISTED";
  capturedAt: string;
  verified: boolean;
  verifiedBy?: string;
}>;

export type DomainCommand<TPayload> = Readonly<{
  payload: TPayload;
  actor: ActorContext;
}>;

export type DomainResult<T> =
  | Readonly<{ ok: true; value: T; auditEventId: string }>
  | Readonly<{ ok: false; code: string; message: string; retryable: boolean }>;

export type AuditEvent = Readonly<{
  eventId: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  actorId: string;
  correlationId: string;
  occurredAt: string;
  payloadHash: string;
}>;
