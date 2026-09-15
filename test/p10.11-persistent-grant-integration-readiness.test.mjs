import test from 'node:test';
import assert from 'node:assert/strict';
import { issuePersistentArtifactGrant } from '../src/runtime/persistent-artifact-grant-transaction.mjs';

const grant = {
  grantId: 'g1', documentId: 'd1', artifactId: 'a1', artifactSha256: 'sha256',
  objectId: 'o1', actorId: 'u1', scopeId: 's1',
  issuedAt: '2026-09-14T12:00:00.000Z', expiresAt: '2026-09-14T12:01:00.000Z',
};

function fakeDb(log) {
  return {
    async transaction(fn) {
      log.push('BEGIN');
      const client = {
        async query(text, values) {
          log.push(['QUERY', text, values]);
          return { rowCount: 1 };
        },
      };
      try {
        const result = await fn(client);
        log.push('COMMIT');
        return result;
      } catch (error) {
        log.push('ROLLBACK');
        throw error;
      }
    },
  };
}

test('P10.11 grant insert, audit and outbox share one transaction client', async () => {
  const log = [];
  const clients = [];
  const result = await issuePersistentArtifactGrant({
    db: fakeDb(log),
    grant,
    appendAudit: async (client, value) => { clients.push(client); assert.equal(value.grantId, 'g1'); log.push('AUDIT'); },
    enqueueOutbox: async (client, value) => { clients.push(client); assert.equal(value.grantId, 'g1'); log.push('OUTBOX'); },
  });
  assert.equal(result.grant.grantId, 'g1');
  assert.deepEqual(log.filter((entry) => typeof entry === 'string'), ['BEGIN', 'AUDIT', 'OUTBOX', 'COMMIT']);
  assert.equal(clients.length, 2);
  assert.equal(clients[0], clients[1]);
});

test('P10.11 provider/network calls are absent from grant transaction boundary', async () => {
  const log = [];
  await issuePersistentArtifactGrant({
    db: fakeDb(log), grant,
    appendAudit: async () => {},
    enqueueOutbox: async () => {},
  });
  assert.equal(log.some((entry) => typeof entry === 'string' && /provider|storage/i.test(entry)), false);
});
