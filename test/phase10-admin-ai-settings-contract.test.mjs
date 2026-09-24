import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("Phase 10 admin AI settings are visible but governed OFF",()=>{
 const s=readFileSync("web/admin-settings-v9.js","utf8");
 for(const marker of ["AI API Configuration","p9aiProvider","p9aiModel","p9aiBaseUrl","p9aiKey","p9saveAiConfig","AI_API_CONFIG_UPDATE","enabled:false","AI Runtime"]) assert.ok(s.includes(marker),marker);
 assert.match(s,/API key\/secret tidak disimpan/i);
 assert.match(s,/Runtime tetap OFF/i);
});

test("Phase 10 AI settings reject non-HTTPS endpoint and never persist key",()=>{
 const s=readFileSync("web/admin-settings-v9.js","utf8");
 assert.match(s,/!\/\^https:\\\/\\\//i);
 assert.match(s,/d\.adminSettings\.aiConfig=\{provider,model,baseUrl,enabled:false\}/);
 assert.match(s,/key\.value=''/);
});

test("Phase 10 AI configuration has deterministic non-secret fingerprint and revision",()=>{
 const src=readFileSync("web/admin-settings-v9.js","utf8");
 assert.match(src,/aiConfigFingerprint/);
 assert.match(src,/SHA-256/);
 assert.match(src,/secretSource:'SERVER_SIDE_ONLY'/);
 assert.match(src,/fingerprint/);
 assert.match(src,/revision:Number\(d\.adminSettings\.aiConfig\?\.revision\|\|0\)\+1/);
});
