import assert from "node:assert/strict";
import { test } from "node:test";
const u=new URL("../src/infrastructure/database/production-schema-evidence.ts",import.meta.url);

test("P9.32 blocks incomplete or unsafe evidence",async()=>{const {certifyProductionSchemaEvidence}=await import(u);assert.equal(certifyProductionSchemaEvidence({capturedAt:"",projectId:"x",migrationFreeze:true,syntheticOnly:true,objects:[{objectName:"x",expectedFingerprint:"a",actualFingerprint:"a",status:"MATCH"}]}),"BLOCKED")});
test("P9.32 passes only exact frozen synthetic evidence",async()=>{const {certifyProductionSchemaEvidence}=await import(u);assert.equal(certifyProductionSchemaEvidence({capturedAt:"2026-09-21T08:39:32Z",projectId:"tmmhxqgzelgrsrxbbfzh",migrationFreeze:true,syntheticOnly:true,objects:[{objectName:"public.mta_detainees",expectedFingerprint:"a",actualFingerprint:"a",status:"MATCH"}]}),"PASS")});
test("P9.32 blocks drift",async()=>{const {certifyProductionSchemaEvidence}=await import(u);assert.equal(certifyProductionSchemaEvidence({capturedAt:"2026-09-21T08:39:32Z",projectId:"x",migrationFreeze:true,syntheticOnly:true,objects:[{objectName:"x",expectedFingerprint:"a",actualFingerprint:"b",status:"MISMATCH"}]}),"BLOCKED")});
