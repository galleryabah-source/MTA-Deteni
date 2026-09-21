export const INTEGRATED_COMMAND_PERSISTENCE_VERSION = "P10.25-v1";

export interface IntegratedCommandContext {
  requestId: string;
  correlationId: string;
  actorId: string;
  transactionId: string;
  policyVersion: string;
}

export interface IntegratedCommandResult<T> {
  status: "EXECUTED" | "REPLAY" | "DENIED" | "FAILED_SAFE";
  value?: T;
  auditRequired: boolean;
  outboxRequired: boolean;
}

export interface IntegratedCommandPorts<TCommand, TResult> {
  authorize(context: IntegratedCommandContext, command: TCommand): Promise<boolean>;
  idempotency(command: TCommand): Promise<"ACQUIRED" | "REPLAY" | "CONFLICT">;
  validateState(command: TCommand): Promise<boolean>;
  transaction<T>(operation: (context: IntegratedCommandContext) => Promise<T>): Promise<T>;
  audit(context: IntegratedCommandContext, command: TCommand, result: "SUCCESS" | "DENIED" | "FAILED"): Promise<boolean>;
  outbox(context: IntegratedCommandContext, command: TCommand): Promise<boolean>;
}

export async function executeIntegratedCommand<TCommand, TResult>(
  context: IntegratedCommandContext,
  command: TCommand,
  ports: IntegratedCommandPorts<TCommand, TResult>,
): Promise<IntegratedCommandResult<TResult>> {
  if (!await ports.authorize(context, command))
    return { status:"DENIED", auditRequired:true, outboxRequired:false };

  const idem = await ports.idempotency(command);
  if (idem === "REPLAY")
    return { status:"REPLAY", auditRequired:false, outboxRequired:false };
  if (idem === "CONFLICT")
    return { status:"DENIED", auditRequired:true, outboxRequired:false };

  if (!await ports.validateState(command))
    return { status:"DENIED", auditRequired:true, outboxRequired:false };

  const auditReady = await ports.audit(context, command, "SUCCESS");
  if (!auditReady)
    return { status:"FAILED_SAFE", auditRequired:true, outboxRequired:false };

  try {
    const value = await ports.transaction(async (txContext) => {
      const outboxReady = await ports.outbox(txContext, command);
      if (!outboxReady) throw new Error("OUTBOX_UNAVAILABLE");
      return txContext.transactionId ? await ports.transaction(async () => {
        return undefined as TResult;
      }) : (undefined as TResult);
    });
    return { status:"EXECUTED", value, auditRequired:true, outboxRequired:true };
  } catch {
    return { status:"FAILED_SAFE", auditRequired:true, outboxRequired:true };
  }
}
