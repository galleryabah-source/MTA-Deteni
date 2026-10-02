import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const ROOT=new URL("..",import.meta.url).pathname;
const EXT=new Set([".js",".mjs",".ts",".tsx"]);
const SKIP=new Set(["node_modules",".git",".next","dist","build","coverage"]);

const KNOWN_LEGACY_CONSUMERS=new Set([
  "web/mta-domain-commands-v1.js",
  "web/mta-domain-commands-v2.js",
  "web/mta-production-state-adapter-v1.js",
  "web/mta-app-runtime-full.js",
  "web/movement-v9.js",
  "web/detainee-detail-v1.js",
  "web/detainee-statistics-v1.js",
  "web/data-statistics-report-v1.js",
  "web/qr-print-clean.js",
  "web/qr-print-clean-v2.js",
  "web/mta-app-runtime-full.js",
  "web/detainee-detail-v1.js",
  "web/detainee-statistics-v1.js",
  "web/data-statistics-report-v1.js",
  "web/qr-print-clean.js",
  "web/qr-print-clean-v2.js",
  "web/movement-v9.js",
  "supabase/functions/mta-api/index.ts"
]);

function files(dir){
  const out=[];
  for(const entry of readdirSync(dir,{withFileTypes:true})){
    if(SKIP.has(entry.name))continue;
    const path=join(dir,entry.name);
    if(entry.isDirectory())out.push(...files(path));
    else if(EXT.has(path.slice(path.lastIndexOf("."))))out.push(path);
  }
  return out;
}

function hasDetaineeCodePattern(source){
  return [
    /options\??\.code\b/,
    /\b[oO]\.code\b/,
    /\b[dD]\.code\b/,
    /\b[xX]\.code\b/,
    /\bdetaineeCode\b/,
    /\bname=["']code["']/,
    /\bcode\s*:\s*String\((?:options|o|args|body)\??\.code/
  ].some(re=>re.test(source));
}

test("legacy detainee code boundary: no new application consumer is introduced",()=>{
  const discovered=[];
  for(const path of files(ROOT)){
    const rel=relative(ROOT,path).replaceAll("\\","/");
    if(rel.startsWith("test/")||rel.startsWith("docs/"))continue;
    const source=readFileSync(path,"utf8");
    if(hasDetaineeCodePattern(source))discovered.push(rel);
  }

  const unexpected=discovered.filter(rel=>!KNOWN_LEGACY_CONSUMERS.has(rel));
  assert.deepEqual(
    unexpected,
    [],
    "NEW_LEGACY_CODE_CONSUMER: update the provenance inventory and review the migration boundary before adding another consumer"
  );

  for(const rel of KNOWN_LEGACY_CONSUMERS){
    assert.ok(discovered.includes(rel), "LEGACY_CONSUMER_INVENTORY_DRIFT: "+rel);
  }
});

test("legacy detainee code boundary: NID remains the canonical identity contract",()=>{
  const contract=readFileSync(join(ROOT,"docs/NID_CANONICAL_IDENTITY_CONTRACT_V1.md"),"utf8");
  assert.match(contract,/RDM-PTK-YY-NNNNNN/);
  assert.match(contract,/single operational identity/i);
  assert.match(contract,/No section-specific detainee number/i);
});
