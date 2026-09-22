export type ProtectedQrProjection = Readonly<{
  allowed: boolean;
  resourceId: string;
  actorId: string;
  requiresRbac: true;
  reason: "QR_VALIDATION_REQUIRED" | "AUTH_REQUIRED" | "RBAC_REQUIRED" | "QR_DENIED";
}>;

export type QrAuditEvent = Readonly<{
  eventId: string;
  action: "QR_RESOLVE" | "QR_PROTECTED_PROJECTION";
  resourceId: string;
  actorId: string;
  outcome: string;
  correlationId: string;
}>;

export function createProtectedQrProjection(input: {
  resolution: { outcome: string; resourceId: string };
  actorId: string;
  authenticated: boolean;
  authorized: boolean;
  correlationId: string;
}): { projection: ProtectedQrProjection; audit: QrAuditEvent[] } {
  const audit: QrAuditEvent[] = [{
    eventId: "AUD-" + input.correlationId,
    action: "QR_RESOLVE",
    resourceId: input.resolution.resourceId,
    actorId: input.actorId,
    outcome: input.resolution.outcome,
    correlationId: input.correlationId
  }];
  const allowed = input.resolution.outcome === "ACCEPTED" && input.authenticated && input.authorized;
  const reason = input.resolution.outcome !== "ACCEPTED" ? "QR_DENIED" : !input.authenticated ? "AUTH_REQUIRED" : !input.authorized ? "RBAC_REQUIRED" : "QR_VALIDATION_REQUIRED";
  audit.push({
    eventId: "AUD-" + input.correlationId + "-PROJECTION",
    action: "QR_PROTECTED_PROJECTION",
    resourceId: input.resolution.resourceId,
    actorId: input.actorId,
    outcome: allowed ? "ALLOWED" : "DENIED",
    correlationId: input.correlationId
  });
  return {
    projection: { allowed, resourceId: input.resolution.resourceId, actorId: input.actorId, requiresRbac: true, reason },
    audit
  };
}