export const ATOMIC_COMMAND_ORCHESTRATION_VERSION = "P10.19-v1";

export type CommandOutcome = "ACQUIRED" | "REPLAY" | "CONFLICT" | "FAILED";

export interface CommandEnvelope {
  requestId: string;
  correlationId: string;
  idempotencyKey: string;
  requestHash: string;
  actorId: string;
  command: string;
}

export interface CommandEvidence {
  auditRequired: boolean;
  outboxRequired: boolean;
}

export interface CommandPlan {
  outcome: CommandOutcome;
  transactionId?: string;
  evidence: CommandEvidence;
}

export function planAtomicCommand(
  envelope: CommandEnvelope,
  idempotencyOutcome: "ACQUIRED" | "REPLAY" | "CONFLICT",
): CommandPlan {
  if (!envelope.requestId || !envelope.correlationId || !envelope.idempotencyKey ||
      !envelope.requestHash || !envelope.actorId || !envelope.command) {
    return { outcome: "FAILED", evidence: { auditRequired: true, outboxRequired: false } };
  }

  if (idempotencyOutcome === "REPLAY") {
    return { outcome: "REPLAY", evidence: { auditRequired: false, outboxRequired: false } };
  }

  if (idempotencyOutcome === "CONFLICT") {
    return { outcome: "CONFLICT", evidence: { auditRequired: true, outboxRequired: false } };
  }

  return {
    outcome: "ACQUIRED",
    transactionId: envelope.requestId,
    evidence: { auditRequired: true, outboxRequired: true },
  };
}
