export type ReleaseTraceStage = "COMMAND_UX" | "OFFLINE_SAFETY" | "NOTIFICATION" | "ACKNOWLEDGEMENT" | "REPORT_OUTPUT" | "AUDIT";

export type SyntheticReleaseTrace = Readonly<{
  traceId: string;
  stages: readonly ReleaseTraceStage[];
  syntheticOnly: true;
  productionAuthorized: false;
}>;

const REQUIRED: readonly ReleaseTraceStage[] = ["COMMAND_UX", "OFFLINE_SAFETY", "NOTIFICATION", "ACKNOWLEDGEMENT", "REPORT_OUTPUT", "AUDIT"];

export function composeSyntheticReleaseTrace(traceId: string): SyntheticReleaseTrace {
  if (!traceId.trim()) throw new Error("RELEASE_TRACE_ID_REQUIRED");
  return { traceId, stages: REQUIRED, syntheticOnly: true, productionAuthorized: false };
}

export function assertSyntheticReleaseTrace(trace: SyntheticReleaseTrace): void {
  if (trace.stages.length !== REQUIRED.length || trace.stages.some((stage, index) => stage !== REQUIRED[index])) throw new Error("RELEASE_TRACE_SEQUENCE_INVALID");
  if (!trace.syntheticOnly || trace.productionAuthorized) throw new Error("RELEASE_TRACE_GOVERNANCE_INVALID");
}
