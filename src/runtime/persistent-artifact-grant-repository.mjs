import { assertSingleRowTransition, grantInsertParams, PERSISTENT_GRANT_CONTRACT } from '../domain/persistent-artifact-grant.mjs';

export const PERSISTENT_GRANT_SQL = Object.freeze({
  insert: `INSERT INTO artifact_download_grants (grant_id, document_id, artifact_id, artifact_sha256, object_id, actor_id, scope_id, issued_at, expires_at, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
  consume: `UPDATE artifact_download_grants SET status = 'CONSUMED', consumed_at = $1 WHERE grant_id = $2 AND status = 'ACTIVE' AND expires_at > $1 AND actor_id = $3 AND scope_id = $4 AND object_id = $5`,
  revoke: `UPDATE artifact_download_grants SET status = 'REVOKED', revoked_at = $1 WHERE grant_id = $2 AND status = 'ACTIVE' AND actor_id = $3 AND scope_id = $4`,
});

function required(value, name) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${name} is required`);
  return value.trim();
}

function assertClient(client) {
  if (!client || typeof client.query !== 'function') throw new Error('database client with query() is required');
}

export async function insertPersistentGrant(client, grant) {
  assertClient(client);
  const values = grantInsertParams(grant);
  await client.query(PERSISTENT_GRANT_SQL.insert, values);
  return grant;
}

export async function consumePersistentGrant(client, { grantId, actorId, scopeId, objectId, now }) {
  assertClient(client);
  const values = [
    required(now, 'now'),
    required(grantId, 'grantId'),
    required(actorId, 'actorId'),
    required(scopeId, 'scopeId'),
    required(objectId, 'objectId'),
  ];
  const result = await client.query(PERSISTENT_GRANT_SQL.consume, values);
  assertSingleRowTransition(result?.rowCount);
  return { grantId, status: 'CONSUMED', consumedAt: now };
}

export async function revokePersistentGrant(client, { grantId, actorId, scopeId, now }) {
  assertClient(client);
  const values = [
    required(now, 'now'),
    required(grantId, 'grantId'),
    required(actorId, 'actorId'),
    required(scopeId, 'scopeId'),
  ];
  const result = await client.query(PERSISTENT_GRANT_SQL.revoke, values);
  assertSingleRowTransition(result?.rowCount);
  return { grantId, status: 'REVOKED', revokedAt: now };
}

export function assertPersistentGrantContract() {
  if (PERSISTENT_GRANT_CONTRACT.consume.expectedAffectedRows !== 1) throw new Error('INVALID_CONSUME_CONTRACT');
  if (PERSISTENT_GRANT_CONTRACT.revoke.expectedAffectedRows !== 1) throw new Error('INVALID_REVOKE_CONTRACT');
  return true;
}
