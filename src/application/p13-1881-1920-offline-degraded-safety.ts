export type ConnectivityState = "ONLINE" | "OFFLINE" | "DEGRADED";

export type OfflineSafetyDecision = Readonly<{
  connectivity: ConnectivityState;
  allowRead: true;
  allowMutation: boolean;
  reason: "ONLINE_TRUSTED_PATH" | "OFFLINE_READ_ONLY" | "DEGRADED_READ_ONLY";
}>;

export function evaluateOfflineSafety(connectivity: ConnectivityState): OfflineSafetyDecision {
  if (connectivity === "ONLINE") return { connectivity, allowRead: true, allowMutation: true, reason: "ONLINE_TRUSTED_PATH" };
  return { connectivity, allowRead: true, allowMutation: false, reason: connectivity === "OFFLINE" ? "OFFLINE_READ_ONLY" : "DEGRADED_READ_ONLY" };
}
