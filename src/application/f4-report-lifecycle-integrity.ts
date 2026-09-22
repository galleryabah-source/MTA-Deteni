export const F4_REPORT_LIFECYCLE_VERSION = "F4-DGR-LIFECYCLE-v1";

export const F4_REPORT_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  VALIDATED: "VALIDATED",
  GENERATED: "GENERATED",
  IN_REVIEW: "IN_REVIEW",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
  APPROVED: "APPROVED",
  FINAL: "FINAL",
} as const);

export type F4ReportStatus = typeof F4_REPORT_STATUS[keyof typeof F4_REPORT_STATUS];

export type F4ReportAction =
  | "CREATE" | "VALIDATE" | "GENERATE" | "START_REVIEW"
  | "REQUEST_CHANGES" | "REVISE" | "APPROVE" | "FINALIZE"
  | "DOWNLOAD" | "VERIFY_INTEGRITY";

export type F4Actor = Readonly<{ actorId: string; role: string }>;

export type F4ReportEvent = Readonly<{
  id: string;
  action: F4ReportAction;
  from: F4ReportStatus | null;
  to: F4ReportStatus | null;
  actor: F4Actor;
  occurredAt: string;
  correlationId: string;
  requestId: string;
}>;

export type F4ReportRevision = Readonly<{
  revisionId: string;
  parentRevisionId: string | null;
  createdAt: string;
  reason?: string;
}>;

export type F4ReportLifecycle = Readonly<{
  version: typeof F4_REPORT_LIFECYCLE_VERSION;
  reportId: string;
  status: F4ReportStatus;
  revision: F4ReportRevision;
  events: readonly F4ReportEvent[];
  integrityHash: string | null;
  finalArtifactId: string | null;
}>;

const TRANSITIONS: Readonly<Record<F4ReportStatus, readonly F4ReportStatus[]>> = Object.freeze({
  DRAFT: ["VALIDATED"],
  VALIDATED: ["GENERATED"],
  GENERATED: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "CHANGES_REQUESTED"],
  CHANGES_REQUESTED: ["DRAFT"],
  APPROVED: ["FINAL"],
  FINAL: [],
});

const ACTIONS: Readonly<Record<string, F4ReportAction>> = Object.freeze({
  "DRAFT>VALIDATED": "VALIDATE",
  "VALIDATED>GENERATED": "GENERATE",
  "GENERATED>IN_REVIEW": "START_REVIEW",
  "IN_REVIEW>APPROVED": "APPROVE",
  "IN_REVIEW>CHANGES_REQUESTED": "REQUEST_CHANGES",
  "CHANGES_REQUESTED>DRAFT": "REVISE",
  "APPROVED>FINAL": "FINALIZE",
});

function requireText(value: unknown, code: string): string {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(code);
  return text;
}

function requireActor(actor: F4Actor): F4Actor {
  requireText(actor.actorId, "F4_ACTOR_REQUIRED");
  requireText(actor.role, "F4_ACTOR_ROLE_REQUIRED");
  return Object.freeze({ actorId: actor.actorId, role: actor.role });
}

function requireTime(value: string): string {
  const text = requireText(value, "F4_TIMESTAMP_REQUIRED");
  if (Number.isNaN(Date.parse(text))) throw new Error("F4_TIMESTAMP_INVALID");
  return text;
}

function eventId(reportId: string, action: F4ReportAction, requestId: string): string {
  return `F4EV-${reportId}-${action}-${requestId}`;
}

function context(input: Readonly<{ actor: F4Actor; occurredAt: string; correlationId: string; requestId: string }>) {
  return {
    actor: requireActor(input.actor),
    occurredAt: requireTime(input.occurredAt),
    correlationId: requireText(input.correlationId, "F4_CORRELATION_ID_REQUIRED"),
    requestId: requireText(input.requestId, "F4_REQUEST_ID_REQUIRED"),
  };
}

