import type { ActorContext } from "../src/domain/shared/contracts.js";

export const actor = (actorId: string, domain: ActorContext["domain"]): ActorContext => ({
  actorId,
  role: `${domain}_OPERATOR`,
  domain,
  scope: { rudenimId: "SYN-RUDENIM-01" },
  correlationId: `COR-${actorId}`,
});

export const fixedNow = () => "2026-09-15T08:00:00.000Z";

export class MapStore<T extends { id: string }> {
  readonly items = new Map<string, T>();
  async get(id: string): Promise<T | null> { return this.items.get(id) ?? null; }
  async save(item: T): Promise<void> { this.items.set(item.id, item); }
}
