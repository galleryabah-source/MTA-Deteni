import type { RepositoryEntity, AggregateRepository, RepositoryResult } from "./repository-contract.js";
import type { ApplicationMutationContext } from "./mta-application-services.js";
import { MtaApplicationServices } from "./mta-application-services.js";

export type AggregateCommand<T extends RepositoryEntity> = Readonly<{
  commandType: string;
  entity: T;
  requestHash: string;
  payload: string;
  payloadFingerprint: string;
  responseFingerprint: string;
}>;

export type AggregateCommandResult<T extends RepositoryEntity> = Readonly<{
  outcome: "COMMITTED" | "REPLAYED";
  repositoryResult?: RepositoryResult<T>;
}>;

export async function orchestrateAggregateCommand<T extends RepositoryEntity>(
  service: MtaApplicationServices,
  repository: AggregateRepository<T>,
  context: ApplicationMutationContext,
  command: AggregateCommand<T>,
): Promise<AggregateCommandResult<T>> {
  let payload: Readonly<Record<string, unknown>>;
  try {
    const parsed: unknown = JSON.parse(command.payload);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("AGGREGATE_COMMAND_PAYLOAD_INVALID");
    payload = parsed as Readonly<Record<string, unknown>>;
  } catch {
    throw new Error("AGGREGATE_COMMAND_PAYLOAD_INVALID");
  }
  const result = await service.execute(context, {
    commandType: command.commandType,
    aggregateId: command.entity.id,
    requestHash: command.requestHash,
    payload,
    payloadFingerprint: command.payloadFingerprint,
    responseFingerprint: command.responseFingerprint,
    run: async () => repository.save(command.entity),
  });
  if (result.outcome === "REPLAYED" || !result.value) return Object.freeze({ outcome: result.outcome });
  return Object.freeze({ outcome: result.outcome, repositoryResult: result.value as RepositoryResult<T> });
}

export function assertAggregateCommandResult<T extends RepositoryEntity>(result: AggregateCommandResult<T>): void {
  if (result.outcome === "COMMITTED" && !result.repositoryResult) throw new Error("Committed aggregate command must expose repository result.");
}
