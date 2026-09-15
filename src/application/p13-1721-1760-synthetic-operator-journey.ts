import type { DashboardRole } from "./read-model.js";

export const OPERATOR_JOURNEY_STEPS = [
  "LOGIN",
  "DASHBOARD",
  "DETAINEE_CONTEXT",
  "OPERATIONAL_ACTION",
  "REPORT_PREVIEW",
  "HUMAN_REVIEW",
  "APPROVAL",
  "OUTPUT",
  "AUDIT",
] as const;
export type OperatorJourneyStep = (typeof OPERATOR_JOURNEY_STEPS)[number];

export type SyntheticOperatorJourney = Readonly<{
  journeyId: string;
  role: DashboardRole;
  steps: readonly OperatorJourneyStep[];
  syntheticOnly: true;
}>;

export function composeSyntheticOperatorJourney(journeyId: string, role: DashboardRole): SyntheticOperatorJourney {
  if (!journeyId.trim()) throw new Error("JOURNEY_ID_REQUIRED");
  return { journeyId, role, steps: OPERATOR_JOURNEY_STEPS, syntheticOnly: true };
}

export function assertJourneyComplete(journey: SyntheticOperatorJourney): void {
  if (journey.steps.length !== OPERATOR_JOURNEY_STEPS.length || journey.steps.some((step, index) => step !== OPERATOR_JOURNEY_STEPS[index])) throw new Error("JOURNEY_SEQUENCE_INVALID");
}
