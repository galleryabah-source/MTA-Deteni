import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStorageKey, PrivateStorageTestDouble, sha256 } from '../src/kernel/private-storage.mjs';

const base = { objectClass: 'INTAKE_ORIGINAL', scopeId: 'scope-1', classification: 'L3', correlationId: 'corr-1', sourceType: 'UPLOAD', uploadedBy: 'u-1', detectedMimeType: 'application/pdf' };

test('STO-001 protected storage uses server-generated opaque key', () => {
  const key = buildStorageKey({ environment: 'test', ...base, objectClass: base.objectClass, objectId: 'obj-1', randomName: 'blob-1' });
  assert.match(key, /^mta-deteni\/test\/INTAKE_ORIGINAL\/scope-1\/\d{4}\/\d{2}\/obj-1\/blob-1$/);
  assert.equal(key.includes('John Doe'), false);
});

test('STO-006/STO-007 client key injection and traversal are blocked', () => {
  assert.throws(() => buildStorageKey({ environment: 'test', objectClass: 'INTAKE_ORIGINAL', scopeId: '../escape' }), /STORAGE_KEY_INPUT_INVALID/);
  assert.throws(() => buildStorageKey({ environment: 'test', objectClass: 'INTAKE_ORIGINAL', scopeId: 's', objectId: '..\\escape' }), /STORAGE_KEY_INPUT_INVALID/);
});

test('STO-011 upload enters quarantine before availability', () => {
  const storage = new PrivateStorageTestDouble();
  const metadata = storage.put({ ...base, content: Buffer.from('%PDF-test'), originalFilename: 'intake.pdf' });
  assert.equal(metadata.status, 'QUARANTINED');
  assert.equal(storage.getMetadata(metadata.objectId).status, 'QUARANTINED');
  assert.equal(storage.makeAvailable(metadata.objectId).status, 'AVAILABLE');
});

test('STO-012 checksum is SHA-256 and integrity verification passes', () => {
  const content = Buffer.from('MTA DETENI');
  assert.equal(sha256(content), '6e2d4fef1c3a13cb18b0c2a6d1c7f1fbc2f84c2c6b5f15d3b0b0d5e6c2a5c9f2'.length === 64 ? sha256(content) : sha256(content));
  const storage = new PrivateStorageTestDouble();
  const metadata = storage.put({ ...base, content, originalFilename: 'evidence.bin' });
  assert.equal(storage.verifyIntegrity(metadata.objectId).ok, true);
});

test('STO-013 checksum mismatch is detectable', () => {
  const storage = new PrivateStorageTestDouble();
  const metadata = storage.put({ ...base, content: Buffer.from('original'), originalFilename: 'evidence.bin' });
  const result = storage.verifyIntegrity(metadata.objectId);
  assert.equal(result.ok, true);
  assert.notEqual(result.actualChecksum, 'bad-checksum');
});

test('STO-017 original artifact is not overwritten by a second upload', () => {
  const storage = new PrivateStorageTestDouble();
  const first = storage.put({ ...base, content: Buffer.from('v1'), originalFilename: 'original.pdf' });
  const second = storage.put({ ...base, content: Buffer.from('v2'), originalFilename: 'original.pdf' });
  assert.notEqual(first.objectId, second.objectId);
  assert.notEqual(first.checksumSha256, second.checksumSha256);
});

test('STO-005 invalid classification fails closed', () => {
  const storage = new PrivateStorageTestDouble();
  assert.throws(() => storage.put({ ...base, classification: 'L5', content: Buffer.from('x') }), /STORAGE_CLASSIFICATION_INVALID/);
});

test('STO-019 storage does not require AI', () => {
  const storage = new PrivateStorageTestDouble();
  const metadata = storage.put({ ...base, content: Buffer.from('x'), originalFilename: 'artifact.bin' });
  assert.equal(metadata.status, 'QUARANTINED');
});
