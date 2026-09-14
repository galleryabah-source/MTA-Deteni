const STATES = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  ISSUED: 'ISSUED',
  ARCHIVED: 'ARCHIVED',
  VOID: 'VOID',
});

const TRANSITIONS = Object.freeze({
  DRAFT: new Set(['PENDING_APPROVAL', 'VOID']),
  PENDING_APPROVAL: new Set(['APPROVED', 'VOID']),
  APPROVED: new Set(['ISSUED', 'VOID']),
  ISSUED: new Set(['ARCHIVED', 'VOID']),
  ARCHIVED: new Set([]),
  VOID: new Set([]),
});

const KINDS = new Set(['TEMPORARY_EXIT_PERMISSION', 'ESCORT_ASSIGNMENT_LETTER']);
const ROLES = Object.freeze({
  PREPARER: 'PREPARER',
  APPROVER: 'APPROVER',
  ISSUER: 'ISSUER',
  ARCHIVER: 'ARCHIVER',
});

function required(value, name) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${name} is required`);
  return value.trim();
}

export { STATES as DOCUMENT_STATES, KINDS as DOCUMENT_KINDS, ROLES as DOCUMENT_ROLES };

export function createDocumentRecord({
  documentId,
  kind,
  subjectRef,
  authorizationId,
  contractVersion,
  templateId,
  templateVersion,
  artifactId,
  artifactSha256,
  scopeId,
  correlationId,
  now = new Date().toISOString(),
}) {
  required(documentId, 'documentId');
  required(subjectRef, 'subjectRef');
  required(authorizationId, 'authorizationId');
  required(contractVersion, 'contractVersion');
  required(templateId, 'templateId');
  required(templateVersion, 'templateVersion');
  required(artifactId, 'artifactId');
  required(artifactSha256, 'artifactSha256');
  required(scopeId, 'scopeId');
  required(correlationId, 'correlationId');
  if (!KINDS.has(kind)) throw new Error('Unsupported document kind');
  if (!/^[a-f0-9]{64}$/i.test(artifactSha256)) throw new Error('artifactSha256 must be a SHA-256 hex digest');

  return Object.freeze({
    documentId,
    kind,
    subjectRef,
    authorizationId,
    contractVersion,
    templateId,
    templateVersion,
    artifactId,
    artifactSha256: artifactSha256.toLowerCase(),
    scopeId,
    correlationId,
    state: STATES.DRAFT,
    version: 1,
    createdAt: now,
    updatedAt: now,
  });
}

export function transitionDocument(record, { to, actor, role, now = new Date().toISOString(), reason = null }) {
  if (!record || typeof record !== 'object') throw new Error('document record is required');
  required(actor, 'actor');
  if (!Object.values(ROLES).includes(role)) throw new Error('Invalid document lifecycle role');
  if (!Object.values(STATES).includes(to)) throw new Error('Invalid document lifecycle state');
  if (!TRANSITIONS[record.state]?.has(to)) throw new Error(`Invalid document transition ${record.state} -> ${to}`);

  const roleAllowed = {
    PENDING_APPROVAL: ['PREPARER'],
    APPROVED: ['APPROVER'],
    ISSUED: ['ISSUER'],
    ARCHIVED: ['ARCHIVER'],
    VOID: ['PREPARER', 'APPROVER', 'ISSUER'],
  };
  if (!roleAllowed[to].includes(role)) throw new Error(`Role ${role} cannot perform transition to ${to}`);
  if ((to === STATES.APPROVED || to === STATES.ISSUED) && !record.authorizationId) {
    throw new Error('Authorization binding is required before approval or issue');
  }
  if (to === STATES.ISSUED && (!record.artifactId || !record.artifactSha256)) {
    throw new Error('Verified artifact binding is required before issue');
  }
  if (to === STATES.ARCHIVED && record.state !== STATES.ISSUED) {
    throw new Error('Only issued documents can be archived');
  }

  return Object.freeze({
    ...record,
    state: to,
    version: record.version + 1,
    updatedAt: now,
    lastTransition: Object.freeze({ actor, role, from: record.state, to, reason }),
  });
}

export function assertIssueEligible(record) {
  if (record?.state !== STATES.APPROVED) throw new Error('Document must be APPROVED before issue');
  if (!record.authorizationId || !record.artifactId || !record.artifactSha256) {
    throw new Error('Document authorization and verified artifact binding are required');
  }
  return true;
}
