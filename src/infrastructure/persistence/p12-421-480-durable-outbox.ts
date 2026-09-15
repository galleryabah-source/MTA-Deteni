import type { OutboxMessage, OutboxRepository } from "./contracts.js";

export type DurableOutboxPort = Readonly<{
  enqueue(message: OutboxMessage): Promise<"ENQUEUED" | "DUPLICATE">;
  claim(limit: number, consumerId: string): Promise<readonly OutboxMessage[]>;
  acknowledge(id: string, consumerId: string): Promise<void>;
  release(id: string, consumerId: string): Promise<void>;
}>;

export class ControlledDurableOutbox implements DurableOutboxPort {
  constructor(private readonly repository: OutboxRepository) {}

  enqueue(message: OutboxMessage): Promise<"ENQUEUED" | "DUPLICATE"> { return this.repository.enqueue(message); }

  async claim(limit: number, consumerId: string): Promise<readonly OutboxMessage[]> {
    if (limit < 1 || !consumerId.trim()) throw new Error("OUTBOX_CLAIM_CONTEXT_REQUIRED");
    return this.repository.claim(limit);
  }

  async acknowledge(id: string, consumerId: string): Promise<void> {
    if (!id.trim() || !consumerId.trim()) throw new Error("OUTBOX_ACK_CONTEXT_REQUIRED");
    await this.repository.acknowledge(id);
  }

  async release(id: string, consumerId: string): Promise<void> {
    if (!id.trim() || !consumerId.trim()) throw new Error("OUTBOX_RELEASE_CONTEXT_REQUIRED");
  }
}
