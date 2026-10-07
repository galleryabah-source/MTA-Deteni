import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync(new URL("../web/mta-unified-shell-v2.js",import.meta.url),"utf8");
const actionStart=source.indexOf("function action(kind,id)");
assert.notEqual(actionStart,-1,"canonical QR action function must exist");

const actionEnd=source.indexOf("\nfunction ",actionStart+10);
assert.notEqual(actionEnd,-1,"QR action function boundary must remain identifiable");

assert.match(source,/function recordQrActionAudit\(actionName,type,id,result='SUCCESS'\)/,"QR action audit must have a non-blocking runtime boundary");
assert.match(source,/mtaProductionStateAdapter\?\.isProduction\?\.\(\)===true/ ,"production QR action must not use browser-local audit persistence");

const actionSource=source.slice(actionStart,actionEnd);

assert.match(actionSource,/openQrDetaineeDetail\(id\)/,"detainee QR action must route directly to personal detail");
assert.doesNotMatch(actionSource,/dataset\.mtaQrAction='movement'/,"generic movement action must not remain the primary detainee QR handoff");
assert.match(source,/addEventListener\('click',\(\)=>openQrDetaineeLeave\(id\)/,"leave action must use the personal detainee leave context handler");
assert.match(source,/addEventListener\('click',\(\)=>openQrDetaineeDetail\(id\)/,"detainee detail action must preserve the personal detainee context");
assert.doesNotMatch(actionSource,/onclick=/,"QR operational action must not depend on inline onclick handlers");

const resolveStart=source.indexOf("function resolve(raw)");
assert.notEqual(resolveStart,-1,"canonical QR resolve function must exist");
const resolveEnd=source.indexOf("\nfunction ",resolveStart+10);
assert.notEqual(resolveEnd,-1,"QR resolve function boundary must remain identifiable");
const resolveSource=source.slice(resolveStart,resolveEnd);
assert.match(resolveSource,/dataset\.mtaQrAction='continue'/,"accepted QR result must expose a canonical continue-action boundary");
assert.match(resolveSource,/addEventListener\('click',\(\)=>\{if\(typeof window\.mtaUnifiedAction==='function'\)window\.mtaUnifiedAction\(r\.kind,r\.id\)/,"continue action must use a programmatic dispatcher");
assert.doesNotMatch(resolveSource,/onclick=/,"QR resolve result must not depend on inline onclick handlers");

console.log("QR action handoff regression: PASS");
