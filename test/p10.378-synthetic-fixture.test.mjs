import test from 'node:test';
import assert from 'node:assert/strict';
import { createSyntheticFixture } from './fixtures/synthetic-mta-fixture.mjs';

test('synthetic fixture contains no real operational identity', () => {
  const fixture = createSyntheticFixture();
  assert.match(fixture.detainee.id, /^SYN-/);
  assert.match(fixture.placement.blockId, /^SYN-/);
  assert.match(fixture.exit.id, /^SYN-/);
});

test('synthetic fixture preserves domain separation', () => {
  const fixture = createSyntheticFixture();
  assert.equal(fixture.actors.rap.domain, 'RAP');
  assert.equal(fixture.actors.kamtib.domain, 'KAMTIB');
  assert.equal(fixture.actors.tu.domain, 'SUBBAG_TU');
  assert.equal(fixture.actors.leadership.domain, 'LEADERSHIP');
  assert.equal(fixture.actors.perkes.domain, 'PERKES');
});
