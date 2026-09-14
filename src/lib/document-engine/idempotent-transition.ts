import type { DocumentTransitionResult, DocumentTransitionTransaction, DocumentTransitionTransactionPort } from "./transition-orchestrator";
import { DocumentTransitionOrchestrator } from "./transition-orchestrator";
import { fingerprintDocumentTransition, type DocumentIdempotencyStore } from "./idempotency";

export class IdempotentDocumentTransitionOrchestrator {
  private readonly orchestrator: DocumentTransitionOrchestrator;

  constructor(
    transaction: DocumentTransitionTransactionPort,
    private readonly idempotency: DocumentIdempotencyStore,
  ) {
    this.orchestrator = new DocumentTransitionOrchestrator(transaction);
  }

  async execute(
    key: string,
    input: DocumentTransitionTransaction,
  ): Promise<DocumentTransitionResult> {
    const fingerprint = fingerprintDocumentTransition({
      documentId: input.documentId,
      from: input.from,
      to: input.to,
      artifactId: input.artifact?.artifactId ?? null,
      bindingArtifactId: input.binding?.artifactId ?? null,
      correlationId: input.audit.correlationId,
    });
    const reservation = await this.idempotency.reserve(key, fingerprint, input.audit.occurredAt);
    if (reservation.status === "COMMITTED" && reservation.result) {
      return Object.freeze({
        committed: true,
        documentId: String(reservation.result.documentId),
        from: String(reservation.result.from) as DocumentTransitionResult["from"],
        to: String(reservation.result.to) as DocumentTransitionResult["to"],
        correlationId: String(reservation.result.correlationId),
      });
    }

    const result = await this.orchestrator.execute(input);
    await this.idempotency.commit(key, result);
    return result;
  }
}
