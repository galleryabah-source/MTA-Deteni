import type { OfflineSafetyDecision } from "./p13-1881-1920-offline-degraded-safety.js";
import type { SyntheticReleaseTrace } from "./p13-2001-2040-synthetic-release-trace.js";

export type SyntheticResilienceAcceptance = Readonly<{
  offlineMutationBlocked: boolean;
  releaseTraceSafe: boolean;
  accepted: boolean;
  syntheticOnly: true;
}>;

export function acceptSyntheticResilience(safety: OfflineSafetyDecision, trace: SyntheticReleaseTrace): SyntheticResilienceAcceptance {
  const offlineMutationBlocked = safety.allowMutation === false;
  const releaseTraceSafe = trace.syntheticOnly && trace.productionAuthorized === false;
  return { offlineMutationBlocked, releaseTraceSafe, accepted: offlineMutationBlocked && releaseTraceSafe, syntheticOnly: true };
}
