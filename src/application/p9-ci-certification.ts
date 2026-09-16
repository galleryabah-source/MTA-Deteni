import { assertHarnessObservedPass, type HarnessEvidence } from "./test-harness-contract.ts";

export type CiEvidence = Readonly<{
  commit: string;
  environment: string;
  status: "OBSERVED_PASS" | "OBSERVATION_INCOMPLETE";
  artifactAvailable: boolean;
}>;

export function certifyP9Ci(evidence: CiEvidence): "CERTIFIED" | "NOT_CERTIFIED" {
  if (!evidence.commit.trim() || evidence.commit === "unknown") throw new Error("P9_CI_COMMIT_REQUIRED");
  if (evidence.environment !== "controlled-nonprod") return "NOT_CERTIFIED";
  return evidence.status === "OBSERVED_PASS" && evidence.artifactAvailable ? "CERTIFIED" : "NOT_CERTIFIED";
}

export function certifyP9CiFromHarness(evidence: HarnessEvidence): "CERTIFIED" | "NOT_CERTIFIED" {
  assertHarnessObservedPass(evidence);
  return "CERTIFIED";
}
