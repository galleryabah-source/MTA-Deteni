import test from 'node:test';
import assert from 'node:assert/strict';
import { createTemplateManifest } from '../src/domain/document-template-manifest.mjs';
import { renderDocx, sha256 } from '../src/domain/docx-renderer.mjs';

const manifest = createTemplateManifest({
  templateId: 'tpl-surat-izin-keluar',
  templateVersion: '1.0.0',
  documentKind: 'TEMPORARY_EXIT_PERMISSION',
  fields: [
    { name: 'documentNumber', type: 'string', source: 'document' },
    { name: 'authorizationDate', type: 'date', source: 'authorization' },
    { name: 'escortCount', type: 'number', source: 'authorization' },
  ],
});

const data = { documentNumber: 'SYN-001', authorizationDate: '2026-09-14', escortCount: 2 };

test('renders a valid DOCX container with stable digest', () => {
  const a = renderDocx({ manifest, data, title: 'Synthetic Temporary Exit Permission' });
  const b = renderDocx({ manifest, data, title: 'Synthetic Temporary Exit Permission' });
  assert.equal(a.fileExtension, '.docx');
  assert.equal(a.mimeType, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  assert.equal(a.buffer.subarray(0, 4).toString('hex'), '504b0304');
  assert.equal(a.sha256, sha256(a.buffer));
  assert.equal(a.sha256, b.sha256);
  assert.equal(a.artifactId, b.artifactId);
});

test('artifact digest changes when governed data changes', () => {
  const a = renderDocx({ manifest, data });
  const b = renderDocx({ manifest, data: { ...data, escortCount: 3 } });
  assert.notEqual(a.sha256, b.sha256);
});

test('XML-sensitive values are escaped rather than injected', () => {
  const result = renderDocx({ manifest, data: { ...data, documentNumber: '<SYN>&001' } });
  const text = result.buffer.toString('utf8');
  assert.match(text, /&lt;SYN&gt;&amp;001/);
  assert.doesNotMatch(text, /<SYN>&001/);
});

test('missing governed data fails closed', () => {
  assert.throws(() => renderDocx({ manifest, data: { documentNumber: 'SYN-001' } }), /authorizationDate/);
});
