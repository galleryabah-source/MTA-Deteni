import test from "node:test";
import assert from "node:assert/strict";
import { createSharedQrResolver } from "../src/application/shared-qr-resolver-v2.ts";
import { createLocalLanSharedQrRegistry, createCloudSharedQrRegistry } from "../src/application/shared-qr-registry-adapters.ts";

test("runtime-neutral QR resolver accepts LAN and Cloud registry implementations", async()=>{
  const record={resourceId:"DET-X",resourceType:"DETAINEE",token:"TOKEN-X",status:"ACTIVE",context:"RUDENIM_STAY",issuedAt:"2026-09-22T08:00:00Z"} as const;
  const transport={lookup:async(input:{resourceId:string;token:string})=>input.resourceId==="DET-X"&&input.token==="TOKEN-X"?record:null};
  const input={resourceId:"DET-X",token:"TOKEN-X",expectedContext:"RUDENIM_STAY" as const,now:"2026-09-22T08:05:00Z"};
  const lan=createSharedQrResolver(createLocalLanSharedQrRegistry(transport));
  const cloud=createSharedQrResolver(createCloudSharedQrRegistry(transport));
  assert.equal((await lan.resolve(input)).outcome,"ACCEPTED");
  assert.equal((await cloud.resolve(input)).outcome,"ACCEPTED");
});

test("registry adapter cannot silently alter resolver validation", async()=>{
  const record={resourceId:"DET-X",resourceType:"DETAINEE",token:"TOKEN-X",status:"REVOKED",context:"RUDENIM_STAY",issuedAt:"2026-09-22T08:00:00Z"} as const;
  const transport={lookup:async()=>record};
  const input={resourceId:"DET-X",token:"TOKEN-X",expectedContext:"RUDENIM_STAY" as const,now:"2026-09-22T08:05:00Z"};
  const resolver=createSharedQrResolver(createCloudSharedQrRegistry(transport));
  assert.equal((await resolver.resolve(input)).outcome,"REVOKED");
});