import type { DocumentLifecycle } from "./types";

export type DocumentTransitionReason = "ALLOWED" | "TRANSITION_NOT_DEFINED";

const transitions: Readonly<Record<DocumentLifecycle, readonly DocumentLifecycle[]>> = {
  DRAFT: ["GENERATED"],
  GENERATED: ["REVIEWED"],
  REVIEWED: ["APPROVED"],
  APPROVED: ["ISSUED"],
  ISSUED: ["DOWNLOADED", "DISTRIBUTED"],
  DOWNLOADED: ["DISTRIBUTED", "ARCHIVED"],
  DISTRIBUTED: ["ARCHIVED"],
  ARCHIVED: [],
};

export const canTransitionDocument = (from: DocumentLifecycle, to: DocumentLifecycle) =>
  transitions[from].includes(to);

export const transitionDocument = (from: DocumentLifecycle, to: DocumentLifecycle) => ({
  allowed: canTransitionDocument(from, to),
  reason: canTransitionDocument(from, to) ? ("ALLOWED" as const) : ("TRANSITION_NOT_DEFINED" as const),
});
