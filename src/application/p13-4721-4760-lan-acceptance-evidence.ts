export type LanAcceptanceScenario = "LOCAL_SERVER_READY" | "TRUSTED_TABLET" | "TRUSTED_SMARTPHONE" | "OFFLINE_RECONNECT";

export type LanAcceptanceObservation = Readonly<{
  scenario: LanAcceptanceScenario;
  deviceId: string;
  serverId: string;
  evidenceId: string;
  outputIdentity: string;
  observed: boolean;
  passed: boolean;
}>;

export function assertLanAcceptanceEvidence(observations: readonly LanAcceptanceObservation[]): void {
  if (observations.length === 0) throw new Error("LAN_ACCEPTANCE_EVIDENCE_REQUIRED");
  for (const observation of observations) {
    if (!observation.deviceId.trim() || !observation.serverId.trim() || !observation.evidenceId.trim() || !observation.outputIdentity.trim()) throw new Error("LAN_ACCEPTANCE_IDENTITY_REQUIRED");
    if (!observation.observed) throw new Error(`LAN_ACCEPTANCE_NOT_OBSERVED:${observation.scenario}`);
    if (!observation.passed) throw new Error(`LAN_ACCEPTANCE_FAILED:${observation.scenario}`);
  }
}
