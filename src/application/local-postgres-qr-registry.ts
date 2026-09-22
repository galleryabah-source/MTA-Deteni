import type { SharedQrLookup, SharedQrRecord, SharedQrRegistry } from "./shared-qr-resolver-v2.js";

export type SqlQueryResult<T> = Readonly<{ rows: T[] }>;
export type LocalPostgresExecutor = Readonly<{
  query<T = SharedQrRecord>(sql: string, params: readonly unknown[]): Promise<SqlQueryResult<T>>;
}>;

type QrRow = Readonly<{
  resource_id: string;
  resource_type: "DETAINEE";
  token_hash: string;
  status: "ACTIVE" | "SUSPENDED" | "REVOKED";
  context: "RUDENIM_STAY";
  issued_at: string;
  expires_at?: string | null;
}>;

export type QrTokenVerifier = Readonly<{
  hash(token: string): Promise<string>;
}>;

export function createLocalPostgresSharedQrRegistry(
  db: LocalPostgresExecutor,
  verifier: QrTokenVerifier
): SharedQrRegistry {
  return Object.freeze({
    async find(input: SharedQrLookup) {
      const tokenHash = await verifier.hash(input.token);
      const result = await db.query<QrRow>(
        "select resource_id, resource_type, token_hash, status, context, issued_at, expires_at from mta_qr_registry where resource_id = $1 and token_hash = $2 and resource_type = 'DETAINEE' limit 1",
        [input.resourceId, tokenHash]
      );
      const row = result.rows[0];
      if (!row) return null;
      return {
        resourceId: row.resource_id,
        resourceType: row.resource_type,
        token: input.token,
        status: row.status,
        context: row.context,
        issuedAt: row.issued_at,
        ...(row.expires_at ? { expiresAt: row.expires_at } : {})
      };
    }
  });
}
