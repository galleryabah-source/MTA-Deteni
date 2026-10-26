import type { OutboxEventContract } from "../../application/outbox-runtime-contract.js";
import type { OutboxRepository } from "./contracts.js";

export type DurableOutboxPort = Readonly<{
  enqueue(event: OutboxEventContract): Promise<"ENQUEUED" | "DUPLICATE">;
  claim(limit: number, consumerId: string): Promise<readonly OutboxEventContract[]>;
  acknowledge(eventId: string, consumerId: string): Promise<void>;
  release(eventId: string, consumerId: string): Promise<void>;
}>;

export class ControlledDurableOutbox implements DurableOutboxPort {
  private readonly repository: OutboxRepository;

  constructor(repository: OutboxRepository) {
    this.repository = repository;
  }

  enqueue(event: OutboxEventContract): Promise<"ENQUEUED" | "DUPLICATE"> { return this.repository.enqueue(event); }

  async claim(limit: number, consumerId: string): Promise<readonly OutboxEventContract[]> {
    if (limit < 1 || !consumerId.trim()) throw new Error("OUTBOX_CLAIM_CONTEXT_REQUIRED");
    return this.repository.claim(limit);
  }

  async acknowledge(eventId: string, consumerId: string): Promise<void> {
    if (!eventId.trim() || !consumerId.trim()) throw new Error("OUTBOX_ACK_CONTEXT_REQUIRED");
    await this.repository.acknowledge(eventId);
  }

  async release(eventId: string, consumerId: string): Promise<void> {
    if (!eventId.trim() || !consumerId.trim()) throw new Error("OUTBOX_RELEASE_CONTEXT_REQUIRED");
  }
}
