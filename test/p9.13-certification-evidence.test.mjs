import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEvidence, evaluateCertification } from '../src/kernel/certification-evidence.mjs';

test('P9.13-EV-001: only stable evidence states are accepted', () => {
  assert.throws(() => buildEvidence([{ id: 'X', status: 'UNKNOWN' }]), /EVIDENCE_INVALID_RESULT/);
  assert.equal(buildEvidence([{ id: 'X', status: 'PASS' }]).evidenceVersion, 'P9.13-EV-1.0');
});

test('P9.13-EV-002: evidence hash is deterministic', () => {
  const a = buildEvidence([{ id: 'A', status: 'PASS', detail: 'ok' }]);
  const b = buildEvidence([{ id: 'A', status: 'PASS', detail: 'ok' }]);
  assert.equal(a.sha256, b.sha256);
});

test('P9.13-GATE-001..003: incomplete evidence cannot certify', () => {
  assert.equal(evaluateCertification(buildEvidence([{ id: 'A', status: 'FAIL' }])).reason, 'FAIL_PRESENT');
  assert.equal(evaluateCertification(buildEvidence([{ id: 'A', status: 'BLOCKED' }])).reason, 'BLOCKED_PRESENT');
  assert.equal(evaluateCertification(buildEvidence([{ id: 'A', status: 'NOT_RUN' }])).reason, 'NOT_RUN_PRESENT');
});

test('P9.13-GATE-004: certification requires all required checks PASS', () => {
  assert.deepEqual(evaluateCertification(buildEvidence([{ id: 'A', status: 'PASS' }, { id: 'B', status: 'PASS' }])), { certifiable: true, reason: 'ALL_REQUIRED_PASS' });
});
