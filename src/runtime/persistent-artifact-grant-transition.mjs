import { consumePersistentGrant, revokePersistentGrant } from './persistent-artifact-grant-repository.mjs';

function requiredFunction(value, name) {
  if (typeof value !== 'function') throw new Error(`${name} is required`);
  return value;
}

/**
 * Transactional boundary for single-use artifact grants.
 * The caller owns BEGIN/COMMIT/ROLLBACK through db.transaction.
 * No provider/network operation is allowed before commit.
 */
export async function consumePersistentArtifactGrant({ db, input, appendAudit, enqueueOutbox }) {
  if (!db || typeof db.transaction !== 'function') throw new Error('db.transaction is required');
  requiredFunction(appendAudit, 'appendAudit');
  requiredFunction(enqueueOutbox, 'enqueueOutbox');
  return db.transaction(async (client) => {
    const result = await consumePersistentGrant(client, input);
    await appendAudit(client, result);
    await enqueueOutbox(client, result);
    return Object.freeze({ grant: result });
  });
}

export async function revokePersistentArtifactGrant({ db, input, appendAudit, enqueueOutbox }) {
  if (!db || typeof db.transaction !== 'function') throw new Error('db.transaction is required');
  requiredFunction(appendAudit, 'appendAudit');
  requiredFunction(enqueueOutbox, 'enqueueOutbox');
  return db.transaction(async (client) => {
    const result = await revokePersistentGrant(client, input);
    await appendAudit(client, result);
    await enqueueOutbox(client, result);
    return Object.freeze({ grant: result });
  });
}
