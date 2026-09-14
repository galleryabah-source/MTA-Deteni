import test from 'node:test';
import assert from 'node:assert/strict';
import { createTemplateManifest, validateTemplateData, canonicalTemplateData } from '../src/domain/document-template-manifest.mjs';

const fields = [
  { name: 'documentNumber', type: 'string', source: 'document' },
  { name: 'authorizationDate', type: 'date', source: 'authorization' },
  { name: 'escortCount', type: 'number', source: 'authorization' },
];

test('manifest is versioned and field order is deterministic', () => {
  const manifest = createTemplateManifest({
    templateId: 'tpl-surat-izin-keluar',
    templateVersion: '1.0.0',
    documentKind: 'TEMPORARY_EXIT_PERMISSION',
    fields,
  });
  assert.equal(manifest.manifestVersion, 1);
  assert.equal(manifest.fields.length, 3);
  assert.equal(canonicalTemplateData(manifest, { escortCount: 2, authorizationDate: '2026-09-14', documentNumber: 'SYN-001' }), '{"documentNumber":"SYN-001","authorizationDate":"2026-09-14","escortCount":2}');
});

test('required fields and declared types are fail-closed', () => {
  const manifest = createTemplateManifest({ templateId: 'tpl', templateVersion: '1', documentKind: 'ESCORT_ASSIGNMENT_LETTER', fields });
  assert.throws(() => validateTemplateData(manifest, { authorizationDate: '2026-09-14', escortCount: 1 }), /documentNumber/);
  assert.throws(() => validateTemplateData(manifest, { documentNumber: 'SYN', authorizationDate: '2026-09-14', escortCount: '1' }), /escortCount/);
});

test('duplicate or unauthorized field definitions are rejected', () => {
  assert.throws(() => createTemplateManifest({ templateId: 'tpl', templateVersion: '1', documentKind: 'TEMPORARY_EXIT_PERMISSION', fields: [{ name: 'x', type: 'string', source: 'document' }, { name: 'x', type: 'string', source: 'document' }] }), /Duplicate/);
  assert.throws(() => createTemplateManifest({ templateId: 'tpl', templateVersion: '1', documentKind: 'TEMPORARY_EXIT_PERMISSION', fields: [{ name: 'x', type: 'string', source: 'client' }] }), /Invalid field source/);
});
