export type OfflineSessionState = "ONLINE" | "OFFLINE_READ_ONLY" | "RECONNECTING" | "BLOCKED";

export type OfflineSession = Readonly<{
  sessionId: string;
  deviceId: string;
  state: OfflineSessionState;
  startedAt: string;
  authoritySnapshotId: string;
}>;

export function validateOfflineSession(session: OfflineSession): void {
  if (!session.sessionId.trim() || !session.deviceId.trim() || !session.authoritySnapshotId.trim()) throw new Error("OFFLINE_SESSION_IDENTITY_REQUIRED");
  if (!session.startedAt.trim()) throw new Error("OFFLINE_SESSION_TIMESTAMP_REQUIRED");
}

export function assertOfflineSessionAllowsMutation(session: OfflineSession): void {
  validateOfflineSession(session);
  if (session.state !== "ONLINE") throw new Error("OFFLINE_SESSION_MUTATION_BLOCKED");
}
