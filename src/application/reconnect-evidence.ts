import type { OfflineCommand } from "./offline-continuity.js";
import type { ReconnectTransition } from "./runtime-adapters.js";

export type ReconnectEvidence = Readonly<{
  evidenceId: string;
  commandId: string;
  aggregateId: string;
  fromState: ReconnectTransition["from"];
  toState: ReconnectTransition["to"];
  decision: ReconnectTransition["decision"];
  payloadHash: string;
  idempotencyKey: string;
  recordedAt: string;
  syntheticOnly: true;
}>;

export function createReconnectEvidence(command: OfflineCommand, transition: ReconnectTransition, evidenceId: string, recordedAt: string): ReconnectEvidence {
  if (!evidenceId.trim() || !recordedAt.trim()) throw new Error("Reconnect evidence identity and timestamp are required.");
  if (transition.commandId !== command.commandId || transition.from !== command.state) throw new Error("Reconnect evidence command/state mismatch.");
  return Object.freeze({
    evidenceId,
    commandId: command.commandId,
    aggregateId: command.aggregateId,
    fromState: transition.from,
    toState: transition.to,
    decision: transition.decision,
    payloadHash: command.payloadHash,
    idempotencyKey: command.idempotencyKey,
    recordedAt,
    syntheticOnly: true,
  });
}

export function assertReconnectEvidence(evidence: ReconnectEvidence): void {
  for (const [name, value] of Object.entries(evidence)) {
    if (name === "syntheticOnly") continue;
    if (typeof value === "string" && !value.trim()) throw new Error(`Reconnect evidence requires ${name}.`);
  }
  if (evidence.syntheticOnly !== true) throw new Error("Reconnect evidence must be synthetic-only.");
}
