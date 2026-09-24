import test from "node:test";
import assert from "node:assert/strict";
import {authorizePrivateObjectAccess,buildPrivateObjectMetadata,buildPrivateObjectPath} from "../src/infrastructure/storage/private-storage-runtime.mjs";

test("P9.9 denies unauthenticated and invalid-scope access",()=>{
 assert.deepEqual(authorizePrivateObjectAccess({authenticated:false}),{allowed:false,reasonCode:"AUTH_REQUIRED"});
 assert.deepEqual(authorizePrivateObjectAccess({authenticated:true,scopeValid:false,classificationAllowed:true,objectId:"O1"}),{allowed:false,reasonCode:"SCOPE_DENIED"});
});

test("P9.9 requires classification and allows non-public metadata",()=>{
 const meta=buildPrivateObjectMetadata({objectId:"O1",bucket:"private",contentType:"application/pdf",sizeBytes:0,classification:"RESTRICTED",contentHash:"a".repeat(64)});
 assert.equal(meta.public,false);
 assert.equal(meta.sizeBytes,0);
});

test("P9.9 rejects public objects and path traversal",()=>{
 assert.throws(()=>buildPrivateObjectMetadata({objectId:"O1",bucket:"b",contentType:"x",sizeBytes:1,classification:"x",contentHash:"h",public:true}),/PRIVATE_STORAGE_PUBLIC_FORBIDDEN/);
 assert.throws(()=>buildPrivateObjectPath({tenantId:"tenant/evil",objectId:"O1"}),/STORAGE_PATH_TRAVERSAL_FORBIDDEN/);
 assert.throws(()=>buildPrivateObjectPath({tenantId:"tenant",objectId:"../O1"}),/STORAGE_PATH_TRAVERSAL_FORBIDDEN/);
 assert.equal(buildPrivateObjectPath({tenantId:"tenant-1",objectId:"O1"}),"tenant-1/O1");
});
