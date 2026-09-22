#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=process.cwd();
const files=fs.readdirSync(path.join(root,'test'))
  .filter(name=>/^p13.*\.test\.(ts|mjs)$/.test(name))
  .sort();

if(!files.length) throw new Error('P13_FULL_SUITE_NO_TESTS');
console.log('P13_FULL_SUITE_START count='+files.length);
const result=spawnSync(process.platform==='win32'?'npx.cmd':'npx',['tsx','--test',...files.map(f=>path.join('test',f))],{cwd:root,stdio:'inherit',env:{...process.env,CI:'true'}});
if(result.error) throw result.error;
if(result.status!==0) process.exit(result.status??1);
console.log('P13_FULL_SUITE_PASS count='+files.length);
