export type ConnectivityState = "ONLINE" | "OFFLINE";
export type QueueState = "PENDING" | "SYNCING" | "SYNCED" | "CONFLICT" | "FAILED";

export type OfflineCommand = Readonly<{
  commandId: string;
  aggregateId: string;
  commandType: string;
  payloadHash: string;
  idempotencyKey: string;
  createdAt: string;
  state: QueueState;
}>;

export type ReconciliationDecision = Readonly<{
  commandId: string;
  action: "APPLY" | "SKIP_DUPLICATE" | "REVIEW_CONFLICT";
}>;

export function enqueueOfflineCommand(input: Omit<OfflineCommand, "state">): OfflineCommand {
  for (const value of [input.commandId, input.aggregateId, input.commandType, input.payloadHash, input.idempotencyKey, input.createdAt]) {
    if (!value.trim()) throw new Error("Offline command identity is required.");
  }
  return Object.freeze({ ...input, state: "PENDING" as const });
}

export function reconcileOfflineCommand(input: { command: OfflineCommand; existingIdempotencyKeys: readonly string[]; aggregateRevisionMatches: boolean }): ReconciliationDecision {
  if (input.existingIdempotencyKeys.includes(input.command.idempotencyKey)) return { commandId: input.command.commandId, action: "SKIP_DUPLICATE" };
  if (!input.aggregateRevisionMatches) return { commandId: input.command.commandId, action: "REVIEW_CONFLICT" };
  return { commandId: input.command.commandId, action: "APPLY" };
}

export function assertLanContinuity(state: ConnectivityState, queue: readonly OfflineCommand[]): void {
  if (state === "ONLINE" && queue.some((item) => item.state === "SYNCING")) throw new Error("Online state cannot expose an unresolved syncing queue.");
}
