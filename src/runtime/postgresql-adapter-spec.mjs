/**
 * P10.109-P10.116 controlled PostgreSQL adapter specification.
 * Contract-only: this module deliberately performs no connection, DDL, migration,
 * or production write. A future adapter must satisfy these invariants.
 */

export const POSTGRES_ADAPTER_CONTRACT = Object.freeze({
  transaction: 'BEGIN -> domain/audit/outbox writes -> COMMIT; ROLLBACK on any failure',
  commandIdentity: 'actorId and scopeId must originate from authenticated server principal',
  idempotency: 'same key + same fingerprint replays; same key + different fingerprint fails',
  scope: 'deny-by-default; actor/scope mismatch fails before mutation',
  artifactGrantConsume: 'single atomic UPDATE; ACTIVE + unexpired + actor + scope + object; affected rows must equal 1',
  artifactGrantRevoke: 'single atomic UPDATE; ACTIVE + actor + scope; affected rows must equal 1',
  provider: 'no provider/network call before successful COMMIT',
  migration: 'MIGRATION_FREEZE=true blocks schema-changing execution',
  ai: 'AI_ENABLED=false for controlled certification path',
  audit: 'append-only hash-chain material must be transactionally coupled to the mutation',
});

export function assertControlledPostgresAdapter(adapter, { migrationFreeze = true } = {}) {
  if (!adapter || typeof adapter.transaction !== 'function') throw new Error('POSTGRES_TRANSACTION_ADAPTER_REQUIRED');
  if (typeof adapter.executeMigration === 'function' && migrationFreeze) {
    throw new Error('MIGRATION_FREEZE_BLOCKS_SCHEMA_CHANGE');
  }
  if (typeof adapter.callProvider === 'function') {
    throw new Error('PROVIDER_NOT_ALLOWED_IN_POSTGRES_TRANSACTION_ADAPTER');
  }
  return true;
}
