import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createTemplateManifest, canonicalTemplateData } from '../src/domain/document-template-manifest.mjs';
import { renderDocx, sha256 } from '../src/domain/docx-renderer.mjs';
import { createDocumentRecord, transitionDocument } from '../src/domain/document-lifecycle.mjs';
import { createArtifactHandoff, consumeArtifactHandoff } from '../src/domain/artifact-handoff.mjs';
import { TransactionalKernelStore } from '../src/kernel/transactional-command.mjs';
import { IdempotencyStore } from '../src/kernel/idempotency.mjs';

const kinds = ['TEMPORARY_EXIT_PERMISSION', 'ESCORT_ASSIGNMENT_LETTER'];
const fields = [
  { name: 'documentNumber', type: 'string', source: 'document' },
  { name: 'authorizationDate', type: 'date', source: 'authorization' },
  { name: 'escortCount', type: 'number', source: 'authorization' },
];
const data = { documentNumber: 'SYN-DOC-001', authorizationDate: '2026-09-15', escortCount: 2 };
const context = { actorId: 'actor-issuer-01', scopeId: 'scope-a', objectId: 'object-doc-01' };

for (const kind of kinds) {
  test(`P10.21 ${kind}: deterministic DOCX artifact and lifecycle`, () => {
    const manifest = createTemplateManifest({ templateId: `tpl-${kind.toLowerCase()}`, templateVersion: '1.0.0', documentKind: kind, fields });
    const canonical = canonicalTemplateData(manifest, data);
    const first = renderDocx({ manifest, data, title: kind });
    const second = renderDocx({ manifest, data, title: kind });
    assert.ok(first.buffer.length > 0);
    assert.equal(first.fileExtension, '.docx');
    assert.equal(first.mimeType, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    assert.equal(first.sha256, second.sha256);
    assert.equal(first.sha256, sha256(first.buffer));
    assert.equal(first.artifactId, `docx-${first.sha256.slice(0, 32)}`);
    assert.equal(canonical, '{"documentNumber":"SYN-DOC-001","authorizationDate":"2026-09-15","escortCount":2}');

    let document = createDocumentRecord({
      documentId: `doc-${kind.toLowerCase()}`,
      kind,
      subjectRef: 'subject-synthetic-01',
      authorizationId: 'auth-synthetic-01',
      contractVersion: 'P10.21',
      templateId: first.templateId,
      templateVersion: first.templateVersion,
      artifactId: first.artifactId,
      artifactSha256: first.sha256,
      scopeId: context.scopeId,
      correlationId: 'corr-synthetic-01',
    });
    assert.throws(() => transitionDocument(document, { to: 'APPROVED', actor: 'actor-preparer-01', role: 'PREPARER' }), /Role/);
    document = transitionDocument(document, { to: 'PENDING_APPROVAL', actor: 'actor-preparer-01', role: 'PREPARER' });
    document = transitionDocument(document, { to: 'APPROVED', actor: 'actor-approver-01', role: 'APPROVER' });
    document = transitionDocument(document, { to: 'ISSUED', actor: context.actorId, role: 'ISSUER' });
    assert.equal(document.state, 'ISSUED');
    assert.equal(document.artifactSha256, first.sha256);
  });
}

test('P10.21 secure handoff binds actor/scope/object and is single-use', () => {
  const document = { documentId: 'doc-01', state: 'ISSUED', artifactId: 'artifact-01', artifactSha256: createHash('sha256').update('synthetic').digest('hex') };
  const handoff = createArtifactHandoff({ document, objectId: context.objectId, actorId: context.actorId, scopeId: context.scopeId, now: new Date('2026-09-15T10:00:00.000Z'), ttlMs: 60_000 });
  const consumed = consumeArtifactHandoff(handoff, { ...context, now: new Date('2026-09-15T10:00:30.000Z') });
  assert.equal(consumed.status, 'CONSUMED');
  assert.throws(() => consumeArtifactHandoff(consumed, { ...context, now: new Date('2026-09-15T10:00:31.000Z') }), /not active/);
  assert.throws(() => consumeArtifactHandoff(handoff, { ...context, actorId: 'actor-other', now: new Date('2026-09-15T10:00:31.000Z') }), /Actor/);
  assert.throws(() => consumeArtifactHandoff(handoff, { ...context, scopeId: 'scope-other', now: new Date('2026-09-15T10:00:31.000Z') }), /Scope/);
  assert.throws(() => consumeArtifactHandoff(handoff, { ...context, objectId: 'object-other', now: new Date('2026-09-15T10:00:31.000Z') }), /Object/);
  assert.throws(() => consumeArtifactHandoff(handoff, { ...context, now: new Date('2026-09-15T10:01:00.000Z') }), /expired/);
});

test('P10.21 critical transaction rolls back domain/audit/outbox together and never invokes provider', () => {
  const store = new TransactionalKernelStore();
  let providerCalls = 0;
  const command = () => store.command({
    idempotencyKey: 'idem-runtime-01',
    request: { operation: 'DOCUMENT_ISSUE', actorId: context.actorId, scope: context.scopeId, resourceId: 'doc-01', payload: { artifact: 'synthetic' } },
    domainMutation: ({ set }) => set('doc-01', { state: 'ISSUED' }),
    auditEvent: { eventType: 'DOCUMENT_ISSUED', actorId: context.actorId, resourceId: 'doc-01' },
    outboxEvent: { eventId: 'event-runtime-01', eventType: 'DOCUMENT_ISSUED', aggregateType: 'DOCUMENT', aggregateId: 'doc-01' },
  });
  store.injectFailure('OUTBOX');
  assert.throws(command, /INJECTED_OUTBOX_FAILURE/);
  assert.equal(providerCalls, 0);
  assert.deepEqual(store.snapshot(), { domain: {}, auditCount: 0, outbox: [], idempotencyCount: 0 });
});

test('P10.21 idempotency replays equivalent request and rejects conflicting payload', () => {
  const store = new IdempotencyStore();
  let executions = 0;
  const request = { operation: 'DOCUMENT_ISSUE', actorId: 'actor-issuer-01', scope: 'scope-a', resourceId: 'doc-01', payload: { artifact: 'a1' } };
  assert.equal(store.execute('idem-01', request, () => { executions += 1; return { artifactId: 'a1' }; }).status, 'EXECUTED');
  assert.equal(store.execute('idem-01', { ...request, payload: { artifact: 'a1' } }, () => { executions += 1; return { artifactId: 'duplicate' }; }).status, 'REPLAY');
  assert.equal(store.execute('idem-01', { ...request, payload: { artifact: 'a2' } }, () => { executions += 1; return { artifactId: 'conflict' }; }).reasonCode, 'IDEMPOTENCY_KEY_REUSE');
  assert.equal(executions, 1);
});
