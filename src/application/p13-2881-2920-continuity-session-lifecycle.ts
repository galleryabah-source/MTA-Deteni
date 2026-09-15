export type ContinuitySessionState = "ACTIVE" | "PAUSED" | "RECONNECTING" | "CLOSED" | "REVOKED" | "BLOCKED";

export type ContinuitySession = Readonly<{
  sessionId: string;
  deviceId: string;
  state: ContinuitySessionState;
  authoritySnapshotId: string;
  startedAt: string;
  updatedAt: string;
}>;

const ALLOWED: Readonly<Record<ContinuitySessionState, readonly ContinuitySessionState[]>> = {
  ACTIVE: ["PAUSED", "RECONNECTING", "CLOSED", "REVOKED", "BLOCKED"],
  PAUSED: ["ACTIVE", "RECONNECTING", "CLOSED", "REVOKED", "BLOCKED"],
  RECONNECTING: ["ACTIVE", "PAUSED", "CLOSED", "REVOKED", "BLOCKED"],
  CLOSED: [],
  REVOKED: [],
  BLOCKED: [],
};

export function validateContinuitySession(session: ContinuitySession): void {
  if (!session.sessionId.trim() || !session.deviceId.trim() || !session.authoritySnapshotId.trim()) throw new Error("CONTINUITY_SESSION_IDENTITY_REQUIRED");
  if (!session.startedAt.trim() || !session.updatedAt.trim()) throw new Error("CONTINUITY_SESSION_TIMESTAMP_REQUIRED");
}

export function assertContinuityTransition(from: ContinuitySessionState, to: ContinuitySessionState): void {
  if (!ALLOWED[from].includes(to)) throw new Error("CONTINUITY_SESSION_TRANSITION_BLOCKED");
}

export function assertContinuitySessionCanMutate(session: ContinuitySession): void {
  validateContinuitySession(session);
  if (session.state !== "ACTIVE") throw new Error("CONTINUITY_SESSION_MUTATION_BLOCKED");
}
