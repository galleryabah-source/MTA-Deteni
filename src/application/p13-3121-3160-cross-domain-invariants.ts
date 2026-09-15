export type DomainOwner = "RAP" | "PERKES" | "KAMTIB" | "SUBBAG_TU" | "HEAD_RUDENIM";
export type OperationalInvariant = Readonly<{
  invariantId: string;
  owner: DomainOwner;
  description: string;
  satisfied: boolean;
}>;

export function assertOperationalInvariants(invariants: readonly OperationalInvariant[]): void {
  if (invariants.length === 0) throw new Error("INVARIANT_SET_REQUIRED");
  for (const invariant of invariants) {
    if (!invariant.invariantId.trim() || !invariant.description.trim()) throw new Error("INVARIANT_IDENTITY_REQUIRED");
    if (!invariant.satisfied) throw new Error(`OPERATIONAL_INVARIANT_FAILED:${invariant.invariantId}`);
  }
}

export function assertLeadershipIsOversightOnly(role: string, canMutateOperationalData: boolean): void {
  if (role === "HEAD_RUDENIM" && canMutateOperationalData) throw new Error("LEADERSHIP_OPERATIONAL_MUTATION_BLOCKED");
}

export function assertTemporaryExitDoesNotBecomeDeportation(eventType: string): void {
  if (eventType === "DEPORTATION") throw new Error("TEMPORARY_EXIT_DEPORTATION_COLLISION");
}
