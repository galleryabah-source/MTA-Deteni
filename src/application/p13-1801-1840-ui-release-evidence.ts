import type { ApplicationShellState } from "./p13-1601-1640-application-shell.js";
import type { SyntheticOperatorJourney } from "./p13-1721-1760-synthetic-operator-journey.js";

export type UiReleaseEvidence = Readonly<{
  evidenceId: string;
  journeyId: string;
  actorId: string;
  shellSyntheticOnly: true;
  journeySyntheticOnly: true;
  productionAuthorized: false;
  aiEnabled: false;
}>;

export function buildUiReleaseEvidence(evidenceId: string, shell: ApplicationShellState, journey: SyntheticOperatorJourney): UiReleaseEvidence {
  if (!evidenceId.trim() || !shell.actorId.trim() || !journey.journeyId.trim()) throw new Error("UI_RELEASE_EVIDENCE_IDENTITY_REQUIRED");
  return { evidenceId, journeyId: journey.journeyId, actorId: shell.actorId, shellSyntheticOnly: true, journeySyntheticOnly: true, productionAuthorized: false, aiEnabled: false };
}

export function assertUiReleaseEvidenceSafe(evidence: UiReleaseEvidence): void {
  if (!evidence.shellSyntheticOnly || !evidence.journeySyntheticOnly || evidence.productionAuthorized || evidence.aiEnabled) throw new Error("UI_RELEASE_EVIDENCE_UNSAFE");
}
