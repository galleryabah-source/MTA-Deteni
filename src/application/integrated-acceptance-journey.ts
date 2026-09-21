export const INTEGRATED_ACCEPTANCE_JOURNEY_VERSION = "IAJ-v1";

export type IntegratedAcceptanceStage =
  | "DOMAIN"
  | "OFFLINE_RECONNECT"
  | "QR"
  | "DAILY_GUARD_REPORT"
  | "AUDIT_OUTBOX";

export type IntegratedAcceptanceInput = Readonly<{
  journeyId: string;
  syntheticOnly: boolean;
  domainReady: boolean;
  offlineReconnectReady: boolean;
  qrReady: boolean;
  reportReady: boolean;
  auditOutboxReady: boolean;
  lifecycleJourneyId: string;
  offlineSessionId: string;
  reportSnapshotId: string;
  qrSubjectId: string;
  auditCorrelationId: string;
  outboxCorrelationId: string;
}>;

export type IntegratedAcceptanceResult = Readonly<{
  version: typeof INTEGRATED_ACCEPTANCE_JOURNEY_VERSION;
  journeyId: string;
  stages: Readonly<Record<IntegratedAcceptanceStage, "PASS">>;
  bindings: Readonly<{
    lifecycleJourneyId: string;
    offlineSessionId: string;
    reportSnapshotId: string;
    qrSubjectId: string;
    correlationId: string;
  }>;
  ready: true;
  syntheticOnly: true;
}>;

function required(...values: readonly string[]): void {
  if (values.some((value) => !value.trim())) throw new Error("INTEGRATED_ACCEPTANCE_IDENTITY_REQUIRED");
}

export function certifyIntegratedAcceptance(input: IntegratedAcceptanceInput): IntegratedAcceptanceResult {
  required(
    input.journeyId,
    input.lifecycleJourneyId,
    input.offlineSessionId,
    input.reportSnapshotId,
    input.qrSubjectId,
    input.auditCorrelationId,
    input.outboxCorrelationId,
  );

  if (input.syntheticOnly !== true) throw new Error("INTEGRATED_ACCEPTANCE_SYNTHETIC_ONLY_REQUIRED");
  if (!input.domainReady) throw new Error("INTEGRATED_ACCEPTANCE_DOMAIN_BLOCKED");
  if (!input.offlineReconnectReady) throw new Error("INTEGRATED_ACCEPTANCE_OFFLINE_BLOCKED");
  if (!input.qrReady) throw new Error("INTEGRATED_ACCEPTANCE_QR_BLOCKED");
  if (!input.reportReady) throw new Error("INTEGRATED_ACCEPTANCE_REPORT_BLOCKED");
  if (!input.auditOutboxReady) throw new Error("INTEGRATED_ACCEPTANCE_AUDIT_OUTBOX_BLOCKED");
  if (input.auditCorrelationId !== input.outboxCorrelationId) throw new Error("INTEGRATED_ACCEPTANCE_CORRELATION_DRIFT");

  return Object.freeze({
    version: INTEGRATED_ACCEPTANCE_JOURNEY_VERSION,
    journeyId: input.journeyId,
    stages: Object.freeze({
      DOMAIN: "PASS",
      OFFLINE_RECONNECT: "PASS",
      QR: "PASS",
      DAILY_GUARD_REPORT: "PASS",
      AUDIT_OUTBOX: "PASS",
    }),
    bindings: Object.freeze({
      lifecycleJourneyId: input.lifecycleJourneyId,
      offlineSessionId: input.offlineSessionId,
      reportSnapshotId: input.reportSnapshotId,
      qrSubjectId: input.qrSubjectId,
      correlationId: input.auditCorrelationId,
    }),
    ready: true,
    syntheticOnly: true,
  });
}

export function assertIntegratedAcceptanceReady(result: IntegratedAcceptanceResult): void {
  if (!result.ready || !result.syntheticOnly) throw new Error("INTEGRATED_ACCEPTANCE_NOT_READY");
  for (const status of Object.values(result.stages)) if (status !== "PASS") throw new Error("INTEGRATED_ACCEPTANCE_STAGE_NOT_PASS");
  required(
    result.journeyId,
    result.bindings.lifecycleJourneyId,
    result.bindings.offlineSessionId,
    result.bindings.reportSnapshotId,
    result.bindings.qrSubjectId,
    result.bindings.correlationId,
  );
}
