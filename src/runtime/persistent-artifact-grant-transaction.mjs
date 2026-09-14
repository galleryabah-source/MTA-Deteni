import { insertPersistentGrant } from './persistent-artifact-grant-repository.mjs';

function requiredFunction(value, name) {
  if (typeof value !== 'function') throw new Error(`${name} is required`);
  return value;
}

/**
 * Integration boundary only. The supplied db.transaction implementation owns
 * BEGIN/COMMIT/ROLLBACK. Audit and outbox callbacks receive the same client.
 * No provider/network operation is permitted in this function.
 */
export async function issuePersistentArtifactGrant({ db, grant, appendAudit, enqueueOutbox }) {
  if (!db || typeof db.transaction !== 'function') throw new Error('db.transaction is required');
  requiredFunction(appendAudit, 'appendAudit');
  requiredFunction(enqueueOutbox, 'enqueueOutbox');

  return db.transaction(async (client) => {
    const persistedGrant = await insertPersistentGrant(client, grant);
    await appendAudit(client, persistedGrant);
    await enqueueOutbox(client, persistedGrant);
    return Object.freeze({ grant: persistedGrant });
  });
}
