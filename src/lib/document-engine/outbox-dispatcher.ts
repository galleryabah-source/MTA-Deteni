import type { DocumentOutboxEvent, DocumentOutboxStore } from "./outbox";

export interface DocumentOutboxHandler {
  handle(event: DocumentOutboxEvent): Promise<void>;
}

export class DocumentOutboxDispatcher {
  constructor(
    private readonly store: DocumentOutboxStore,
    private readonly handler: DocumentOutboxHandler,
  ) {}

  async dispatch(eventId: string, deliveredAt: string): Promise<void> {
    const event = await this.store.claim(eventId);
    if (!event) return;
    try {
      await this.handler.handle(event);
      await this.store.markDelivered(eventId, deliveredAt);
    } catch (error) {
      const code = error instanceof Error && error.message.trim() ? error.message : "OUTBOX_HANDLER_FAILED";
      await this.store.markFailed(eventId, code);
      throw error;
    }
  }
}
