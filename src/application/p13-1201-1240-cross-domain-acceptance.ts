export type CrossDomainAcceptanceInput = Readonly<{
  aggregateId: string;
  detaineeId: string;
  correlationId: string;
  rapReady: boolean;
  perkesReady: boolean;
  kamtibReady: boolean;
  subbagTuReady: boolean;
  leadershipOversightOnly: boolean;
  reconciliationMatched: boolean;
  syntheticOnly: boolean;
  migrationFreeze: boolean;
  aiEnabled: boolean;
  productionAuthorized: boolean;
}>;

export type CrossDomainAcceptanceDecision = "BLOCKED" | "ACCEPTED";

export function evaluateCrossDomainAcceptance(input: CrossDomainAcceptanceInput): CrossDomainAcceptanceDecision {
  const identityReady = Boolean(input.aggregateId.trim() && input.detaineeId.trim() && input.correlationId.trim());
  const domainsReady = input.rapReady && input.perkesReady && input.kamtibReady && input.subbagTuReady;
  const governanceReady = input.leadershipOversightOnly && input.reconciliationMatched && input.syntheticOnly && input.migrationFreeze && !input.aiEnabled && !input.productionAuthorized;
  return identityReady && domainsReady && governanceReady ? "ACCEPTED" : "BLOCKED";
}
