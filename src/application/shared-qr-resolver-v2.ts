export type SharedQrRecord = Readonly<{
  resourceId: string;
  resourceType: "DETAINEE";
  token: string;
  status: "ACTIVE" | "SUSPENDED" | "REVOKED";
  context: "RUDENIM_STAY";
  issuedAt: string;
  expiresAt?: string;
}>;

export type SharedQrResolution = Readonly<{
  outcome: "ACCEPTED" | "DENIED" | "EXPIRED" | "REVOKED" | "CONTEXT_MISMATCH";
  resourceId: string;
  resourceType: "DETAINEE";
  reason: string;
  record?: SharedQrRecord;
}>;

export type SharedQrLookup = Readonly<{
  resourceId: string;
  token: string;
}>;

export interface SharedQrRegistry {
  find(input: SharedQrLookup): Promise<SharedQrRecord | null>;
}

export interface SharedQrResolver {
  resolve(input: {
    resourceId: string;
    token: string;
    expectedContext: "RUDENIM_STAY";
    now?: string;
  }): Promise<SharedQrResolution>;
}

export function createSharedQrResolver(registry: SharedQrRegistry): SharedQrResolver {
  return Object.freeze({
    async resolve(input) {
      const record = await registry.find({ resourceId: input.resourceId, token: input.token });
      if (!record) return {
        outcome: "DENIED",
        resourceId: input.resourceId,
        resourceType: "DETAINEE",
        reason: "TOKEN_NOT_FOUND"
      };

      if (record.status === "REVOKED" || record.status === "SUSPENDED") return {
        outcome: "REVOKED",
        resourceId: input.resourceId,
        resourceType: "DETAINEE",
        reason: "QR_NOT_ACTIVE",
        record
      };

      if (record.context !== input.expectedContext) return {
        outcome: "CONTEXT_MISMATCH",
        resourceId: input.resourceId,
        resourceType: "DETAINEE",
        reason: "CONTEXT_MISMATCH",
        record
      };

      const now = Date.parse(input.now || new Date().toISOString());
      const expiresAt = record.expiresAt ? Date.parse(record.expiresAt) : undefined;
      if (expiresAt !== undefined && Number.isFinite(expiresAt) && now >= expiresAt) return {
        outcome: "EXPIRED",
        resourceId: input.resourceId,
        resourceType: "DETAINEE",
        reason: "QR_EXPIRED",
        record
      };

      return {
        outcome: "ACCEPTED",
        resourceId: input.resourceId,
        resourceType: "DETAINEE",
        reason: "QR_VALID",
        record
      };
    }
  });
}

export function createInMemorySharedQrRegistry(seed: SharedQrRecord[] = []): SharedQrRegistry {
  const registry = new Map(seed.map(record => [record.resourceId + "::" + record.token, record]));
  return Object.freeze({
    async find(input) {
      return registry.get(input.resourceId + "::" + input.token) ?? null;
    }
  });
}

export function createInMemorySharedQrResolver(seed: SharedQrRecord[] = []): SharedQrResolver {
  return createSharedQrResolver(createInMemorySharedQrRegistry(seed));
}
