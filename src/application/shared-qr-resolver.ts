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

export interface SharedQrResolver {
  resolve(input: { resourceId: string; token: string; expectedContext: "RUDENIM_STAY"; now?: string }): Promise<SharedQrResolution>;
}

export function createInMemorySharedQrResolver(seed: SharedQrRecord[] = []): SharedQrResolver {
  const registry = new Map(seed.map(record => [record.resourceId, record]));
  return Object.freeze({
    async resolve(input) {
      const record = registry.get(input.resourceId);
      if (!record || record.token !== input.token) return { outcome: "DENIED", resourceId: input.resourceId, resourceType: "DETAINEE", reason: "TOKEN_NOT_FOUND" };
      if (record.status === "REVOKED" || record.status === "SUSPENDED") return { outcome: "REVOKED", resourceId: input.resourceId, resourceType: "DETAINEE", reason: "QR_NOT_ACTIVE", record };
      if (record.context !== input.expectedContext) return { outcome: "CONTEXT_MISMATCH", resourceId: input.resourceId, resourceType: "DETAINEE", reason: "CONTEXT_MISMATCH", record };
      const now = Date.parse(input.now || new Date().toISOString());
      if (record.expiresAt && Number.isFinite(Date.parse(record.expiresAt)) && now >= Date.parse(record.expiresAt)) return { outcome: "EXPIRED", resourceId: input.resourceId, resourceType: "DETAINEE", reason: "QR_EXPIRED", record };
      return { outcome: "ACCEPTED", resourceId: input.resourceId, resourceType: "DETAINEE", reason: "QR_VALID", record };
    }
  });
}