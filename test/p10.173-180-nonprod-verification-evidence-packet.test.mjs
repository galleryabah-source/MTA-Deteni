import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNonProductionEvidencePacket, assertNonProductionEvidencePacket, classifyNonProductionEvidencePacket } from '../src/runtime/nonprod-verification-evidence-packet.mjs';

const base = () => buildNonProductionEvidencePacket({
  planId:'synthetic:plan-p10.180', checkpoint:'P10.180', approvalRef:'synthetic:approval-180', targetRef:'synthetic:target-180',
  migrationArtifact:{syntheticOnly:true,sha256:'a'.repeat(64),state:'REVIEW_ONLY'}, rlsPolicy:{syntheticOnly:true,sha256:'b'.repeat(64),state:'DENY_BY_DEFAULT'},
  regressionEvidence:{syntheticOnly:true,sha256:'c'.repeat(64),classification:'PASS'}, integrityEvidence:{syntheticOnly:true,sha256:'d'.repeat(64),classification:'PASS'},
  releaseManifest:{syntheticOnly:true,sha256:'e'.repeat(64)}, rollbackPlan:{syntheticOnly:true,sha256:'f'.repeat(64)}, independentReview:{syntheticOnly:true,reviewerRef:'synthetic:reviewer-180',role:'INDEPENDENT_REVIEWER'}
});

test('P10.173 packet schema and bounded identity',()=>{ const p=base(); assert.equal(p.schemaVersion,'MTA-NONPROD-EVIDENCE-V1'); assert.equal(p.checkpoint,'P10.180'); assert.equal(p.syntheticOnly,true); assert.equal(p.safety.migrationFreeze,true); assert.equal(p.safety.aiEnabled,false); });
test('P10.174 incomplete governance remains blocked',()=>{ const p=buildNonProductionEvidencePacket({planId:'synthetic:p'}); assert.equal(p.status,'BLOCKED_PENDING_GOVERNANCE'); assert.equal(classifyNonProductionEvidencePacket(p).classification,'BLOCKED'); });
test('P10.175 complete packet validates but does not authorize execution',()=>{ const p=base(); assert.equal(assertNonProductionEvidencePacket(p),true); assert.deepEqual(classifyNonProductionEvidencePacket(p),{classification:'PASS',executionAuthorized:false,reason:'EVIDENCE_PACKET_VALIDATED_ONLY'}); });
test('P10.176 non-synthetic references are rejected',()=>{ const p=base(); const bad={...p,migrationArtifact:{...p.migrationArtifact,syntheticOnly:false}}; const c=classifyNonProductionEvidencePacket(bad); assert.equal(c.classification,'BLOCKED'); assert.equal(c.reason,'PACKET_MIGRATION_ARTIFACT_INVALID'); });
test('P10.177 gate evidence must be PASS',()=>{ const p=base(); const bad={...p,regressionEvidence:{...p.regressionEvidence,classification:'BLOCKED'}}; const c=classifyNonProductionEvidencePacket(bad); assert.equal(c.classification,'BLOCKED'); assert.equal(c.reason,'PACKET_GATE_EVIDENCE_NOT_PASS'); });
test('P10.178 real-looking approval references are rejected',()=>{ const p=base(); const bad={...p,approvalRef:'approval-prod-123'}; assert.equal(classifyNonProductionEvidencePacket(bad).classification,'BLOCKED'); });
test('P10.179 cryptographic packet tampering is detected',()=>{ const p=base(); const bad={...p,targetRef:'synthetic:target-other'}; assert.equal(classifyNonProductionEvidencePacket(bad).classification,'BLOCKED'); assert.equal(classifyNonProductionEvidencePacket(bad).reason,'PACKET_TAMPERED'); });
test('P10.180 independent review is required and no live execution occurs',()=>{ const p=base(); const bad={...p,independentReview:null}; assert.equal(classifyNonProductionEvidencePacket(bad).classification,'BLOCKED'); assert.equal(assertNonProductionEvidencePacket(p),true); assert.equal(classifyNonProductionEvidencePacket(p).executionAuthorized,false); });
