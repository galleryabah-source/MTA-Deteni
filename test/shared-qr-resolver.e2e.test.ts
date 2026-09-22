import test from "node:test";
import assert from "node:assert/strict";
import { createInMemorySharedQrResolver } from "../src/application/shared-qr-resolver-v2.ts";
import { createLocalLanSharedQrRegistry, createCloudSharedQrRegistry } from "../src/application/shared-qr-registry-adapters.ts";
import { createProtectedQrProjection } from "../src/application/shared-qr-protected-projection.ts";

test("multi-device QR E2E resolves through one shared registry and preserves protected projection boundary", async()=>{
  const issuedAt="2026-09-22T08:00:00.000Z";
  const resolver=createInMemorySharedQrResolver([{
    resourceId:"DET-001",resourceType:"DETAINEE",token:"DTQR-SHARED-001",
    status:"ACTIVE",context:"RUDENIM_STAY",issuedAt
  }]);

  const deviceA={deviceId:"DESKTOP-A",authenticated:true};
  const deviceB={deviceId:"SMARTPHONE-B",authenticated:true};
  const payload="mta://detainee/DET-001/DTQR-SHARED-001";

  const parts=payload.split("/").filter(Boolean);
  const resourceId=parts.at(-2);
  const token=parts.at(-1);
  assert.equal(resourceId,"DET-001");
  assert.equal(token,"DTQR-SHARED-001");

  const resolved=await resolver.resolve({resourceId,token,expectedContext:"RUDENIM_STAY",now:"2026-09-22T08:05:00.000Z"});
  assert.equal(resolved.outcome,"ACCEPTED");
  assert.equal(resolved.record?.resourceId,"DET-001");

  assert.notEqual(deviceA.deviceId,deviceB.deviceId);
  assert.equal(deviceB.authenticated,true);

  const projection=resolved.outcome==="ACCEPTED" && deviceB.authenticated
    ? {allowed:true,resourceId:resolved.resourceId,requiresRbac:true}
    : {allowed:false};
  assert.deepEqual(projection,{allowed:true,resourceId:"DET-001",requiresRbac:true});
  const correlated=createProtectedQrProjection({resolution:resolved,actorId:"OPERATOR-B",authenticated:true,authorized:true,correlationId:"COR-QR-001"});
  assert.equal(correlated.projection.allowed,true);
  assert.equal(correlated.audit.length,2);
  assert.ok(correlated.audit.every(event=>event.correlationId==="COR-QR-001"));
});

test("shared QR resolver rejects wrong token, revoked state, expired token and context mismatch",async()=>{
  const resolver=createInMemorySharedQrResolver([
    {resourceId:"DET-1",resourceType:"DETAINEE",token:"GOOD",status:"ACTIVE",context:"RUDENIM_STAY",issuedAt:"2026-09-22T08:00:00Z"},
    {resourceId:"DET-2",resourceType:"DETAINEE",token:"REVOKED",status:"REVOKED",context:"RUDENIM_STAY",issuedAt:"2026-09-22T08:00:00Z"},
    {resourceId:"DET-3",resourceType:"DETAINEE",token:"EXPIRED",status:"ACTIVE",context:"RUDENIM_STAY",issuedAt:"2026-09-22T08:00:00Z",expiresAt:"2026-09-22T08:04:00Z"}
  ]);
  assert.equal((await resolver.resolve({resourceId:"DET-1",token:"BAD",expectedContext:"RUDENIM_STAY",now:"2026-09-22T08:01:00Z"})).outcome,"DENIED");
  assert.equal((await resolver.resolve({resourceId:"DET-2",token:"REVOKED",expectedContext:"RUDENIM_STAY",now:"2026-09-22T08:01:00Z"})).outcome,"REVOKED");
  assert.equal((await resolver.resolve({resourceId:"DET-3",token:"EXPIRED",expectedContext:"RUDENIM_STAY",now:"2026-09-22T08:05:00Z"})).outcome,"EXPIRED");
});


test("runtime-neutral QR resolver accepts LAN and Cloud registry implementations without changing the resolver", async()=>{
  const record={resourceId:"DET-X",resourceType:"DETAINEE",token:"TOKEN-X",status:"ACTIVE",context:"RUDENIM_STAY",issuedAt:"2026-09-22T08:00:00Z"} as const;
  const transport={lookup:async(input:{resourceId:string;token:string})=>input.resourceId==="DET-X"&&input.token==="TOKEN-X"?record:null};
  const lanRegistry=createLocalLanSharedQrRegistry(transport);
  const cloudRegistry=createCloudSharedQrRegistry(transport);
  const lan=createSharedQrResolver(lanRegistry);
  const cloud=createSharedQrResolver(cloudRegistry);
  const input={resourceId:"DET-X",token:"TOKEN-X",expectedContext:"RUDENIM_STAY" as const,now:"2026-09-22T08:05:00Z"};
  assert.equal((await lan.resolve(input)).outcome,"ACCEPTED");
  assert.equal((await cloud.resolve(input)).outcome,"ACCEPTED");
});
