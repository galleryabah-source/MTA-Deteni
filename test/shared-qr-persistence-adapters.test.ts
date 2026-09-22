import test from "node:test";
import assert from "node:assert/strict";
import { createLocalPostgresSharedQrRegistry } from "../src/application/local-postgres-qr-registry.ts";
import { createSupabaseSharedQrRegistry } from "../src/application/supabase-qr-registry.ts";
import { createSharedQrResolver } from "../src/application/shared-qr-resolver-v2.ts";

test("local PostgreSQL adapter feeds the shared resolver",async()=>{
 const db={query:async(_sql:string,_params:readonly unknown[])=>({rows:[{resource_id:"DET-001",resource_type:"DETAINEE",token_hash:"HASHED",status:"ACTIVE",context:"RUDENIM_STAY",issued_at:"2026-09-22T08:00:00Z",expires_at:null}]})};
 const verifier={hash:async(_token:string)=> "HASHED"};
 const resolver=createSharedQrResolver(createLocalPostgresSharedQrRegistry(db,verifier));
 const result=await resolver.resolve({resourceId:"DET-001",token:"RAW",expectedContext:"RUDENIM_STAY"});
 assert.equal(result.outcome,"ACCEPTED");
});

test("Supabase adapter feeds the shared resolver",async()=>{
 let accessToken="";
 const http={resolve:async(input:{resourceId:string;token:string;accessToken:string})=>{accessToken=input.accessToken;return {resourceId:"DET-001",resourceType:"DETAINEE",token:input.token,status:"ACTIVE",context:"RUDENIM_STAY",issuedAt:"2026-09-22T08:00:00Z"} as const}};
 const resolver=createSharedQrResolver(createSupabaseSharedQrRegistry(http,"ACCESS-TOKEN"));
 const result=await resolver.resolve({resourceId:"DET-001",token:"RAW",expectedContext:"RUDENIM_STAY"});
 assert.equal(result.outcome,"ACCEPTED");
 assert.equal(accessToken,"ACCESS-TOKEN");
});
