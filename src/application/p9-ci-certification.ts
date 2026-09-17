import { assertHarnessObservedPass, type HarnessEvidence } from "./test-harness-contract.js";

export type CiEvidence = Readonly<{
  harnessEvidence: HarnessEvidence;
}>;

export function certifyP9Ci(evidence: CiEvidence): "CERTIFIED" | "NOT_CERTIFIED" {
  if (!evidence || typeof evidence !== "object" || !evidence.harnessEvidence) {
    throw new Error("P9_CI_HARNESS_EVIDENCE_REQUIRED");
  }
  assertHarnessObservedPass(evidence.harnessEvidence);
  return "CERTIFIED";
}

export function certifyP9CiFromHarness(evidence: HarnessEvidence): "CERTIFIED" | "NOT_CERTIFIED" {
  assertHarnessObservedPass(evidence);
  return "CERTIFIED";
}
