export type TraceabilityLink = Readonly<{
  requirementId: string;
  contractId: string;
  evidenceId: string;
  outputIdentity: string;
}>;

export function assertReleaseCandidateTraceability(links: readonly TraceabilityLink[]): void {
  if (links.length === 0) throw new Error("RELEASE_TRACEABILITY_REQUIRED");
  for (const link of links) {
    if (!link.requirementId.trim() || !link.contractId.trim() || !link.evidenceId.trim() || !link.outputIdentity.trim()) throw new Error("RELEASE_TRACEABILITY_IDENTITY_REQUIRED");
  }
}
