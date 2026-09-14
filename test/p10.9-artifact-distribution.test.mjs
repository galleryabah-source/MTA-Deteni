import test from 'node:test';
import assert from 'node:assert/strict';
import { PrivateStorageTestDouble } from '../src/kernel/private-storage.mjs';
import { requestArtifactDownload, executeArtifactProviderHandoff, consumeArtifactDownload, ARTIFACT_DOWNLOAD_PERMISSION } from '../src/runtime/artifact-distribution.mjs';

const context = {
  actorId: 'actor-kamtib-01', sessionId: 'session-01', correlationId: 'corr-01', active: true,
  permissions: [ARTIFACT_DOWNLOAD_PERMISSION], allowedScopes: ['scope-a'], scopeId: 'scope-a',
  allowedClassifications: ['L3'], classificationAllowed: true, policyAllowed: true,
  dutyActive: true, operationalAssignment: 'KAMTIB',
};

function authorize(input) {
  if (!input.auth?.active) return { allowed: false, reasonCode: 'AUTH_REQUIRED' };
  if (!input.permissions.includes(input.permission)) return { allowed: false, reasonCode: 'PERMISSION_DENIED' };
  if (!input.allowedScopes.includes(input.scope)) return { allowed: false, reasonCode: 'SCOPE_DENIED' };
  if (!input.resourceExists || !input.stateValid || !input.classificationAllowed || !input.policyAllowed) return { allowed: false, reasonCode: 'POLICY_DENIED' };
  return { allowed: true, reasonCode: 'ALLOW' };
}

function fixture() {
  const storage = new PrivateStorageTestDouble();
  const uploaded = storage.put({ content: Buffer.from('synthetic-docx'), objectClass: 'GENERATED_DOCUMENT', scopeId: 'scope-a', originalFilename: 'synthetic.docx', detectedMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', classification: 'L3', sourceType: 'DOCUMENT', sourceId: 'doc-01', correlationId: 'corr-01', uploadedBy: 'actor-preparer' });
  const available = storage.makeAvailable(uploaded.objectId);
  const document = { documentId: 'doc-01', state: 'ISSUED', artifactId: 'artifact-01', artifactSha256: available.checksumSha256, objectId: available.objectId };
  return { storage, document };
}

test('P10.9 issues scoped handoff without calling provider inside transaction boundary', () => {
  const { storage, document } = fixture();
  let providerCalls = 0;
  const audit = (event) => assert.equal(event.eventType, 'ARTIFACT_DOWNLOAD_GRANT_ISSUED');
  const outbox = (event) => assert.equal(event.eventType, 'ARTIFACT_DOWNLOAD_GRANT_ISSUED');
  const original = storage.createTemporaryDownload.bind(storage);
  storage.createTemporaryDownload = (...args) => { providerCalls += 1; return original(...args); };

  const result = requestArtifactDownload({ document, requestContext: context, authorize, storage, audit, outbox, now: new Date('2026-09-14T12:00:00.000Z'), ttlMs: 60_000 });
  assert.equal(result.handoff.status, 'ACTIVE');
  assert.equal(result.handoff.actorId, context.actorId);
  assert.equal(result.handoff.scopeId, context.scopeId);
  assert.equal(providerCalls, 0);
});

test('P10.9 provider operation is available only as a post-commit worker action', () => {
  const { storage, document } = fixture();
  const { handoff } = requestArtifactDownload({ document, requestContext: context, authorize, storage, audit: () => {}, outbox: () => {}, now: new Date('2026-09-14T12:00:00.000Z') });
  const providerGrant = executeArtifactProviderHandoff({ handoff, requestContext: context, storage, now: Date.parse('2026-09-14T12:00:01.000Z') });
  assert.ok(providerGrant.grantId);
});

test('P10.9 denies missing permission, wrong scope, and non-issued document', () => {
  const { storage, document } = fixture();
  assert.throws(() => requestArtifactDownload({ document, requestContext: { ...context, permissions: [] }, authorize, storage, audit: () => {}, outbox: () => {} }), /PERMISSION_DENIED/);
  assert.throws(() => requestArtifactDownload({ document, requestContext: { ...context, allowedScopes: ['other-scope'] }, authorize, storage, audit: () => {}, outbox: () => {} }), /SCOPE_DENIED/);
  assert.throws(() => requestArtifactDownload({ document: { ...document, state: 'APPROVED' }, requestContext: context, authorize, storage, audit: () => {}, outbox: () => {} }), /POLICY_DENIED/);
});

test('P10.9 consumes only the bound actor/scope/object and remains single-use', () => {
  const { storage, document } = fixture();
  const { handoff } = requestArtifactDownload({ document, requestContext: context, authorize, storage, audit: () => {}, outbox: () => {}, now: new Date('2026-09-14T12:00:00.000Z') });
  executeArtifactProviderHandoff({ handoff, requestContext: context, storage, now: Date.parse('2026-09-14T12:00:01.000Z') });
  const result = consumeArtifactDownload({ handoff, requestContext: context, document, storage, audit: () => {}, now: new Date('2026-09-14T12:00:02.000Z') });
  assert.equal(result.content.toString(), 'synthetic-docx');
  assert.throws(() => consumeArtifactDownload({ handoff: result.consumed, requestContext: context, document, storage, audit: () => {}, now: new Date('2026-09-14T12:00:03.000Z') }), /Download grant is not active/);
  assert.throws(() => consumeArtifactDownload({ handoff, requestContext: { ...context, actorId: 'other' }, document, storage, audit: () => {}, now: new Date('2026-09-14T12:00:03.000Z') }), /Actor is not authorized for grant/);
});
