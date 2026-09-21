import assert from "node:assert/strict"; import {test} from "node:test";
const u=new URL("../src/infrastructure/database/audit-outbox-runtime-composition.ts",import.meta.url);
test("P10.35 requires both audit and outbox append ports",async()=>{
 const {validateAuditOutboxComposition}=await import(u);
 assert.equal(validateAuditOutboxComposition({audit:{append:async()=>{}},outbox:{append:async()=>{}}}),true);
 assert.equal(validateAuditOutboxComposition({audit:{append:async()=>{}},outbox:{}}),false);
});
