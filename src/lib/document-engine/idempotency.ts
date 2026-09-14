import { createHash } from "node:crypto";

export interface DocumentIdempotencyRecord {
  readonly key: string;
  readonly requestFingerprint: string;
  readonly status: "IN_PROGRESS" | "COMMITTED";
  readonly result?: Readonly<Record<string, string | boolean>>;
  readonly createdAt: string;
}

export interface DocumentIdempotencyStore {
  reserve(key: string, requestFingerprint: string, createdAt: string): Promise<DocumentIdempotencyRecord>;
  commit(key: string, result: Readonly<Record<string, string | boolean>>): Promise<void>;
  get(key: string): Promise<DocumentIdempotencyRecord | undefined>;
}

export const fingerprintDocumentTransition = (input: Readonly<Record<string, unknown>>): string =>
  createHash("sha256").update(JSON.stringify(input)).digest("hex");

export class InMemoryDocumentIdempotencyStore implements DocumentIdempotencyStore {
  private readonly records = new Map<string, DocumentIdempotencyRecord>();

  async reserve(key: string, requestFingerprint: string, createdAt: string): Promise<DocumentIdempotencyRecord> {
    if (!key.trim()) throw new Error("INVALID_IDEMPOTENCY_KEY");
    if (!/^[a-f0-9]{64}$/.test(requestFingerprint)) throw new Error("INVALID_REQUEST_FINGERPRINT");
    if (Number.isNaN(Date.parse(createdAt))) throw new Error("INVALID_IDEMPOTENCY_DATE");
    const existing = this.records.get(key);
    if (existing) {
      if (existing.requestFingerprint !== requestFingerprint) throw new Error("IDEMPOTENCY_KEY_REUSE_MISMATCH");
      return existing;
    }
    const record = Object.freeze({ key, requestFingerprint, status: "IN_PROGRESS" as const, createdAt });
    this.records.set(key, record);
    return record;
  }

  async commit(key: string, result: Readonly<Record<string, string | boolean>>): Promise<void> {
    const existing = this.records.get(key);
    if (!existing) throw new Error("IDEMPOTENCY_RESERVATION_NOT_FOUND");
    if (existing.status === "COMMITTED") return;
    this.records.set(key, Object.freeze({ ...existing, status: "COMMITTED", result: Object.freeze({ ...result }) }));
  }

  async get(key: string): Promise<DocumentIdempotencyRecord | undefined> {
    const record = this.records.get(key);
    return record ? Object.freeze({ ...record, result: record.result ? Object.freeze({ ...record.result }) : undefined }) : undefined;
  }
}
