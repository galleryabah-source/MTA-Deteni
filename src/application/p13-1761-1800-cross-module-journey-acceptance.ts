import type { SyntheticOperatorJourney } from "./p13-1721-1760-synthetic-operator-journey.js";

export type CrossModuleAcceptance = Readonly<{
  journeyId: string;
  requiredDomains: readonly ["RAP", "KAMTIB", "SUBBAG_TU", "LEADERSHIP"];
  accepted: boolean;
  syntheticOnly: true;
}>;

export function acceptSyntheticCrossModuleJourney(journey: SyntheticOperatorJourney): CrossModuleAcceptance {
  if (journey.steps.length === 0) throw new Error("CROSS_MODULE_JOURNEY_EMPTY");
  return { journeyId: journey.journeyId, requiredDomains: ["RAP", "KAMTIB", "SUBBAG_TU", "LEADERSHIP"], accepted: journey.syntheticOnly, syntheticOnly: true };
}
