import type { AiProvider, AiRequest } from '../types';

export type DeterministicHandler<TInput, TOutput> = (
  input: TInput,
  request: AiRequest<TInput>,
) => Promise<TOutput> | TOutput;

export class DeterministicProvider implements AiProvider {
  readonly kind = 'deterministic' as const;

  constructor(
    readonly id: string,
    private readonly handlers: Readonly<Record<string, DeterministicHandler<unknown, unknown>>>,
  ) {}

  get capabilities(): readonly string[] {
    return Object.keys(this.handlers);
  }

  async execute<TInput, TOutput>(request: AiRequest<TInput>): Promise<TOutput> {
    const handler = this.handlers[request.capability];
    if (!handler) throw new Error(`No deterministic fallback for capability: ${request.capability}`);
    return (await handler(request.input, request)) as TOutput;
  }
}
