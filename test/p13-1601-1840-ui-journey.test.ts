import test from "node:test";
import assert from "node:assert/strict";
import { composeApplicationShell } from "../src/application/p13-1601-1640-application-shell.js";
import { createNavigationState, navigate, assertNavigationState } from "../src/application/p13-1641-1680-navigation-state.js";
import { composeSyntheticOperatorJourney, assertJourneyComplete } from "../src/application/p13-1721-1760-synthetic-operator-journey.js";
import { buildUiReleaseEvidence, assertUiReleaseEvidenceSafe } from "../src/application/p13-1801-1840-ui-release-evidence.js";

test("P13.1601-1840: synthetic operator journey remains governance safe", () => {
  const actor = { actorId: "synthetic-operator", role: "ADMIN", domain: "KAMTIB" as const, scope: {}, correlationId: "corr-ui-001" };
  const shell = composeApplicationShell(actor, "DASHBOARD", "ONLINE", "TRUSTED");
  const navigation = navigate(createNavigationState("DASHBOARD"), "REPORTS");
  assertNavigationState(navigation);
  const journey = composeSyntheticOperatorJourney("journey-001", "ADMIN");
  assertJourneyComplete(journey);
  const evidence = buildUiReleaseEvidence("ui-evidence-001", shell, journey);
  assertUiReleaseEvidenceSafe(evidence);
  assert.equal(evidence.productionAuthorized, false);
  assert.equal(evidence.aiEnabled, false);
});
