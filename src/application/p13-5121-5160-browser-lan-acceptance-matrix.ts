export type ClientSurface = "PC_SERVER" | "TABLET" | "SMARTPHONE";
export type AcceptanceScenario = "ONLINE" | "OFFLINE_READ_ONLY" | "RECONNECT" | "PAIRING" | "REVOCATION";

export type BrowserLanAcceptance = Readonly<{
  scenarioId: string;
  surface: ClientSurface;
  scenario: AcceptanceScenario;
  expectedBehavior: string;
  observed: boolean;
  passed: boolean;
  evidenceId: string;
  outputIdentity: string;
}>;

export function validateBrowserLanAcceptance(item: BrowserLanAcceptance): void {
  if (!item.scenarioId.trim() || !item.expectedBehavior.trim() || !item.evidenceId.trim() || !item.outputIdentity.trim()) {
    throw new Error("BROWSER_LAN_ACCEPTANCE_IDENTITY_REQUIRED");
  }
  if (!item.observed) throw new Error(`BROWSER_LAN_ACCEPTANCE_NOT_OBSERVED:${item.scenarioId}`);
  if (!item.passed) throw new Error(`BROWSER_LAN_ACCEPTANCE_FAILED:${item.scenarioId}`);
}

export function assertBrowserLanAcceptanceMatrix(items: readonly BrowserLanAcceptance[]): void {
  if (items.length === 0) throw new Error("BROWSER_LAN_ACCEPTANCE_MATRIX_REQUIRED");
  const requiredSurfaces = new Set<ClientSurface>(["PC_SERVER", "TABLET", "SMARTPHONE"]);
  const requiredScenarios = new Set<AcceptanceScenario>(["ONLINE", "OFFLINE_READ_ONLY", "RECONNECT", "PAIRING", "REVOCATION"]);
  for (const item of items) validateBrowserLanAcceptance(item);
  for (const surface of requiredSurfaces) {
    if (!items.some((item) => item.surface === surface)) throw new Error(`BROWSER_LAN_SURFACE_MISSING:${surface}`);
  }
  for (const scenario of requiredScenarios) {
    if (!items.some((item) => item.scenario === scenario)) throw new Error(`BROWSER_LAN_SCENARIO_MISSING:${scenario}`);
  }
}
