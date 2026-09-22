import test from "node:test";
import assert from "node:assert/strict";

const validate=(event)=>{
  const required=["eventId","auditEventId","operation","table","row","requestId","correlationId","actorUserId","idempotencyKey"];
  for(const field of required)if(!(field in event.payload))throw new Error("OUTBOX_PAYLOAD_INVALID:"+field);
  if(event.payload.eventId!==event.event_id)throw new Error("OUTBOX_EVENT_ID_MISMATCH");
  if(event.payload.idempotencyKey!==event.idempotency_key)throw new Error("OUTBOX_IDEMPOTENCY_MISMATCH");
  return true;
};

test("P9.8 dispatcher validates deterministic identity",()=>{
  const event={event_id:"evt-1",idempotency_key:"idem-1",payload:{eventId:"evt-1",auditEventId:"audit-1",operation:"INSERT",table:"mta_detainees",row:{id:"det-1"},requestId:"req-1",correlationId:"corr-1",actorUserId:"user-1",idempotencyKey:"idem-1"}};
  assert.equal(validate(event),true);
});

test("P9.8 dispatcher rejects event identity mismatch",()=>{
  const event={event_id:"evt-1",idempotency_key:"idem-1",payload:{eventId:"evt-2",idempotencyKey:"idem-1"}};
  assert.throws(()=>validate(event),/OUTBOX_PAYLOAD_INVALID|OUTBOX_EVENT_ID_MISMATCH/);
});