export const GRANT_STATUS = Object.freeze({ ACTIVE: 'ACTIVE', REVOKED: 'REVOKED', CONSUMED: 'CONSUMED' });

function required(value, name) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${name} is required`);
  return value.trim();
}

export function grantInsertParams(grant) {
  if (!grant) throw new Error('grant is required');
  return [required(grant.grantId, 'grantId'), required(grant.documentId, 'documentId'), required(grant.artifactId, 'artifactId'), required(grant.artifactSha256, 'artifactSha256'), required(grant.objectId, 'objectId'), required(grant.actorId, 'actorId'), required(grant.scopeId, 'scopeId'), required(grant.issuedAt, 'issuedAt'), required(grant.expiresAt, 'expiresAt'), GRANT_STATUS.ACTIVE];
}

/**
 * Persistence contract only. The SQL below is intentionally returned to the
 * approved repository adapter; this module never executes DDL or SQL itself.
 */
export const PERSISTENT_GRANT_CONTRACT = Object.freeze({
  consume: Object.freeze({
    rule: 'single atomic UPDATE; only ACTIVE and unexpired grants may transition to CONSUMED',
    expectedAffectedRows: 1,
    predicate: "status = 'ACTIVE' AND expires_at > :now AND actor_id = :actorId AND scope_id = :scopeId AND object_id = :objectId",
    transition: "status = 'CONSUMED', consumed_at = :now",
  }),
  revoke: Object.freeze({
    rule: 'single atomic UPDATE; only ACTIVE grants may transition to REVOKED',
    expectedAffectedRows: 1,
    predicate: "status = 'ACTIVE' AND actor_id = :actorId AND scope_id = :scopeId",
    transition: "status = 'REVOKED', revoked_at = :now",
  }),
});

export function assertSingleRowTransition(affectedRows) {
  if (affectedRows !== 1) throw new Error('GRANT_TRANSITION_NOT_APPLIED');
  return true;
}
