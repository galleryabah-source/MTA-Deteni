import type { ReportSnapshot } from "./report-artifact.js";

export type ReportGovernanceGate = Readonly<{
  syntheticOnly: true;
  migrationAllowed: false;
  productionPersistenceAllowed: false;
  aiRequired: false;
}>;

export const REPORT_GOVERNANCE_GATE: ReportGovernanceGate = Object.freeze({
  syntheticOnly: true,
  migrationAllowed: false,
  productionPersistenceAllowed: false,
  aiRequired: false,
});

export function assertReportGovernance(snapshot: ReportSnapshot): void {
  if (REPORT_GOVERNANCE_GATE.migrationAllowed || REPORT_GOVERNANCE_GATE.productionPersistenceAllowed || REPORT_GOVERNANCE_GATE.aiRequired) {
    throw new Error("Reporting governance gate is unsafe.");
  }
  if (snapshot.provenance.some((item) => item.toLowerCase().includes("production"))) throw new Error("Production provenance is not allowed in synthetic reporting.");
}
