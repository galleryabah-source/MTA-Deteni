import test from 'node:test';
import assert from 'node:assert/strict';
import {createObservabilityEvent,redactValue} from '../src/infrastructure/observability/observability-runtime.mjs';

test('P9.10 creates correlated event',()=>assert.equal(createObservabilityEvent({eventName:'COMMAND_STARTED',requestId:'R1',correlationId:'C1',occurredAt:'2026-09-21T00:00:00Z'}).requestId,'R1'));
test('P9.10 redacts secrets recursively',()=>assert.deepEqual(redactValue({authorization:'Bearer x',nested:{access_token:'x'},safe:'ok'}),{authorization:'[REDACTED]',nested:{access_token:'[REDACTED]'},safe:'ok'}));
test('P9.10 requires correlation fields',()=>assert.throws(()=>createObservabilityEvent({eventName:'X'}),/OBSERVABILITY_FIELD_REQUIRED:requestId/));
