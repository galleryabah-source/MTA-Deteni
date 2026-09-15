export type MtaRole = "OWNER" | "ADMIN" | "EDITOR" | "REVIEWER" | "AUDITOR" | "HEAD_RUDENIM";

export type RoleJourneyObservation = Readonly<{
  role: MtaRole;
  journeyId: string;
  evidenceId: string;
  outputIdentity: string;
  observed: boolean;
  passed: boolean;
  operationalMutationAllowed: boolean;
}>;

export function assertRoleJourneyEvidence(observations: readonly RoleJourneyObservation[]): void {
  if (observations.length === 0) throw new Error("ROLE_JOURNEY_EVIDENCE_REQUIRED");
  for (const observation of observations) {
    if (!observation.role || !observation.journeyId.trim() || !observation.evidenceId.trim() || !observation.outputIdentity.trim()) throw new Error("ROLE_JOURNEY_IDENTITY_REQUIRED");
    if (observation.role === "HEAD_RUDENIM" && observation.operationalMutationAllowed) throw new Error("LEADERSHIP_OPERATIONAL_MUTATION_BLOCKED");
    if (!observation.observed) throw new Error(`ROLE_JOURNEY_NOT_OBSERVED:${observation.role}`);
    if (!observation.passed) throw new Error(`ROLE_JOURNEY_FAILED:${observation.role}`);
  }
}
