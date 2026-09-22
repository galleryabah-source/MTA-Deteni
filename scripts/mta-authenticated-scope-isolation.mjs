import crypto from "node:crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) throw new Error("CONTROLLED_AUTH_ENV_REQUIRED");

const base = SUPABASE_URL.replace(/\/$/, "");
const adminHeaders = { apikey: SERVICE_ROLE_KEY, Authorization: "Bearer " + SERVICE_ROLE_KEY, "Content-Type": "application/json", Prefer: "return=representation" };
const anonHeaders = { apikey: ANON_KEY, "Content-Type": "application/json" };

async function request(path, options = {}) {
  const response = await fetch(base + path, options);
  const text = await response.text();
  let body; try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) throw new Error(response.status + " " + path + ": " + JSON.stringify(body));
  return body;
}
async function adminCreateUser(email, password) {
  return request("/auth/v1/admin/users", { method:"POST", headers:adminHeaders, body:JSON.stringify({email,password,email_confirm:true}) });
}
async function signIn(email, password) {
  return request("/auth/v1/token?grant_type=password", { method:"POST", headers:anonHeaders, body:JSON.stringify({email,password}) });
}
async function rest(path, token, options = {}) {
  return request("/rest/v1" + path, { ...options, headers:{apikey:ANON_KEY,Authorization:"Bearer "+token,"Content-Type":"application/json",Prefer:options.method==="POST"?"return=representation":"return=minimal"} });
}
async function adminRest(path, options = {}) {
  return request("/rest/v1" + path, { ...options, headers:{...adminHeaders,...(options.headers||{})} });
}

const runId = crypto.randomUUID().slice(0,8);
const ids = {scopeA:crypto.randomUUID(),scopeB:crypto.randomUUID(),detaineeA:crypto.randomUUID(),detaineeB:crypto.randomUUID()};
const emailA = "mta-controlled-a-"+runId+"@invalid.test";
const emailB = "mta-controlled-b-"+runId+"@invalid.test";
const passwordA = crypto.randomBytes(24).toString("base64url");
const passwordB = crypto.randomBytes(24).toString("base64url");
let userA, userB;
const evidence = {environment:"controlled-nonprod",syntheticOnly:true,runId,checks:[]};

function check(name, observed, expected) {
  const pass=observed===expected;
  evidence.checks.push({name,expected,observed,pass});
  if(!pass) throw new Error("ISOLATION_CHECK_FAILED:"+name);
}
async function expectDenied(name, fn) {
  try { await fn(); check(name,"ALLOW","DENY"); }
  catch { check(name,"DENY","DENY"); console.log("[PASS] "+name+" -> denied"); }
}

