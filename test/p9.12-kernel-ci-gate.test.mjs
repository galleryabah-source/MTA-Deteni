import assert from 'node:assert/strict';
import test from 'node:test';
import {evaluateCiGate} from '../src/infrastructure/testing/kernel-ci-gate.mjs';

const base={'dependency-install':true,'test-harness':true,typecheck:true,'secret-boundary':true,secretsDetected:false};
test('P9.12 accepts complete readiness evidence',()=>assert.equal(evaluateCiGate(base).status,'CI_GATE_READY'));
test('P9.12 fails on missing gate',()=>assert.throws(()=>evaluateCiGate({...base,typecheck:false}),/CI_GATE_NOT_READY:typecheck/));
test('P9.12 fails on secret detection',()=>assert.throws(()=>evaluateCiGate({...base,secretsDetected:true}),/CI_GATE_SECRET_BOUNDARY_FAILED/));
test('P9.12 does not claim execution',()=>assert.equal(evaluateCiGate(base).executionObserved,false));
