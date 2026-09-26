export const UNIFIED_JOURNEY_CERTIFICATION_VERSION = "UNIFIED-JOURNEY-CERTIFICATION-v1";

export type UnifiedJourneyInput = Readonly<{
  journeyId: string;
  syntheticOnly: boolean;
  scanReady: boolean;
  resolveReady: boolean;
  contextReady: boolean;
  actionReady: boolean;
  mutationReady: boolean;
  auditReady: boolean;
  monitorReady: boolean;
  reportReady: boolean;
  evidenceReady: boolean;
  correlationId: string;
  auditCorrelationId: string;
  reportCorrelationId: string;
}>;

export type UnifiedJourneyResult = Readonly<{
  version: typeof UNIFIED_JOURNEY_CERTIFICATION_VERSION;
  journeyId: string;
  certified: true;
  syntheticOnly: true;
  stages: Readonly<Record<"scan"|"resolve"|"context"|"action"|"mutation"|"audit"|"monitor"|"report"|"evidence","PASS">>;
  correlationId: string;
}>;

function required(value: string, code: string): void {
  if (!value.trim()) throw new Error(code);
}

export function certifyUnifiedJourney(input: UnifiedJourneyInput): UnifiedJourneyResult {
  required(input.journeyId, "UNIFIED_JOURNEY_ID_REQUIRED");
  required(input.correlationId, "UNIFIED_JOURNEY_CORRELATION_REQUIRED");
  required(input.auditCorrelationId, "UNIFIED_JOURNEY_AUDIT_CORRELATION_REQUIRED");
  required(input.reportCorrelationId, "UNIFIED_JOURNEY_REPORT_CORRELATION_REQUIRED");

  if (input.syntheticOnly !== true) throw new Error("UNIFIED_JOURNEY_SYNTHETIC_ONLY_REQUIRED");
  const gates: readonly [boolean, string][] = [
    [input.scanReady, "UNIFIED_JOURNEY_SCAN_BLOCKED"],
    [input.resolveReady, "UNIFIED_JOURNEY_RESOLVE_BLOCKED"],
    [input.contextReady, "UNIFIED_JOURNEY_CONTEXT_BLOCKED"],
    [input.actionReady, "UNIFIED_JOURNEY_ACTION_BLOCKED"],
    [input.mutationReady, "UNIFIED_JOURNEY_MUTATION_BLOCKED"],
    [input.auditReady, "UNIFIED_JOURNEY_AUDIT_BLOCKED"],
    [input.monitorReady, "UNIFIED_JOURNEY_MONITOR_BLOCKED"],
    [input.reportReady, "UNIFIED_JOURNEY_REPORT_BLOCKED"],
    [input.evidenceReady, "UNIFIED_JOURNEY_EVIDENCE_BLOCKED"],
  ];
  for (const [ready, code] of gates) if (!ready) throw new Error(code);

  if (input.auditCorrelationId !== input.correlationId || input.reportCorrelationId !== input.correlationId) {
    throw new Error("UNIFIED_JOURNEY_CORRELATION_DRIFT");
  }

  return Object.freeze({
    version: UNIFIED_JOURNEY_CERTIFICATION_VERSION,
    journeyId: input.journeyId,
    certified: true,
    syntheticOnly: true,
    stages: Object.freeze({
      scan: "PASS", resolve: "PASS", context: "PASS", action: "PASS",
      mutation: "PASS", audit: "PASS", monitor: "PASS", report: "PASS", evidence: "PASS",
    }),
    correlationId: input.correlationId,
  });
}

export function assertUnifiedJourneyCertification(result: UnifiedJourneyResult): void {
  if (!result.certified || !result.syntheticOnly) throw new Error("UNIFIED_JOURNEY_NOT_CERTIFIED");
  if (Object.values(result.stages).some((status) => status !== "PASS")) {
    throw new Error("UNIFIED_JOURNEY_STAGE_NOT_PASS");
  }
  required(result.journeyId, "UNIFIED_JOURNEY_ID_REQUIRED");
  required(result.correlationId, "UNIFIED_JOURNEY_CORRELATION_REQUIRED");
}
