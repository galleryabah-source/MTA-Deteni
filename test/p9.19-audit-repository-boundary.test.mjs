import assert from "node:assert/strict";
import test from "node:test";
import { validateAuditRecord } from "../src/infrastructure/database/audit-repository-boundary.ts";

const record={eventId:"E1",actorId:"U1",action:"LEAVE.SUBMIT",resourceType:"leave",resourceId:"L1",result:"SUCCESS",requestId:"R1",correlationId:"C1",policyVersion:"P9.4-v1",occurredAt:"2026-09-21T01:00:00Z"};

test("complete audit record is accepted",()=>assert.equal(validateAuditRecord(record),true));
test("missing correlation identity is rejected",()=>assert.equal(validateAuditRecord({...record,correlationId:""}),false));
test("missing actor is rejected",()=>assert.equal(validateAuditRecord({...record,actorId:""}),false));
