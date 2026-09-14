import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDocumentRecord,
  transitionDocument,
  assertIssueEligible,
  DOCUMENT_STATES,
} from '../src/domain/document-lifecycle.mjs';

const base = {
  documentId: 'doc-syn-001',
  kind: 'TEMPORARY_EXIT_PERMISSION',
  subjectRef: 'deteni_SYNTHETIC_001',
  authorizationId: 'auth-syn-001',
  contractVersion: 'exit.v1',
  templateId: 'tpl-surat-izin-keluar',
  templateVersion: '1.0.0',
  artifactId: 'artifact-syn-001',
  artifactSha256: 'a'.repeat(64),
  scopeId: 'rudenim-synthetic',
  correlationId: 'corr-syn-001',
  now: '2026-09-14T00:00:00.000Z',
};

function ready() {
  let doc = createDocumentRecord(base);
  doc = transitionDocument(doc, { to: DOCUMENT_STATES.PENDING_APPROVAL, actor: 'actor-prep', role: 'PREPARER' });
  doc = transitionDocument(doc, { to: DOCUMENT_STATES.APPROVED, actor: 'actor-approver', role: 'APPROVER' });
  return doc;
}

test('P10.5 creates immutable-bound document in DRAFT', () => {
  const doc = createDocumentRecord(base);
  assert.equal(doc.state, 'DRAFT');
  assert.equal(doc.version, 1);
  assert.equal(doc.subjectRef, 'deteni_SYNTHETIC_001');
  assert.equal(doc.artifactSha256, 'a'.repeat(64));
});

test('valid lifecycle reaches ISSUED only through approval', () => {
  let doc = ready();
  assert.equal(doc.state, 'APPROVED');
  assertIssueEligible(doc);
  doc = transitionDocument(doc, { to: 'ISSUED', actor: 'actor-issuer', role: 'ISSUER' });
  assert.equal(doc.state, 'ISSUED');
  assert.equal(doc.version, 4);
});

test('issue is denied before approval', () => {
  const doc = createDocumentRecord(base);
  assert.throws(() => assertIssueEligible(doc), /APPROVED/);
  assert.throws(() => transitionDocument(doc, { to: 'ISSUED', actor: 'actor-issuer', role: 'ISSUER' }), /Invalid document transition/);
});

test('separation of duties rejects preparer as approver and approver as issuer', () => {
  const doc = transitionDocument(createDocumentRecord(base), { to: 'PENDING_APPROVAL', actor: 'actor-prep', role: 'PREPARER' });
  assert.throws(() => transitionDocument(doc, { to: 'APPROVED', actor: 'actor-prep', role: 'PREPARER' }), /cannot perform/);
  const approved = transitionDocument(doc, { to: 'APPROVED', actor: 'actor-approver', role: 'APPROVER' });
  assert.throws(() => transitionDocument(approved, { to: 'ISSUED', actor: 'actor-approver', role: 'APPROVER' }), /cannot perform/);
});

test('archive is terminal and requires issued state', () => {
  const approved = ready();
  assert.throws(() => transitionDocument(approved, { to: 'ARCHIVED', actor: 'actor-archive', role: 'ARCHIVER' }), /Invalid document transition/);
  const issued = transitionDocument(approved, { to: 'ISSUED', actor: 'actor-issuer', role: 'ISSUER' });
  const archived = transitionDocument(issued, { to: 'ARCHIVED', actor: 'actor-archive', role: 'ARCHIVER' });
  assert.equal(archived.state, 'ARCHIVED');
  assert.throws(() => transitionDocument(archived, { to: 'DRAFT', actor: 'actor-prep', role: 'PREPARER' }), /Invalid document transition/);
});

test('document cannot issue without authorization or verified artifact binding', () => {
  const broken = createDocumentRecord({ ...base, authorizationId: 'auth-syn-001' });
  let approved = transitionDocument(broken, { to: 'PENDING_APPROVAL', actor: 'actor-prep', role: 'PREPARER' });
  approved = transitionDocument(approved, { to: 'APPROVED', actor: 'actor-approver', role: 'APPROVER' });
  const noArtifact = { ...approved, artifactId: null, artifactSha256: null };
  assert.throws(() => assertIssueEligible(noArtifact), /artifact binding/);
});
