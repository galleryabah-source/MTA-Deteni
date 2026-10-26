import assert from "node:assert/strict";
import test from "node:test";
import { validateOutboxRecord } from "../src/infrastructure/database/outbox-repository-boundary.ts";

const record={eventId:"E1",aggregateType:"leave",aggregateId:"L1",eventType:"LEAVE.SUBMITTED",payloadHash:"a".repeat(64),occurredAt:"2026-09-21T01:00:00Z",status:"PENDING",attemptCount:0};

test("valid outbox record is accepted",()=>assert.equal(validateOutboxRecord(record),true));
test("missing event identity is rejected",()=>assert.equal(validateOutboxRecord({...record,eventId:""}),false));
test("negative attempts are rejected",()=>assert.equal(validateOutboxRecord({...record,attemptCount:-1}),false));