export function createF4ReportLifecycle(input: Readonly<{
  reportId: string; revisionId?: string; createdAt: string;
  actor: F4Actor; correlationId: string; requestId: string;
}>): F4ReportLifecycle {
  const reportId = requireText(input.reportId, "F4_REPORT_ID_REQUIRED");
  const revisionId = requireText(input.revisionId ?? "REV-001", "F4_REVISION_ID_REQUIRED");
  const createdAt = requireTime(input.createdAt);
  const actor = requireActor(input.actor);
  const correlationId = requireText(input.correlationId, "F4_CORRELATION_ID_REQUIRED");
  const requestId = requireText(input.requestId, "F4_REQUEST_ID_REQUIRED");
  const event: F4ReportEvent = Object.freeze({
    id: eventId(reportId, "CREATE", requestId),
    action: "CREATE", from: null, to: F4_REPORT_STATUS.DRAFT,
    actor, occurredAt: createdAt, correlationId, requestId,
  });
  return Object.freeze({
    version: F4_REPORT_LIFECYCLE_VERSION, reportId, status: F4_REPORT_STATUS.DRAFT,
    revision: Object.freeze({ revisionId, parentRevisionId: null, createdAt }),
    events: Object.freeze([event]), integrityHash: null, finalArtifactId: null,
  });
}

export function transitionF4Report(
  report: F4ReportLifecycle,
  to: F4ReportStatus,
  input: Readonly<{ actor: F4Actor; occurredAt: string; correlationId: string; requestId: string; reason?: string }>,
): F4ReportLifecycle {
  if (!TRANSITIONS[report.status]?.includes(to)) throw new Error(`F4_INVALID_TRANSITION:${report.status}>${to}`);
  if (report.status === F4_REPORT_STATUS.FINAL) throw new Error("F4_FINAL_IMMUTABLE");
  const c = context(input);
  const action = ACTIONS[`${report.status}>${to}`];
  if (!action) throw new Error("F4_ACTION_MAPPING_MISSING");
  const event: F4ReportEvent = Object.freeze({
    id: eventId(report.reportId, action, c.requestId),
    action, from: report.status, to,
    actor: c.actor, occurredAt: c.occurredAt, correlationId: c.correlationId, requestId: c.requestId,
  });
  const revision = to === F4_REPORT_STATUS.DRAFT && report.status === F4_REPORT_STATUS.CHANGES_REQUESTED
    ? Object.freeze({
        revisionId: `REV-${String(report.events.filter((e) => e.action === "REVISE").length + 2).padStart(3, "0")}`,
        parentRevisionId: report.revision.revisionId,
        createdAt: c.occurredAt,
        reason: requireText(input.reason, "F4_REVISION_REASON_REQUIRED"),
      })
    : report.revision;
  return Object.freeze({ ...report, status: to, revision, events: Object.freeze([...report.events, event]) });
}

export function attachFinalIntegrity(report: F4ReportLifecycle, integrityHash: string): F4ReportLifecycle {
  if (report.status !== F4_REPORT_STATUS.APPROVED) throw new Error("F4_INTEGRITY_REQUIRES_APPROVAL");
  return Object.freeze({ ...report, integrityHash: requireText(integrityHash, "F4_INTEGRITY_HASH_REQUIRED") });
}

export function finalizeF4Report(
  report: F4ReportLifecycle,
  input: Readonly<{ artifactId: string; actor: F4Actor; occurredAt: string; correlationId: string; requestId: string }>,
): F4ReportLifecycle {
  if (report.status !== F4_REPORT_STATUS.APPROVED) throw new Error("F4_FINALIZE_REQUIRES_APPROVAL");
  if (!report.integrityHash) throw new Error("F4_FINALIZE_REQUIRES_INTEGRITY");
  const artifactId = requireText(input.artifactId, "F4_FINAL_ARTIFACT_REQUIRED");
  const next = transitionF4Report(report, F4_REPORT_STATUS.FINAL, input);
  return Object.freeze({ ...next, finalArtifactId: artifactId });
}

export function verifyF4Integrity(report: F4ReportLifecycle, observedHash: string): boolean {
  if (report.status !== F4_REPORT_STATUS.FINAL) throw new Error("F4_VERIFY_REQUIRES_FINAL");
  return report.integrityHash === requireText(observedHash, "F4_OBSERVED_HASH_REQUIRED");
}

