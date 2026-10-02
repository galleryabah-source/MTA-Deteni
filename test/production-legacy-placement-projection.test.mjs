import fs from 'node:fs';
import assert from 'node:assert/strict';

const adapter=fs.readFileSync('web/mta-production-state-adapter-v1.js','utf8');
const runtime=fs.readFileSync('web/mta-app-runtime-full.js','utf8');

assert.match(adapter,/function projectLegacyPlacements\(detainees,rooms,placements\)/);
assert.match(adapter,/sourceField:'mta_detainees\.placement'/);
assert.match(adapter,/PRODUCTION_DB_LEGACY_PLACEMENT/);
assert.match(adapter,/const effectivePlacements=\[\.\.\.ps,\.\.\.legacyProjected\]/);
assert.match(adapter,/legacyPlacementProjectionCount:legacyProjected\.length/);
assert.match(runtime,/mta-production-state-adapter-v1\.js\?v=7\&legacy-placement=1/);

console.log('PRODUCTION LEGACY PLACEMENT PROJECTION CONTRACT: PASS');

// Production compatibility projection is intentionally read-only and cache-busted.
