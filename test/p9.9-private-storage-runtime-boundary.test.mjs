import test from 'node:test';
import assert from 'node:assert/strict';
import {authorizePrivateObjectAccess,buildPrivateObjectMetadata} from '../src/infrastructure/storage/private-storage-runtime.mjs';

test('P9.9 denies unauthenticated access',()=>{
  assert.deepEqual(authorizePrivateObjectAccess({authenticated:false}),{allowed:false,reasonCode:'AUTH_REQUIRED'});
});
test('P9.9 denies missing scope',()=>{
  assert.equal(authorizePrivateObjectAccess({authenticated:true,scopeValid:false,classificationAllowed:true,objectId:'O1'}).reasonCode,'SCOPE_DENIED');
});
test('P9.9 denies disallowed classification',()=>{
  assert.equal(authorizePrivateObjectAccess({authenticated:true,scopeValid:true,classificationAllowed:false,objectId:'O1'}).reasonCode,'RESOURCE_CLASSIFICATION_DENIED');
});
test('P9.9 allows governed private object',()=>{
  assert.deepEqual(authorizePrivateObjectAccess({authenticated:true,scopeValid:true,classificationAllowed:true,objectId:'O1'}),{allowed:true,reasonCode:'ALLOW',objectId:'O1'});
});
test('P9.9 builds non-public metadata',()=>{
  const m=buildPrivateObjectMetadata({objectId:'O1',bucket:'mta-deteni-private',contentType:'application/pdf',sizeBytes:10,classification:'RESTRICTED'});
  assert.equal(m.public,false);
  assert.equal(m.version,'P9.9-IMPLEMENTATION-v1');
});
test('P9.9 rejects public metadata',()=>{
  assert.throws(()=>buildPrivateObjectMetadata({objectId:'O1',bucket:'mta-deteni-private',contentType:'x',sizeBytes:1,classification:'x',public:true}),/PRIVATE_STORAGE_PUBLIC_FORBIDDEN/);
});
