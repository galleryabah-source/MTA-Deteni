export type JourneyStep = Readonly<{
  stepId: string;
  name: string;
  completed: boolean;
  evidenceId: string;
}>;

export type SyntheticJourney = Readonly<{
  journeyId: string;
  steps: readonly JourneyStep[];
  syntheticOnly: true;
  productionAuthorized: false;
}>;

export function assertSyntheticJourneyComplete(journey: SyntheticJourney): void {
  if (!journey.journeyId.trim() || journey.steps.length === 0) throw new Error("SYNTHETIC_JOURNEY_REQUIRED");
  if (!journey.syntheticOnly || journey.productionAuthorized) throw new Error("SYNTHETIC_JOURNEY_GOVERNANCE_BLOCKED");
  for (const step of journey.steps) {
    if (!step.stepId.trim() || !step.name.trim() || !step.evidenceId.trim()) throw new Error("SYNTHETIC_JOURNEY_EVIDENCE_REQUIRED");
    if (!step.completed) throw new Error(`SYNTHETIC_JOURNEY_STEP_INCOMPLETE:${step.stepId}`);
  }
}
