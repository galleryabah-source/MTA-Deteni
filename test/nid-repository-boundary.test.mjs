import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const ROOT=new URL("..",import.meta.url);
const EXT=new Set([".js",".mjs",".ts",".tsx"]);
const SKIP=new Set(["node_modules",".git",".next","dist","build"]);

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

test("repository-wide NID boundary: no application mutation path may inject caller NID",()=>{
  const violations=[];
  for(const path of files(ROOT.pathname)){
    const rel=path.replace(ROOT.pathname,"").replaceAll("\\","/");
    if(rel.startsWith("test/"))continue;
    const source=readFileSync(path,"utf8");
    if(/name=["']nid["']/.test(source))violations.push(rel+":NID_FORM_INPUT");
    if(/\b(?:createDetainee|updateDetainee|mutateDetainee)\s*\([^)]*\bnid\s*:/.test(source))violations.push(rel+":NID_COMMAND_ARGUMENT");
    if(/\b(?:createDetainee|updateDetainee|mutateDetainee)\s*\([^)]*\bnid\s*=/.test(source))violations.push(rel+":NID_COMMAND_ASSIGNMENT");
  }
  assert.deepEqual(violations,[]);
});

test("RAP/Perkes/Kamtib may consume canonical detainee identity but cannot define a second NID generator",()=>{
  const violations=[];
  for(const path of files(ROOT.pathname)){
    const rel=path.replace(ROOT.pathname,"").replaceAll("\\","/");
    if(rel.startsWith("test/")||rel.startsWith("docs/")||rel.includes("/migrations/"))continue;
    const source=readFileSync(path,"utf8");
    if(!/rap|perkes|kamtib/i.test(rel))continue;
    if(/RDM-PTK-|nextval\s*\(|mta_detainee_nid_seq|nid\s*=\s*["']/i.test(source)){
      violations.push(rel+":SECOND_NID_IDENTITY_PATH");
    }
  }
  assert.deepEqual(violations,[]);
});
