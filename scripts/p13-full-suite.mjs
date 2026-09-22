#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=process.cwd();
const testDir=path.join(root,'test');
const files=fs.readdirSync(testDir)
  .filter(name=>/^p13.*\.test\.(ts|mjs)$/.test(name))
  .sort();

if(!files.length) throw new Error('P13_FULL_SUITE_NO_TESTS');

console.log('P13_FULL_SUITE_START');
console.log('count='+files.length);
for(const file of files) console.log(file);

const args=['tsx','--test',...files.map(f=>path.join('test',f))];
const result=spawnSync(process.platform==='win32'?'npx.cmd':'npx',args,{
  cwd:root,
  stdio:'inherit',
  env:{...process.env,CI:'true'}
});
if(result.error) throw result.error;
if(result.status!==0) process.exit(result.status??1);
console.log('P13_FULL_SUITE_PASS count='+files.length);
