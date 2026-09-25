import { deterministicAiAccelerator, type AiAcceleratorSuggestion } from './ai-accelerator.js';
import type { AiGateway, AiGatewayOutcome } from './ai-gateway.js';

export type OptionalEnrichmentResult = Readonly<{
  source: 'AI' | 'DETERMINISTIC';
  suggestions: readonly AiAcceleratorSuggestion[];
  aiStatus: AiGatewayOutcome<unknown>['status'] | 'DISABLED';
}>;

export async function enrichEvidenceOptionally<TRequest, TResult>(
  input: Readonly<{
    aiEnabled: boolean;
    gateway?: AiGateway<TRequest, TResult>;
    idempotencyKey: string;
    gatewayRequest?: TRequest;
    evidence: Readonly<{
      eventType: string;
      capturedAt: string;
      actorId: string;
      location?: string;
      rawNote?: string;
    }>;
  }>,
): Promise<OptionalEnrichmentResult> {
  const fallback = deterministicAiAccelerator(input.evidence);
  if (!input.aiEnabled || !input.gateway || input.gatewayRequest === undefined) {
    return Object.freeze({ source:'DETERMINISTIC', suggestions:fallback, aiStatus:'DISABLED' });
  }

  const result = await input.gateway.execute({
    idempotencyKey: input.idempotencyKey,
    request: input.gatewayRequest,
  });
  if (!result.ok) {
    return Object.freeze({ source:'DETERMINISTIC', suggestions:fallback, aiStatus:result.status });
  }

  return Object.freeze({
    source:'AI',
    suggestions:fallback,
    aiStatus:'SUCCESS',
  });
}
