import type { PoolClient } from 'pg';
import type { Database } from './db';

export type CriticalTransactionInput<T> = {
  db: Database;
  mutateDomain: (client: PoolClient) => Promise<T>;
  appendAudit: (client: PoolClient) => Promise<void>;
  enqueueOutbox: (client: PoolClient) => Promise<void>;
};

/**
 * P9.8 production adapter boundary. Domain mutation, audit and outbox must
 * execute on the same PoolClient. No provider/network call belongs here.
 * This file intentionally contains no schema-specific SQL and performs no
 * migration; callers supply approved repository operations.
 */
export async function executeCriticalTransaction<T>({ db, mutateDomain, appendAudit, enqueueOutbox }: CriticalTransactionInput<T>): Promise<T> {
  return db.transaction(async (client) => {
    const result = await mutateDomain(client);
    await appendAudit(client);
    await enqueueOutbox(client);
    return result;
  });
}
