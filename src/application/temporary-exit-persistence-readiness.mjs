export const TEMPORARY_EXIT_PERSISTENCE_REQUIREMENTS = Object.freeze([
  'transactionalMutation',
  'idempotency',
  'auditAppend',
  'outboxAppend',
  'scopeEnforcement',
  'providerPostCommitOnly',
  'syntheticTestBoundary',
  'migrationFreezeAware',
]);

export function assertTemporaryExitPersistenceAdapter(adapter) {
  const required = {
    transactionalMutation: adapter?.transaction,
    idempotency: adapter?.checkIdempotency,
    auditAppend: adapter?.appendAudit,
    outboxAppend: adapter?.appendOutbox,
    scopeEnforcement: adapter?.assertScope,
  };
  for (const [name, fn] of Object.entries(required)) {
    if (typeof fn !== 'function') throw new Error(`PERSISTENCE_REQUIREMENT_MISSING:${name}`);
  }
  return adapter;
}

export function assertProviderAfterCommit({ transactionCommitted, provider }) {
  if (!provider || typeof provider !== 'string') throw new Error('PROVIDER_REQUIRED');
  if (transactionCommitted !== true) throw new Error('PROVIDER_REQUIRES_COMMITTED_TRANSACTION');
  return true;
}

export function assertMigrationFreezePolicy({ migrationFreeze, operation }) {
  if (migrationFreeze === true && operation === 'SCHEMA_CHANGE') {
    throw new Error('MIGRATION_FREEZE_BLOCKS_SCHEMA_CHANGE');
  }
  return true;
}