try {
  userA=await adminCreateUser(emailA,passwordA);
  userB=await adminCreateUser(emailB,passwordB);

  await adminRest("/mta_profiles",{method:"POST",body:JSON.stringify([
    {id:userA.id,role:"EDITOR",display_name:"CONTROLLED TEST USER A",active:true},
    {id:userB.id,role:"EDITOR",display_name:"CONTROLLED TEST USER B",active:true}
  ])});
  await adminRest("/mta_scopes",{method:"POST",body:JSON.stringify([
    {id:ids.scopeA,code:"CTRL-"+runId+"-A",name:"Controlled Non-Production Scope A",active:true},
    {id:ids.scopeB,code:"CTRL-"+runId+"-B",name:"Controlled Non-Production Scope B",active:true}
  ])});
  await adminRest("/mta_profile_scopes",{method:"POST",body:JSON.stringify([
    {profile_id:userA.id,scope_id:ids.scopeA,active:true},
    {profile_id:userB.id,scope_id:ids.scopeB,active:true}
  ])});
  await adminRest("/mta_detainees",{method:"POST",body:JSON.stringify([
    {id:ids.detaineeA,code:"CTRL-"+runId+"-A",name:"CONTROLLED SYNTHETIC A",nationality:"TEST",status:"AKTIF",source:"CONTROLLED_NONPROD",scope_id:ids.scopeA},
    {id:ids.detaineeB,code:"CTRL-"+runId+"-B",name:"CONTROLLED SYNTHETIC B",nationality:"TEST",status:"AKTIF",source:"CONTROLLED_NONPROD",scope_id:ids.scopeB}
  ])});

  const tokenA="CONTROLLED-QR-A", tokenB="CONTROLLED-QR-B";
  const hash=t=>crypto.createHash("sha256").update(t,"utf8").digest("hex");
  await adminRest("/mta_qr_registry",{method:"POST",body:JSON.stringify([
    {resource_id:ids.detaineeA,token_hash:hash(tokenA),status:"ACTIVE",context:"RUDENIM_STAY",expires_at:new Date(Date.now()+3600000).toISOString()},
    {resource_id:ids.detaineeB,token_hash:hash(tokenB),status:"ACTIVE",context:"RUDENIM_STAY",expires_at:new Date(Date.now()+3600000).toISOString()}
  ])});

  const sessionA=await signIn(emailA,passwordA), sessionB=await signIn(emailB,passwordB);

  let rows=await rest("/mta_detainees?id=eq."+ids.detaineeA+"&select=id,scope_id",sessionA.access_token); check("A reads own scope",rows.length,1);
  rows=await rest("/mta_detainees?id=eq."+ids.detaineeB+"&select=id,scope_id",sessionA.access_token); check("A cannot read foreign scope",rows.length,0);
  rows=await rest("/mta_detainees?id=eq."+ids.detaineeB+"&select=id,scope_id",sessionB.access_token); check("B reads own scope",rows.length,1);
  rows=await rest("/mta_detainees?id=eq."+ids.detaineeA+"&select=id,scope_id",sessionB.access_token); check("B cannot read foreign scope",rows.length,0);

  await rest("/mta_detainees",sessionA.access_token,{method:"POST",body:JSON.stringify({id:crypto.randomUUID(),code:"CTRL-"+runId+"-A2",name:"CONTROLLED SYNTHETIC A2",nationality:"TEST",status:"AKTIF",source:"CONTROLLED_NONPROD",scope_id:ids.scopeA})});
  check("A inserts own scope","ALLOW","ALLOW");

  await expectDenied("A inserts foreign scope",()=>rest("/mta_detainees",sessionA.access_token,{method:"POST",body:JSON.stringify({id:crypto.randomUUID(),code:"CTRL-"+runId+"-AX",name:"CONTROLLED SYNTHETIC CROSS",nationality:"TEST",status:"AKTIF",source:"CONTROLLED_NONPROD",scope_id:ids.scopeB})}));

  let qr=await rest("/rpc/mta_resolve_qr",sessionA.access_token,{method:"POST",body:JSON.stringify({p_resource_id:ids.detaineeA,p_token:tokenA,p_expected_context:"RUDENIM_STAY"})});
  check("A resolves own QR",qr.length,1);
  await expectDenied("A cannot resolve foreign QR",()=>rest("/rpc/mta_resolve_qr",sessionA.access_token,{method:"POST",body:JSON.stringify({p_resource_id:ids.detaineeB,p_token:tokenB,p_expected_context:"RUDENIM_STAY"})}));
  qr=await rest("/rpc/mta_resolve_qr",sessionB.access_token,{method:"POST",body:JSON.stringify({p_resource_id:ids.detaineeB,p_token:tokenB,p_expected_context:"RUDENIM_STAY"})});
  check("B resolves own QR",qr.length,1);
  await expectDenied("B cannot resolve foreign QR",()=>rest("/rpc/mta_resolve_qr",sessionB.access_token,{method:"POST",body:JSON.stringify({p_resource_id:ids.detaineeA,p_token:tokenA,p_expected_context:"RUDENIM_STAY"})}));

  evidence.result="PASS";
  console.log(JSON.stringify(evidence,null,2));
} finally {
  const enc=v=>encodeURIComponent(v);
  try{await adminRest("/mta_qr_registry?resource_id=in.("+enc(ids.detaineeA)+","+enc(ids.detaineeB)+")",{method:"DELETE"});}catch{}
  try{await adminRest("/mta_detainees?id=in.("+enc(ids.detaineeA)+","+enc(ids.detaineeB)+")",{method:"DELETE"});}catch{}
  try{await adminRest("/mta_profile_scopes?profile_id=in.("+enc(userA?.id||"00000000-0000-0000-0000-000000000000")+","+enc(userB?.id||"00000000-0000-0000-0000-000000000000")+")",{method:"DELETE"});}catch{}
  try{await adminRest("/mta_profiles?id=in.("+enc(userA?.id||"00000000-0000-0000-0000-000000000000")+","+enc(userB?.id||"00000000-0000-0000-0000-000000000000")+")",{method:"DELETE"});}catch{}
  try{await adminRest("/mta_scopes?id=in.("+enc(ids.scopeA)+","+enc(ids.scopeB)+")",{method:"DELETE"});}catch{}
  for(const user of [userA,userB]) if(user?.id){try{await request("/auth/v1/admin/users/"+user.id,{method:"DELETE",headers:adminHeaders});}catch{}}
}
