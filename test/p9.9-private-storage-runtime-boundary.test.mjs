import test from 'node:test';
import assert from 'node:assert/strict';
import {authorizePrivateObjectAccess,buildPrivateObjectMetadata} from '../src/infrastructure/storage/private-storage-runtime.mjs';

test('P9.9 denies unauthenticated access',()=>assert.deepEqual(authorizePrivateObjectAccess({authenticated:false}),{allowed:false,reasonCode:'AUTH_REQUIRED'}));
test('P9.9 requires scope and classification',()=>assert.equal(authorizePrivateObjectAccess({authenticated:true,scopeValid:false,classificationAllowed:true,objectId:'O1'}).reasonCode,'SCOPE_DENIED'));
test('P9.9 builds non-public metadata',()=>assert.equal(buildPrivateObjectMetadata({objectId:'O1',bucket:'mta-deteni-private',contentType:'application/pdf',sizeBytes:10,classification:'RESTRICTED'}).public,false));
test('P9.9 rejects public metadata',()=>assert.throws(()=>buildPrivateObjectMetadata({objectId:'O1',bucket:'b',contentType:'x',sizeBytes:1,classification:'x',public:true}),/PRIVATE_STORAGE_PUBLIC_FORBIDDEN/));
