import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("Phase 10 canonical navigation covers operational surfaces",()=>{
 const s=readFileSync("web/mta-unified-shell-v2.js","utf8");
 for(const view of ["dashboard","detainee","placement","movement","leave","documents","audit","p9settings","monitor","ops-queue","qr-center","camera-scan","room-ops","reports","scan-center","leave-qr"]) assert.ok(s.includes(view),view);
 assert.match(s,/function navigationContractTest\\(\\)/);
 assert.match(s,/NAV_CONTRACT/);
});

test("Phase 10 scanner journey remains explicit",()=>{
 const s=readFileSync("web/mta-unified-shell-v2.js","utf8");
 for(const marker of ["evaluateQrPayload","mtaUnifiedResolve","mtaUnifiedAction","QR_RESOLVE_","QR_ACTION_OPEN"]) assert.ok(s.includes(marker),marker);
});