test('SIG-006A server identity resolver follows canonical metadata storage for DOB/passport',()=>{
  assert.match(apiSource,/select\("id,nid,name,nationality,status,scope_id,metadata"\)/);
  assert.match(apiSource,/metadata=datee?/)
  assert.match(apiSource,/metadata\.dateOfBirth\?\?metadata\.date_of_birth/);
  assert.match(apiSource,/metadata\.passportNumber\?\?metadata\.passport_number/);
  assert.doesNotMatch(apiSource,/select\("id,nid,name,date_of_birth,passport_number,nationality,status,scope_id"\)/);
});

test('SIG-006 production API contains a server-side identity gate before detainee mutation',()=>{
  assert.match(apiSource,/resolveDetaineeIdentityCandidates/);
  assert.match(apiSource,/IDENTITY_REVIEW_REQUIRED/);
  assert.match(apiSource,/identity_decision/);
  assert.match(apiSource,/resource==="detainees" && req.method==="POST"/);
});

test('SIG-007 production adapter sends identity fields inside the canonical detainee payload',()=>{
  const adapterSource=fs.readFileSync(new URL('../web/mta-production-state-adapter-v1.js',import.meta.url),'utf8');
  assert.match(adapterSource,/metadata:\{gender:String\(gender\|\|''\),dateOfBirth:String\(dateOfBirth\|\|''\)/);
  assert.match(adapterSource,/identity_decision:String\(identityDecision\|\|''\)/);
});