export function recordF4IntegrityVerification(
  report: F4ReportLifecycle,
  input: Readonly<{ observedHash: string; actor: F4Actor; occurredAt: string; correlationId: string; requestId: string }>,
): Readonly<{ report: F4ReportLifecycle; valid: boolean }> {
  if (report.status !== F4_REPORT_STATUS.FINAL) throw new Error("F4_VERIFY_REQUIRES_FINAL");
  const c = context(input);
  const valid = verifyF4Integrity(report, input.observedHash);
  const event: F4ReportEvent = Object.freeze({
    id: eventId(report.reportId, "VERIFY_INTEGRITY", c.requestId),
    action: "VERIFY_INTEGRITY",
    from: F4_REPORT_STATUS.FINAL,
    to: F4_REPORT_STATUS.FINAL,
    actor: c.actor,
    occurredAt: c.occurredAt,
    correlationId: c.correlationId,
    requestId: c.requestId,
  });
  return Object.freeze({ report: Object.freeze({ ...report, events: Object.freeze([...report.events, event]) }), valid });
}

export function registerF4Download(
  report: F4ReportLifecycle,
  input: Readonly<{ actor: F4Actor; occurredAt: string; correlationId: string; requestId: string }>,
): F4ReportLifecycle {
  if (report.status !== F4_REPORT_STATUS.FINAL || !report.finalArtifactId) throw new Error("F4_DOWNLOAD_REQUIRES_FINAL");
  const c = context(input);
  const event: F4ReportEvent = Object.freeze({
    id: eventId(report.reportId, "DOWNLOAD", c.requestId),
    action: "DOWNLOAD", from: F4_REPORT_STATUS.FINAL, to: F4_REPORT_STATUS.FINAL,
    actor: c.actor, occurredAt: c.occurredAt, correlationId: c.correlationId, requestId: c.requestId,
  });
  return Object.freeze({ ...report, events: Object.freeze([...report.events, event]) });
}

export function validateF4ReportLifecycle(report: F4ReportLifecycle): void {
  if (report.version !== F4_REPORT_LIFECYCLE_VERSION) throw new Error("F4_LIFECYCLE_VERSION_INVALID");
  requireText(report.reportId, "F4_REPORT_ID_REQUIRED");
  if (!report.revision.revisionId) throw new Error("F4_REVISION_ID_REQUIRED");
  requireText(report.revision.createdAt, "F4_REVISION_CREATED_AT_REQUIRED");

  const [first, ...rest] = report.events;
  if (!first || first.action !== "CREATE" || first.from !== null || first.to !== F4_REPORT_STATUS.DRAFT) {
    throw new Error("F4_CREATE_EVENT_REQUIRED");
  }
  let previous = first;
  for (const current of rest) {
    if (current.from !== previous.to) throw new Error("F4_EVENT_CHAIN_BROKEN");
    if (!current.id?.trim() || !current.actor?.actorId?.trim() || !current.actor?.role?.trim() ||
        !current.occurredAt?.trim() || Number.isNaN(Date.parse(current.occurredAt)) ||
        !current.correlationId.trim() || !current.requestId.trim()) {
      throw new Error("F4_EVENT_CONTEXT_REQUIRED");
    }
    if (current.action === "DOWNLOAD" || current.action === "VERIFY_INTEGRITY") {
      if (current.from !== F4_REPORT_STATUS.FINAL || current.to !== F4_REPORT_STATUS.FINAL) {
        throw new Error("F4_FINAL_AUDIT_EVENT_INVALID");
      }
    } else {
      const expected = Object.entries(ACTIONS).find(([, action]) => action === current.action);
      if (!expected || expected[0] !== `${current.from}>${current.to}`) throw new Error("F4_ACTION_TRANSITION_MISMATCH");
    }
    previous = current;
  }

  if (report.status !== previous.to) throw new Error("F4_STATUS_EVENT_MISMATCH");
  if (report.status === F4_REPORT_STATUS.FINAL) {
    if (!report.integrityHash || !report.finalArtifactId) throw new Error("F4_FINAL_ARTIFACT_INCOMPLETE");
    if (!rest.some((e) => e.action === "FINALIZE" && e.from === F4_REPORT_STATUS.APPROVED && e.to === F4_REPORT_STATUS.FINAL)) {
      throw new Error("F4_FINALIZE_EVENT_REQUIRED");
    }
  }
}
