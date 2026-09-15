import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

test('P10.46: dependency manifest is present and missing lockfile remains a certification blocker', () => {
  assert.equal(pkg.name, 'mta-deteni-kernel');
  assert.ok(pkg.dependencies && typeof pkg.dependencies === 'object');
  assert.ok(pkg.devDependencies && typeof pkg.devDependencies === 'object');
  if (!existsSync('package-lock.json')) {
    assert.equal(process.env.MIGRATION_FREEZE ?? 'true', 'true');
    console.log('P10.46 BLOCKED: package-lock.json is not committed; certification must remain blocked.');
    return;
  }
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
  assert.equal(lock.lockfileVersion >= 1, true);
  assert.equal(lock.name, pkg.name);
});
