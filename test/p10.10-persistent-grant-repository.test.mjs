import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PERSISTENT_GRANT_SQL,
  assertPersistentGrantContract,
  consumePersistentGrant,
  insertPersistentGrant,
  revokePersistentGrant,
} from '../src/runtime/persistent-artifact-grant-repository.mjs';

function fakeClient(rowCount = 1) {
  const calls = [];
  return {
    calls,
    async query(text, values) {
      calls.push({ text, values });
      return { rowCount };
    },
  };
}

const grant = {
  grantId: 'g1', documentId: 'd1', artifactId: 'a1', artifactSha256: 'sha256',
  objectId: 'o1', actorId: 'u1', scopeId: 's1',
  issuedAt: '2026-09-14T12:00:00.000Z', expiresAt: '2026-09-14T12:01:00.000Z',
};


test('P10.10 repository contract exposes parameterized insert', async () => {
  const client = fakeClient();
  await insertPersistentGrant(client, grant);
  assert.equal(client.calls.length, 1);
  assert.equal(client.calls[0].text, PERSISTENT_GRANT_SQL.insert);
  assert.equal(client.calls[0].values.length, 10);
  assert.equal(client.calls[0].values.at(-1), 'ACTIVE');
});

test('P10.10 consume is one atomic actor/scope/object-bound update', async () => {
  const client = fakeClient();
  const result = await consumePersistentGrant(client, {
    grantId: 'g1', actorId: 'u1', scopeId: 's1', objectId: 'o1', now: '2026-09-14T12:00:30.000Z',
  });
  assert.equal(result.status, 'CONSUMED');
  assert.match(client.calls[0].text, /status = 'ACTIVE'/);
  assert.match(client.calls[0].text, /expires_at > \$1/);
  assert.match(client.calls[0].text, /actor_id = \$3/);
  assert.match(client.calls[0].text, /scope_id = \$4/);
  assert.match(client.calls[0].text, /object_id = \$5/);
});

test('P10.10 zero-row consume fails closed', async () => {
  await assert.rejects(
    consumePersistentGrant(fakeClient(0), {
      grantId: 'g1', actorId: 'u1', scopeId: 's1', objectId: 'o1', now: '2026-09-14T12:02:00.000Z',
    }),
    /GRANT_TRANSITION_NOT_APPLIED/,
  );
});

test('P10.10 revoke is active-only and actor/scope bound', async () => {
  const client = fakeClient();
  const result = await revokePersistentGrant(client, {
    grantId: 'g1', actorId: 'u1', scopeId: 's1', now: '2026-09-14T12:00:40.000Z',
  });
  assert.equal(result.status, 'REVOKED');
  assert.match(client.calls[0].text, /status = 'ACTIVE'/);
  assert.match(client.calls[0].text, /actor_id = \$3/);
  assert.match(client.calls[0].text, /scope_id = \$4/);
});

test('P10.10 contract invariant remains explicit', () => {
  assert.doesNotThrow(() => assertPersistentGrantContract());
});
