export type AcceptanceScenario = Readonly<{
  id: string;
  name: string;
  purpose: string;
  expected: "ALLOW" | "BLOCK";
}>;

export const SYNTHETIC_ACCEPTANCE_SCENARIOS: readonly AcceptanceScenario[] = [
  { id: "P13-A01", name: "authorized-read", purpose: "Authorized operator can compose dashboard read model.", expected: "ALLOW" },
  { id: "P13-A02", name: "unauthorized-read", purpose: "Role without dashboard.read is blocked.", expected: "BLOCK" },
  { id: "P13-A03", name: "correlation-integrity", purpose: "Command identity remains bound to actor correlation context.", expected: "BLOCK" },
  { id: "P13-A04", name: "idempotent-replay", purpose: "Repeated command key returns the prior result without a second mutation.", expected: "ALLOW" },
  { id: "P13-A05", name: "idempotency-conflict", purpose: "Same command key with a different fingerprint is blocked.", expected: "BLOCK" },
  { id: "P13-A06", name: "report-preview-validation", purpose: "Incomplete guard report cannot advance to generated output.", expected: "BLOCK" },
  { id: "P13-A07", name: "report-provenance", purpose: "Preview preserves source snapshot identity for downstream artifact generation.", expected: "ALLOW" },
  { id: "P13-A08", name: "reconciliation-gate", purpose: "Mismatched reconciliation evidence blocks promotion.", expected: "BLOCK" },
  { id: "P13-A09", name: "leadership-mutation-deny", purpose: "Leadership oversight role cannot mutate operational state.", expected: "BLOCK" },
  { id: "P13-A10", name: "synthetic-only-boundary", purpose: "Acceptance data contains no production detainee records or credentials.", expected: "ALLOW" },
];

export function validateSyntheticAcceptanceCatalog(scenarios: readonly AcceptanceScenario[]): void {
  if (scenarios.length < 10) throw new Error("ACCEPTANCE_CATALOG_INCOMPLETE");
  const ids = new Set<string>();
  for (const scenario of scenarios) {
    if (!scenario.id.trim() || !scenario.name.trim() || !scenario.purpose.trim()) throw new Error("ACCEPTANCE_SCENARIO_INCOMPLETE");
    if (ids.has(scenario.id)) throw new Error("ACCEPTANCE_SCENARIO_DUPLICATE");
    ids.add(scenario.id);
  }
}
