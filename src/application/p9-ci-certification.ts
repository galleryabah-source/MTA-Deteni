import { assertHarnessObservedPass, type HarnessEvidence } from "./test-harness-contract.ts";

/**
 * P9.12 certification input is intentionally bound to the canonical harness
 * evidence. Summary booleans such as `artifactAvailable` are not sufficient
 * to establish certification because they can be asserted without proving
 * the five required execution controls.
 */
export type CiEvidence = Readonly<{
  harnessEvidence: HarnessEvidence;
}>;

export function certifyP9Ci(evidence: CiEvidence): "CERTIFIED" | "NOT_CERTIFIED" {
  assertHarnessObservedPass(evidence.harnessEvidence);
  return "CERTIFIED";
}

/**
 * Canonical entry point retained for callers that already hold harness
 * evidence. Both entry points enforce the same fail-closed contract.
 */
export function certifyP9CiFromHarness(evidence: HarnessEvidence): "CERTIFIED" | "NOT_CERTIFIED" {
  assertHarnessObservedPass(evidence);
  return "CERTIFIED";
}
