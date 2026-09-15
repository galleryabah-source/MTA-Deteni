export type JourneyRole = "OWNER" | "ADMIN" | "EDITOR" | "REVIEWER" | "AUDITOR" | "RAP" | "PERKES" | "KAMTIB" | "SUBBAG_TU" | "HEAD_RUDENIM";
export type JourneyCapability = "READ" | "MUTATE" | "APPROVE" | "OVERSIGHT";

export type RoleJourneyCase = Readonly<{
  caseId: string;
  role: JourneyRole;
  capability: JourneyCapability;
  allowed: boolean;
  observedOutcome: "ALLOWED" | "DENIED";
  evidenceId: string;
}>;

export function assertRoleJourneyMatrix(cases: readonly RoleJourneyCase[]): void {
  if (cases.length === 0) throw new Error("ROLE_JOURNEY_MATRIX_REQUIRED");
  for (const item of cases) {
    if (!item.caseId.trim() || !item.evidenceId.trim()) throw new Error("ROLE_JOURNEY_EVIDENCE_REQUIRED");
    if (item.allowed !== (item.observedOutcome === "ALLOWED")) throw new Error(`ROLE_JOURNEY_OUTCOME_MISMATCH:${item.caseId}`);
    if (item.role === "HEAD_RUDENIM" && item.capability === "MUTATE" && item.allowed) throw new Error("LEADERSHIP_OPERATIONAL_MUTATION_BLOCKED");
  }
}

export function assertDenyByDefault(allowed: boolean, explicitlyMapped: boolean): void {
  if (allowed && !explicitlyMapped) throw new Error("ROLE_CAPABILITY_DENY_BY_DEFAULT_VIOLATION");
}
