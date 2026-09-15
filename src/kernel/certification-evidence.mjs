import { createHash } from 'node:crypto';

const STATES = new Set(['PASS', 'FAIL', 'BLOCKED', 'NOT_RUN']);

export function buildEvidence(checks) {
  if (!Array.isArray(checks) || checks.length === 0) throw new Error('EVIDENCE_EMPTY');
  for (const check of checks) {
    if (!check?.id?.trim() || !STATES.has(check.status)) throw new Error('EVIDENCE_INVALID_RESULT');
  }
  const canonical = JSON.stringify(checks.map(({ id, status, detail = null }) => ({ id, status, detail })));
  return Object.freeze({ evidenceVersion: 'P9.13-EV-1.0', checks: JSON.parse(canonical), sha256: createHash('sha256').update(canonical, 'utf8').digest('hex') });
}

export function evaluateCertification(evidence) {
  if (!evidence?.checks?.length) return { certifiable: false, reason: 'EVIDENCE_EMPTY' };
  if (evidence.checks.some((c) => c.status === 'FAIL')) return { certifiable: false, reason: 'FAIL_PRESENT' };
  if (evidence.checks.some((c) => c.status === 'BLOCKED')) return { certifiable: false, reason: 'BLOCKED_PRESENT' };
  if (evidence.checks.some((c) => c.status === 'NOT_RUN')) return { certifiable: false, reason: 'NOT_RUN_PRESENT' };
  return { certifiable: evidence.checks.every((c) => c.status === 'PASS'), reason: 'ALL_REQUIRED_PASS' };
}
