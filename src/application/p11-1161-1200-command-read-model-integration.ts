import type { ActorContext } from "../domain/shared/contracts.js";
import type { OperatorDashboardReadModel } from "./read-model.js";
import type { MutationEnvelope, MutationCommand, TransactionalMutationService } from "./p11-961-1024-transactional-mutation.js";

export type ReadModelProjectionPort<T> = Readonly<{
  project(result: MutationEnvelope<T>): Promise<void>;
  dashboard(actor: ActorContext): Promise<OperatorDashboardReadModel>;
}>;

/** Final application-facing composition: command execution followed by read-model projection. */
export class OperatorApplicationFacade<T, TInput> {
  constructor(
    private readonly mutation: TransactionalMutationService<T, TInput>,
    private readonly projection: ReadModelProjectionPort<T>,
  ) {}

  async execute(command: MutationCommand<TInput>): Promise<MutationEnvelope<T>> {
    const result = await this.mutation.execute(command);
    await this.projection.project(result);
    return result;
  }

  async dashboard(actor: ActorContext): Promise<OperatorDashboardReadModel> {
    return this.projection.dashboard(actor);
  }
}
