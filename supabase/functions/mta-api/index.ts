import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createObservabilityEvent, sanitizeObservabilityError, serializeObservabilityEvent } from "./observability.ts";

const allowedOrigin=(origin)=>origin&&(/^https:\/\/(?:[a-z0-9-]+-)?mta-deteni\.galleryabah\.workers\.dev$/i.test(origin)||origin==="https://mta-deteni.galleryabah.workers.dev")?origin:"null";
const cors=(req)=>({"Access-Control-Allow-Origin":allowedOrigin(req.headers.get("Origin")),"Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type, x-request-id, x-correlation-id, idempotency-key","Access-Control-Allow-Methods":"GET,POST,PATCH,DELETE,OPTIONS","Access-Control-Expose-Headers":"X-Request-Id, X-Correlation-Id","Vary":"Origin","Content-Type":"application/json","X-Content-Type-Options":"nosniff"});
const TABLES=new Set(["detainees","placements","movements","leaves","documents","blocks","rooms","audit","audit-event"]);
const WRITE_ROLES=new Set(["OWNER","ADMIN","EDITOR"]);
const requestStarts=new WeakMap();
const json=(req,body,status=200,context={})=>{const requestId=context.requestId||req.headers.get("X-Request-Id")||crypto.randomUUID();const correlationId=context.correlationId||req.headers.get("X-Correlation-Id")||requestId;const durationMs=requestStarts.has(req)?performance.now()-requestStarts.get(req):undefined;const event=(()=>{try{return serializeObservabilityEvent(createObservabilityEvent({level:status>=500?"ERROR":status>=400?"WARN":"INFO",service:"mta-api",event:status>=500?"request.failed":"request.completed",requestId,correlationId,method:req.method,route:new URL(req.url).pathname,status,durationMs,outcome:status>=500?"FAILED":status>=400?"DENIED":"SUCCESS",errorCode:body?.error}));}catch{return null;}})();if(event)console.log(event);return new Response(JSON.stringify(body),{status,headers:{...cors(req),"X-Request-Id":requestId,"X-Correlation-Id":correlationId}});};
const stableJson=(value)=>{if(value===null||typeof value!=="object")return JSON.stringify(value);if(Array.isArray(value))return "["+value.map(stableJson).join(",")+"]";return "{"+Object.keys(value).sort().map((k)=>JSON.stringify(k)+":"+stableJson(value[k])).join(",")+"}";};
const sha256Hex=async(value)=>{const bytes=new TextEncoder().encode(value),hash=await crypto.subtle.digest("SHA-256",bytes);return Array.from(new Uint8Array(hash)).map((b)=>b.toString(16).padStart(2,"0")).join("");};
const productionWritesEnabled=()=>Deno.env.get("MTA_PRODUCTION_WRITES_ENABLED")==="true";
const WRITE_METHODS=new Set(["POST","PATCH","DELETE"]);
const AUTHZ_POLICY_VERSION="AUTHZ-DB-RLS-v1";
const MUTATION_ROLE_POLICY={
  detainees:{POST:new Set(["OWNER","ADMIN","EDITOR"]),PATCH:new Set(["OWNER","ADMIN","EDITOR"]),DELETE:new Set(["OWNER","ADMIN"])},
  placements:{POST:new Set(["OWNER","ADMIN","EDITOR"]),PATCH:new Set(["OWNER","ADMIN","EDITOR"]),DELETE:new Set(["OWNER","ADMIN"])},
  movements:{POST:new Set(["OWNER","ADMIN","EDITOR"]),PATCH:new Set(["OWNER","ADMIN","EDITOR"]),DELETE:new Set(["OWNER","ADMIN"])},
  leaves:{POST:new Set(["OWNER","ADMIN","EDITOR"]),PATCH:new Set(["OWNER","ADMIN","EDITOR"]),DELETE:new Set(["OWNER","ADMIN"])},
  documents:{POST:new Set(["OWNER","ADMIN","EDITOR"]),PATCH:new Set(["OWNER","ADMIN","EDITOR"]),DELETE:new Set(["OWNER","ADMIN"])},
  blocks:{POST:new Set(["OWNER","ADMIN"]),PATCH:new Set(["OWNER","ADMIN"]),DELETE:new Set(["OWNER","ADMIN"])},
  rooms:{POST:new Set(["OWNER","ADMIN"]),PATCH:new Set(["OWNER","ADMIN"]),DELETE:new Set(["OWNER","ADMIN"])}
};
const SCOPED_MUTATION_RESOURCES=new Set(["detainees","placements","movements","leaves"]);
const denyAuthorization=(reasonCode)=>({allowed:false,reasonCode,policyVersion:AUTHZ_POLICY_VERSION});
const allowAuthorization=()=>({allowed:true,reasonCode:"ALLOW",policyVersion:AUTHZ_POLICY_VERSION});

const normalizeIdentityText=(value)=>String(value??'').normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const normalizeIdentityCompact=(value)=>normalizeIdentityText(value).replace(/\s+/g,"");
const normalizeIdentityPassport=(value)=>String(value??'').toUpperCase().replace(/[^A-Z0-9]/g,"");
const identityLevenshtein=(a,b)=>{const aa=String(a||''),bb=String(b||'');if(aa===bb)return 0;if(!aa)return bb.length;if(!bb)return aa.length;let prev=Array.from({length:bb.length+1},(_,i)=>i);for(let i=1;i<=aa.length;i++){const cur=[i];for(let j=1;j<=bb.length;j++)cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(aa[i-1]===bb[j-1]?0:1));prev=cur;}return prev[bb.length];};
const identityNearName=(a,b)=>{const aa=normalizeIdentityText(a),bb=normalizeIdentityText(b);if(!aa||!bb||aa===bb)return false;const minLength=Math.min(aa.length,bb.length);if(minLength<8)return false;return identityLevenshtein(aa,bb)<=Math.max(1,Math.floor(minLength*0.06));};
const resolveDetaineeIdentityCandidates=async({admin,scopeId,body})=>{
  const queryName=String(body?.name||'').trim();
  const queryDob=String(body?.metadata?.dateOfBirth??body?.date_of_birth??body?.dateOfBirth??'').trim();
  const queryPassport=String(body?.metadata?.passportNumber??body?.passport_number??body?.passportNumber??'').trim();
  const queryNationality=String(body?.nationality||'').trim();
  if(!queryName&&!queryDob&&!queryPassport&&!queryNationality)return{status:'NO_MATCH',candidates:[]};
  const rows=await admin.from("mta_detainees").select("id,nid,name,date_of_birth,passport_number,nationality,status,scope_id").eq("scope_id",scopeId).limit(5000);
  if(rows.error)throw new Error("IDENTITY_RESOLUTION_READ_FAILED");
  const qName=normalizeIdentityText(queryName),qDob=normalizeIdentityText(queryDob),qPassport=normalizeIdentityPassport(queryPassport),qNationality=normalizeIdentityCompact(queryNationality);
  const candidates=(rows.data||[]).map(d=>{
    const basis=[];const dName=normalizeIdentityText(d.name),dDob=normalizeIdentityText(d.date_of_birth),dPassport=normalizeIdentityPassport(d.passport_number),dNationality=normalizeIdentityCompact(d.nationality);
    if(qPassport&&dPassport&&qPassport===dPassport)basis.push("PASSPORT_EXACT");
    if(qDob&&dDob&&qDob===dDob)basis.push("DATE_OF_BIRTH_EXACT");
    if(qName&&dName&&qName===dName)basis.push("NAME_EXACT");else if(qName&&dName&&identityNearName(qName,dName))basis.push("NAME_NEAR");
    if(qNationality&&dNationality&&qNationality===dNationality)basis.push("NATIONALITY_EXACT");
    if(!basis.length)return null;
    const has=(x)=>basis.includes(x);let confidence=null;
    if(has("PASSPORT_EXACT")&&has("DATE_OF_BIRTH_EXACT"))confidence="STRONG";
    else if(has("PASSPORT_EXACT")&&has("NAME_EXACT")&&has("NATIONALITY_EXACT"))confidence="STRONG";
    else if(has("NAME_EXACT")&&has("DATE_OF_BIRTH_EXACT")&&has("NATIONALITY_EXACT"))confidence="PROBABLE";
    else if(has("NAME_EXACT")&&(has("DATE_OF_BIRTH_EXACT")||has("PASSPORT_EXACT")||has("NATIONALITY_EXACT")))confidence="POSSIBLE";
    else if(has("NAME_EXACT"))confidence="NAME_ONLY";
    else if(has("NAME_NEAR")&&(has("DATE_OF_BIRTH_EXACT")||has("PASSPORT_EXACT")||has("NATIONALITY_EXACT")))confidence="POSSIBLE";
    else if(has("NAME_NEAR"))confidence="NAME_ONLY";
    if(!confidence)return null;
    return {detaineeId:String(d.id||''),nid:String(d.nid||''),name:String(d.name||''),dateOfBirth:String(d.date_of_birth||''),passportNumber:String(d.passport_number||''),nationality:String(d.nationality||''),status:String(d.status||''),confidence,matchBasis:basis};
  }).filter(Boolean).sort((a,b)=>{const rank={STRONG:4,PROBABLE:3,POSSIBLE:2,NAME_ONLY:1};return (rank[b.confidence]-rank[a.confidence])||a.name.localeCompare(b.name,'id');});
  return {status:candidates.length?"CANDIDATES_FOUND":"NO_MATCH",candidates};
};

const authorizeGenericMutation=async({admin,userId,role,resource,method,id,body})=>{
  const methodRoles=MUTATION_ROLE_POLICY[resource]?.[method];
  if(!methodRoles) return denyAuthorization("RESOURCE_ACTION_DENIED");
  if(!methodRoles.has(role)) return denyAuthorization("PERMISSION_DENIED");
  if(!SCOPED_MUTATION_RESOURCES.has(resource)) return allowAuthorization();
  if(role==="OWNER"||role==="ADMIN") return allowAuthorization();

  const scoped=await admin.from("mta_profile_scopes").select("scope_id").eq("profile_id",userId).eq("active",true).limit(1).maybeSingle();
  if(scoped.error||!scoped.data?.scope_id) return denyAuthorization("SCOPE_DENIED");
  const scopeId=scoped.data.scope_id;

  let current=null;
  if(method!=="POST"){
    const currentColumns=resource==="detainees"?"detainee_id,scope_id":"detainee_id";
    const currentResult=await admin.from("mta_"+resource).select(currentColumns).eq("id",id).maybeSingle();
    if(currentResult.error||!currentResult.data) return denyAuthorization("RESOURCE_NOT_FOUND");
    current=currentResult.data;
  }
  const requestedDetaineeId=body?.detainee_id??body?.detaineeId??current?.detainee_id??null;
  if(resource==="detainees"){
    const requestedScopeId=body?.scope_id??current?.scope_id??null;
    if(requestedScopeId!==scopeId) return denyAuthorization("SCOPE_DENIED");
    return allowAuthorization();
  }
  if(!requestedDetaineeId) return denyAuthorization("SCOPE_REQUIRED");
  const detainee=await admin.from("mta_detainees").select("id,scope_id").eq("id",requestedDetaineeId).maybeSingle();
  if(detainee.error||!detainee.data) return denyAuthorization("RESOURCE_NOT_FOUND");
  if(detainee.data.scope_id!==scopeId) return denyAuthorization("SCOPE_DENIED");
  if(resource!=="detainees" && current?.detainee_id && current.detainee_id!==requestedDetaineeId){
    return denyAuthorization("RESOURCE_SCOPE_REBIND_DENIED");
  }
  return allowAuthorization();
};

Deno.serve(async(req)=>{
  const startedAt=performance.now();
  const requestId=req.headers.get("X-Request-Id")||crypto.randomUUID();
  const correlationId=req.headers.get("X-Correlation-Id")||requestId;
  const normalizedHeaders=new Headers(req.headers); normalizedHeaders.set("X-Request-Id",requestId); normalizedHeaders.set("X-Correlation-Id",correlationId);
  req=new Request(req,{headers:normalizedHeaders}); requestStarts.set(req,startedAt);
  const emit=(level,event,extra={})=>{try{console.log(serializeObservabilityEvent(createObservabilityEvent({level,service:"mta-api",event,requestId,correlationId,method:req.method,route:new URL(req.url).pathname,...extra})));}catch{}};
  emit("INFO","request.started");
  if(req.method==="OPTIONS") return new Response(null,{status:204,headers:{...cors(req),"X-Request-Id":requestId,"X-Correlation-Id":correlationId}});
  const authorization=req.headers.get("Authorization");
  if(!authorization?.startsWith("Bearer ")) { emit("WARN","request.denied",{status:401,outcome:"DENIED",errorCode:"AUTH_REQUIRED",durationMs:performance.now()-startedAt}); return json(req,{ok:false,error:"AUTH_REQUIRED"},401,{requestId,correlationId}); }
  const supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:authorization}}});
  const {data:{user},error:userError}=await supabase.auth.getUser();
  if(userError||!user) { emit("WARN","request.denied",{status:401,outcome:"DENIED",errorCode:"AUTH_INVALID",durationMs:performance.now()-startedAt}); return json(req,{ok:false,error:"AUTH_INVALID"},401,{requestId,correlationId}); }
  const {data:profile,error:profileError}=await supabase.from("mta_profiles").select("id,role,display_name,active,must_change_password,password_changed_at,password_reset_at").eq("id",user.id).single();
  if(profileError||!profile?.active) { emit("WARN","request.denied",{status:403,outcome:"DENIED",errorCode:"RBAC_PROFILE_MISSING_OR_INACTIVE",durationMs:performance.now()-startedAt}); return json(req,{ok:false,error:"RBAC_PROFILE_MISSING_OR_INACTIVE"},403,{requestId,correlationId}); }
  const role=String(profile.role||"").toUpperCase();
  const url=new URL(req.url);
  // Supabase Edge Functions receive the full /functions/v1/<function>/<route> path.
  // Normalize the route so deployed and direct/local invocation forms resolve
  // the resource after the mta-api function prefix.
  const parts=url.pathname.replace(/^\/+|\/+$/g,"").split("/").filter(Boolean);
  const functionIndex=parts.indexOf("mta-api");
  const routeParts=functionIndex>=0?parts.slice(functionIndex+1):parts;
  const resource=routeParts[0],id=routeParts[1];
  if(resource==="me"){
    if(req.method==="GET") return json(req,{ok:true,user:{id:user.id,email:user.email},profile,role});
    const adminKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if(!adminKey) return json(req,{ok:false,error:"SERVER_CONFIGURATION_ERROR"},503);
    const admin=createClient(Deno.env.get("SUPABASE_URL")!,adminKey,{auth:{autoRefreshToken:false,persistSession:false}});
    try{
      if(req.method==="PATCH"){
        const body=await req.json().catch(()=>null)||{};
        const displayName=String(body.display_name||"").trim();
        if(!displayName) return json(req,{ok:false,error:"PROFILE_DISPLAY_NAME_REQUIRED"},400);
        if(displayName.length>120) return json(req,{ok:false,error:"PROFILE_DISPLAY_NAME_TOO_LONG"},400);
        const updated=await admin.from("mta_profiles").update({display_name:displayName}).eq("id",user.id).select("id,role,display_name,active,must_change_password,password_changed_at,password_reset_at").single();
        if(updated.error) return json(req,{ok:false,error:"PROFILE_UPDATE_FAILED"},400);
        await admin.from("mta_audit_events").insert({action:"USER_PROFILE_UPDATE",resource_type:"USER",resource_id:user.id,result:"SUCCESS",actor_user_id:user.id,request_id:requestId,correlation_id:correlationId,metadata:{changedFields:["display_name"]}});
        return json(req,{ok:true,resource,data:updated.data});
      }
      if(req.method==="POST"){
        const body=await req.json().catch(()=>null)||{};
        const currentPassword=String(body.current_password||"");
        const newPassword=String(body.new_password||"");
        const confirmation=String(body.confirm_password||"");
        if(newPassword.length<12) return json(req,{ok:false,error:"PASSWORD_POLICY_INVALID"},400);
        if(newPassword!==confirmation) return json(req,{ok:false,error:"PASSWORD_CONFIRMATION_MISMATCH"},400);
        if(currentPassword===newPassword) return json(req,{ok:false,error:"PASSWORD_REUSE_FORBIDDEN"},400);
        if(!user.email) return json(req,{ok:false,error:"PASSWORD_EMAIL_UNAVAILABLE"},400);
        const verifier=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{auth:{autoRefreshToken:false,persistSession:false}});
        const verified=await verifier.auth.signInWithPassword({email:user.email,password:currentPassword});
        if(verified.error||!verified.data.user) return json(req,{ok:false,error:"CURRENT_PASSWORD_INVALID"},401);
        const changed=await admin.auth.admin.updateUserById(user.id,{password:newPassword});
        if(changed.error) return json(req,{ok:false,error:"PASSWORD_CHANGE_FAILED"},400);
        const now=new Date().toISOString();
        const updated=await admin.from("mta_profiles").update({must_change_password:false,password_changed_at:now}).eq("id",user.id).select("id,role,display_name,active,must_change_password,password_changed_at,password_reset_at").single();
        if(updated.error) return json(req,{ok:false,error:"PASSWORD_STATE_UPDATE_FAILED"},500);
        await supabase.auth.signOut({scope:"global"}).catch(()=>{});
        await admin.from("mta_audit_events").insert({action:"USER_PASSWORD_CHANGE",resource_type:"USER",resource_id:user.id,result:"SUCCESS",actor_user_id:user.id,request_id:requestId,correlation_id:correlationId,metadata:{forcedChange:!!profile.must_change_password}});
        return json(req,{ok:true,resource,data:{...updated.data,sessionRevoked:true}});
      }
      return json(req,{ok:false,error:"METHOD_NOT_ALLOWED"},405);
    }catch(e){
      emit("ERROR","identity.profile.failed",{status:500,outcome:"FAILED",errorCode:"IDENTITY_PROFILE_ERROR"});
      return json(req,{ok:false,error:"IDENTITY_PROFILE_ERROR"},500);
    }
  }

  if(profile.must_change_password) return json(req,{ok:false,error:"PASSWORD_CHANGE_REQUIRED",role},428);

  // Operational writes are fail-closed. The release gate is server-side and
  // cannot be bypassed by changing browser state or calling the Edge Function directly.
  // Password/profile self-service remains available through /me so operators can recover credentials.
  if(WRITE_METHODS.has(req.method) && resource!=="me" && !productionWritesEnabled()) {
    emit("WARN","mutation.locked",{status:423,outcome:"DENIED",errorCode:"PRODUCTION_WRITE_LOCKED"});
    return json(req,{ok:false,error:"PRODUCTION_WRITE_LOCKED",role},423,{requestId,correlationId});
  }

  if(resource==="admin-users"){
    if(!new Set(["OWNER","ADMIN"]).has(role)) return json(req,{ok:false,error:"RBAC_USER_ADMIN_DENIED"},403);
    const adminKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if(!adminKey) return json(req,{ok:false,error:"SERVER_CONFIGURATION_ERROR"},503);
    const admin=createClient(Deno.env.get("SUPABASE_URL")!,adminKey,{auth:{autoRefreshToken:false,persistSession:false}});
    try{
      if(req.method==="GET"){
        const {data:profiles,error:pe}=await admin.from("mta_profiles").select("id,nip,role,display_name,active,must_change_password,created_at,updated_at").order("created_at",{ascending:true});
        if(pe) return json(req,{ok:false,error:"ADMIN_USERS_READ_FAILED"},500);
        const listed=await admin.auth.admin.listUsers({page:1,perPage:1000});
        if(listed.error) return json(req,{ok:false,error:"ADMIN_AUTH_USERS_READ_FAILED"},500);
        const emails=new Map((listed.data.users||[]).map(u=>[u.id,u.email||null]));
        const visibleProfiles=role==="OWNER"?(profiles||[]):(profiles||[]).filter(p=>String(p.role||"VIEWER").toUpperCase()!=="OWNER");
        const data=visibleProfiles.map(p=>({...p,email:emails.get(p.id)||null}));
        return json(req,{ok:true,resource,data});
      }
      if(req.method==="POST"){
        const body=await req.json().catch(()=>null)||{};
        const nip=String(body.nip||"").trim();
        const password=String(body.password||"");
        const displayName=String(body.display_name||"").trim();
        const requestedRole=String(body.role||"VIEWER").toUpperCase();
        if(!/^\d{18}$/.test(nip)) return json(req,{ok:false,error:"USER_NIP_INVALID"},400);
        if(password.length<12) return json(req,{ok:false,error:"USER_PASSWORD_TOO_WEAK"},400);
        const existingNip=await admin.from("mta_profiles").select("id").eq("nip",nip).maybeSingle();
        if(existingNip.data?.id) return json(req,{ok:false,error:"USER_NIP_ALREADY_EXISTS"},409);
        const email=`${nip}@auth.mta-deteni.internal`;
        const allowedRoles=role==="OWNER"?new Set(["OWNER","ADMIN","EDITOR","REVIEWER","AUDITOR","VIEWER"]):new Set(["EDITOR","REVIEWER","AUDITOR","VIEWER"]);
        if(!allowedRoles.has(requestedRole)) return json(req,{ok:false,error:"USER_ROLE_NOT_ALLOWED"},403);
        const created=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:displayName}});
        if(created.error||!created.data.user) return json(req,{ok:false,error:"ADMIN_USER_CREATE_FAILED"},400);
        const uid=created.data.user.id;
        const prof=await admin.from("mta_profiles").upsert({id:uid,nip,role:requestedRole,display_name:displayName||nip,active:true,must_change_password:true},{onConflict:"id"}).select("id,nip,role,display_name,active,created_at,updated_at").single();
        if(prof.error){
          await admin.auth.admin.deleteUser(uid);
          return json(req,{ok:false,error:"ADMIN_PROFILE_CREATE_FAILED"},500);
        }
        await admin.from("mta_audit_events").insert({action:"USER_CREATE",resource_type:"USER",resource_id:uid,result:"SUCCESS",actor_user_id:user.id,request_id:requestId,correlation_id:correlationId,metadata:{role:requestedRole,email}});
        return json(req,{ok:true,resource,data:{...prof.data,email,temporaryCredentialIssued:true,must_change_password:true}});
      }
      if(req.method==="POST"&&id&&routeParts[2]==="password-reset"){
        if(!new Set(["OWNER","ADMIN"]).has(role)) return json(req,{ok:false,error:"RBAC_PASSWORD_RESET_DENIED"},403);
        const target=await admin.from("mta_profiles").select("id,nip,role,display_name,active").eq("id",id).single();
        if(target.error||!target.data) return json(req,{ok:false,error:"TARGET_USER_NOT_FOUND"},404);
        const targetRole=String(target.data.role||"VIEWER").toUpperCase();
        if(targetRole==="OWNER"&&role!=="OWNER") return json(req,{ok:false,error:"OWNER_PASSWORD_RESET_DENIED"},403);
        if(!target.data.active) return json(req,{ok:false,error:"TARGET_USER_INACTIVE"},409);
        const listed=await admin.auth.admin.getUserById(id);
        if(listed.error||!listed.data.user?.email) return json(req,{ok:false,error:"TARGET_AUTH_USER_NOT_FOUND"},404);
        const lower="abcdefghijkmnopqrstuvwxyz", upper="ABCDEFGHJKLMNPQRSTUVWXYZ", digits="23456789", symbols="!@#$%&*";
        const pick=(chars)=>chars[crypto.getRandomValues(new Uint32Array(1))[0]%chars.length];
        const pool=lower+upper+digits+symbols;
        const chars=[pick(lower),pick(upper),pick(digits),pick(symbols)];
        const random=new Uint32Array(20); crypto.getRandomValues(random);
        for(let i=chars.length;i<20;i++) chars.push(pool[random[i]%pool.length]);
        for(let i=chars.length-1;i>0;i--){const j=random[i%random.length]%(i+1);[chars[i],chars[j]]=[chars[j],chars[i]];}
        const temporaryPassword=chars.join("");
        const changed=await admin.auth.admin.updateUserById(id,{password:temporaryPassword});
        if(changed.error) return json(req,{ok:false,error:"PASSWORD_RESET_FAILED"},400);
        const now=new Date().toISOString();
        const updated=await admin.from("mta_profiles").update({must_change_password:true,password_reset_at:now,password_reset_by:user.id}).eq("id",id).select("id,role,display_name,active,must_change_password,password_changed_at,password_reset_at").single();
        if(updated.error){
          return json(req,{ok:false,error:"PASSWORD_RESET_STATE_UPDATE_FAILED"},500);
        }
        const audit=await admin.from("mta_audit_events").insert({action:"USER_PASSWORD_RESET",resource_type:"USER",resource_id:id,result:"SUCCESS",actor_user_id:user.id,request_id:requestId,correlation_id:correlationId,metadata:{targetRole,forcedChange:true}});
        if(audit.error) emit("WARN","identity.password_reset.audit_failed",{status:500,outcome:"FAILED",errorCode:"AUDIT_WRITE_FAILED"});
        return json(req,{ok:true,resource,data:{id,role:updated.data.role,display_name:updated.data.display_name,active:updated.data.active,must_change_password:true,temporaryPassword,sessionRevoked:true}});
      }
      if(req.method==="PATCH"&&id){
        const body=await req.json().catch(()=>null)||{};
        if(body.nip!==undefined && !/^\d{18}$/.test(String(body.nip||"").trim())) return json(req,{ok:false,error:"USER_NIP_INVALID"},400);
        if(body.nip!==undefined){
          const nextNip=String(body.nip||"").trim();
          const dup=await admin.from("mta_profiles").select("id").eq("nip",nextNip).neq("id",id).maybeSingle();
          if(dup.data?.id) return json(req,{ok:false,error:"USER_NIP_ALREADY_EXISTS"},409);
        }
        if(id===user.id && body.active===false) return json(req,{ok:false,error:"SELF_DISABLE_FORBIDDEN"},409);
        const target=await admin.from("mta_profiles").select("id,role,display_name,active").eq("id",id).single();
        if(target.error||!target.data) return json(req,{ok:false,error:"USER_NOT_FOUND"},404);
        const targetRole=String(target.data.role||"VIEWER").toUpperCase();
        if(targetRole==="OWNER" && role!=="OWNER") return json(req,{ok:false,error:"OWNER_USER_MANAGEMENT_DENIED"},403);
        const nextRole=body.role===undefined?targetRole:String(body.role).toUpperCase();
        const allowedRoles=role==="OWNER"?new Set(["OWNER","ADMIN","EDITOR","REVIEWER","AUDITOR","VIEWER"]):new Set(["EDITOR","REVIEWER","AUDITOR","VIEWER"]);
        if(!allowedRoles.has(targetRole)||!allowedRoles.has(nextRole)) return json(req,{ok:false,error:"USER_ROLE_NOT_ALLOWED"},403);
        if(role==="ADMIN"&&targetRole==="ADMIN") return json(req,{ok:false,error:"ADMIN_CANNOT_MANAGE_ADMIN"},403);
        if(id===user.id&&nextRole!==targetRole) return json(req,{ok:false,error:"SELF_ROLE_CHANGE_FORBIDDEN"},409);
        const patch={};
        if(body.nip!==undefined)patch.nip=String(body.nip||"").trim();
        if(body.role!==undefined)patch.role=nextRole;
        if(body.display_name!==undefined)patch.display_name=String(body.display_name||"").trim()||target.data.display_name;
        if(body.active!==undefined)patch.active=!!body.active;
        if(!Object.keys(patch).length)return json(req,{ok:false,error:"USER_UPDATE_EMPTY"},400);
        const updated=await admin.from("mta_profiles").update(patch).eq("id",id).select("id,nip,role,display_name,active,created_at,updated_at").single();
        if(updated.error)return json(req,{ok:false,error:"ADMIN_USER_UPDATE_FAILED"},400);
        if(patch.active===false)await admin.auth.admin.signOut(id,"global").catch(()=>{});
        await admin.from("mta_audit_events").insert({action:"USER_UPDATE",resource_type:"USER",resource_id:id,result:"SUCCESS",actor_user_id:user.id,request_id:requestId,correlation_id:correlationId,metadata:{changedFields:Object.keys(patch),role:nextRole,active:patch.active}});
        return json(req,{ok:true,resource,data:updated.data});
      }
      return json(req,{ok:false,error:"METHOD_NOT_ALLOWED"},405);
    }catch(e){
      emit("ERROR","admin.users.failed",{status:500,outcome:"FAILED",errorCode:"ADMIN_USERS_ERROR"});
      return json(req,{ok:false,error:"ADMIN_USERS_ERROR"},500);
    }
  }

  if(resource==="admin-config"){
    if(!new Set(["OWNER","ADMIN"]).has(role)) return json(req,{ok:false,error:"RBAC_ADMIN_CONFIG_DENIED",role},403);
    const adminKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); if(!adminKey) return json(req,{ok:false,error:"SERVER_CONFIGURATION_ERROR"},503);
    const admin=createClient(Deno.env.get("SUPABASE_URL")!,adminKey,{auth:{autoRefreshToken:false,persistSession:false}});
    try{
      const scoped=await admin.from("mta_profile_scopes").select("scope_id").eq("profile_id",user.id).eq("active",true).limit(1).maybeSingle();
      if(scoped.error||!scoped.data?.scope_id)return json(req,{ok:false,error:"SCOPE_REQUIRED"},409);
      const scopeId=scoped.data.scope_id;
      const current=await admin.from("mta_scopes").select("id,code,name,metadata").eq("id",scopeId).single();
      if(current.error||!current.data)return json(req,{ok:false,error:"SCOPE_NOT_FOUND"},404);
      if(req.method==="GET")return json(req,{ok:true,resource,role,data:{scopeId:current.data.id,code:current.data.code,name:current.data.name,settings:current.data.metadata?.adminSettings||{}}});
      if(req.method==="PATCH"){
        const body=await req.json().catch(()=>({}));
        const previous=current.data.metadata&&typeof current.data.metadata==="object"?current.data.metadata:{};
        const settings={...(previous.adminSettings||{}),...(body.settings&&typeof body.settings==="object"?body.settings:{})};
        const metadata={...previous,adminSettings:settings};
        const updated=await admin.from("mta_scopes").update({metadata,updated_at:new Date().toISOString()}).eq("id",scopeId).select("id,code,name,metadata").single();
        if(updated.error)return json(req,{ok:false,error:"ADMIN_CONFIG_UPDATE_FAILED"},400);
        await admin.from("mta_audit_events").insert({action:"ADMIN_CONFIG_UPDATE",resource_type:"ADMIN_CONFIG",resource_id:scopeId,result:"SUCCESS",actor_user_id:user.id,request_id:req.headers.get("X-Request-Id")||crypto.randomUUID(),correlation_id:req.headers.get("X-Correlation-Id")||crypto.randomUUID(),metadata:{keys:Object.keys(settings)}});
        return json(req,{ok:true,resource,role,data:{scopeId:updated.data.id,code:updated.data.code,name:updated.data.name,settings:updated.data.metadata?.adminSettings||{}}});
      }
      return json(req,{ok:false,error:"METHOD_NOT_ALLOWED"},405);
    }catch(e){return json(req,{ok:false,error:"ADMIN_CONFIG_ERROR"},500)}
  }

  if(resource==="ai-config"){
    if(!new Set(["OWNER","ADMIN"]).has(role)) return json(req,{ok:false,error:"RBAC_AI_ADMIN_DENIED",role},403);
    const adminKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); if(!adminKey) return json(req,{ok:false,error:"SERVER_CONFIGURATION_ERROR"},503);
    const admin=createClient(Deno.env.get("SUPABASE_URL")!,adminKey,{auth:{autoRefreshToken:false,persistSession:false}});
    try{
      const {data:cfg,error:readError}=await admin.from("mta_ai_config").select("id,enabled,provider,api_url,model,secret_name,key_configured,updated_by,updated_at").order("updated_at",{ascending:false}).limit(1).single();
      if(readError||!cfg) return json(req,{ok:false,error:"AI_CONFIG_READ_FAILED"},500);
      if(req.method==="GET") return json(req,{ok:true,resource,role,data:{...cfg,api_key_configured:!!cfg.key_configured}});
      if(req.method==="PATCH"){
        const body=await req.json().catch(()=>null)||{}, provider=["Gemini","OpenAI","Custom"].includes(String(body.provider||""))?String(body.provider):cfg.provider;
        const enabled=body.enabled===undefined?cfg.enabled:!!body.enabled, apiUrl=body.api_url===undefined?cfg.api_url:String(body.api_url||"").trim(), model=body.model===undefined?cfg.model:String(body.model||"").trim();
        if(enabled&&(!apiUrl||!model)) return json(req,{ok:false,error:"AI_CONFIG_INCOMPLETE"},400);
        let keyConfigured=!!cfg.key_configured, key=String(body.api_key||"").trim();
        if(key){const z=await admin.rpc("mta_set_ai_secret",{p_secret:key,p_name:cfg.secret_name});if(z.error)return json(req,{ok:false,error:"AI_SECRET_WRITE_FAILED"},500);keyConfigured=true;}
        else if(body.clear_api_key===true){const z=await admin.rpc("mta_clear_ai_secret",{p_name:cfg.secret_name});if(z.error)return json(req,{ok:false,error:"AI_SECRET_CLEAR_FAILED"},500);keyConfigured=false;}
        const {data,error}=await admin.from("mta_ai_config").update({enabled,provider,api_url:apiUrl,model,key_configured:keyConfigured,updated_by:user.id,updated_at:new Date().toISOString()}).eq("id",cfg.id).select("id,enabled,provider,api_url,model,secret_name,key_configured,updated_by,updated_at").single();
        if(error)return json(req,{ok:false,error:"AI_CONFIG_UPDATE_FAILED"},400);
        await admin.from("mta_audit_events").insert({action:"AI_SETTINGS_UPDATE",resource_type:"AI_CONFIGURATION",resource_id:data.id,result:"SUCCESS",actor_user_id:user.id,request_id:crypto.randomUUID(),correlation_id:crypto.randomUUID(),metadata:{provider,enabled,keyConfigured}});
        return json(req,{ok:true,resource,role,data:{...data,api_key_configured:keyConfigured}});
      }
      return json(req,{ok:false,error:"METHOD_NOT_ALLOWED"},405);
    }catch(e){return json(req,{ok:false,error:"AI_CONFIG_ERROR"},500);}
  }

  if(resource==="ai-health"&&req.method==="POST"){
    if(!new Set(["OWNER","ADMIN"]).has(role))return json(req,{ok:false,error:"RBAC_AI_ADMIN_DENIED",role},403);
    const adminKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");if(!adminKey)return json(req,{ok:false,error:"SERVER_CONFIGURATION_ERROR"},503);
    const admin=createClient(Deno.env.get("SUPABASE_URL")!,adminKey,{auth:{autoRefreshToken:false,persistSession:false}});
    try{
      const {data:cfg,error:ce}=await admin.from("mta_ai_config").select("*").order("updated_at",{ascending:false}).limit(1).single();
      if(ce||!cfg)return json(req,{ok:false,error:"AI_CONFIG_READ_FAILED"},500);
      if(!cfg.enabled)return json(req,{ok:true,resource,data:{ok:true,status:"DISABLED",message:"AI runtime disabled."}});
      const {data:key,error:ke}=await admin.rpc("mta_get_ai_secret",{p_name:cfg.secret_name});if(ke||!key)return json(req,{ok:false,error:"AI_NOT_CONFIGURED"},409);
      const provider=String(cfg.provider||"").toLowerCase(),model=String(cfg.model||"").trim(),c=new AbortController(),timer=setTimeout(()=>c.abort(),15000);let response;
      try{
        if(provider==="gemini"){const base=(cfg.api_url||"https://generativelanguage.googleapis.com/v1beta").replace(/\/$/,"");response=await fetch(base+"/models/"+encodeURIComponent(model)+":generateContent?key="+encodeURIComponent(key),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:"Reply only: OK"}]}],generationConfig:{maxOutputTokens:8}}),signal:c.signal});}
        else{const base=(cfg.api_url||"https://api.openai.com/v1").replace(/\/$/,""),endpoint=base.endsWith("/chat/completions")?base:base+"/chat/completions";response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model,messages:[{role:"user",content:"Reply only: OK"}],max_tokens:8}),signal:c.signal});}
        const ok=response.ok;await admin.from("mta_audit_events").insert({action:"AI_HEALTH_CHECK",resource_type:"AI_CONFIGURATION",resource_id:cfg.id,result:ok?"SUCCESS":"FAILED",actor_user_id:user.id,request_id:crypto.randomUUID(),correlation_id:crypto.randomUUID(),metadata:{provider:cfg.provider,model,httpStatus:response.status}});
        return json(req,{ok,resource,error:ok?undefined:"PROVIDER_ERROR",data:{ok,status:ok?"PASS":"PROVIDER_ERROR",httpStatus:response.status,message:ok?"AI provider connection OK.":"AI provider rejected the test request.",provider:cfg.provider,model}});
      }finally{clearTimeout(timer)}
    }catch(e){return json(req,{ok:false,error:"AI_HEALTH_CHECK_FAILED"},500);}
  }
  if(resource==="ai-job" && req.method==="POST"){
    if(!new Set(["OWNER","ADMIN","EDITOR"]).has(role)) return json(req,{ok:false,error:"RBAC_AI_JOB_DENIED",role},403);
    const adminKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); if(!adminKey) return json(req,{ok:false,error:"SERVER_CONFIGURATION_ERROR"},503);
    const admin=createClient(Deno.env.get("SUPABASE_URL")!,adminKey,{auth:{autoRefreshToken:false,persistSession:false}});
    let jobId=null;
    try{
      const body=await req.json().catch(()=>null)||{};
      const jobType=String(body.job_type||"SYNTHETIC_TEST");
      const inputRef=String(body.input_ref||"F5-AI-SYNTHETIC-TEST");
      const {data:cfg,error:ce}=await admin.from("mta_ai_config").select("*").order("updated_at",{ascending:false}).limit(1).single();
      if(ce||!cfg) return json(req,{ok:false,error:"AI_CONFIG_READ_FAILED"},500);
      const created=await admin.from("mta_ai_jobs").insert({job_type:jobType,status:"QUEUED",provider:cfg.provider,model:cfg.model,input_ref:inputRef}).select("id,job_type,status,provider,model,input_ref,created_at").single();
      if(created.error) return json(req,{ok:false,error:"AI_JOB_CREATE_FAILED"},500);
      jobId=created.data.id;
      if(!cfg.enabled){await admin.from("mta_ai_jobs").update({status:"FAILED",error_code:"AI_DISABLED",completed_at:new Date().toISOString()}).eq("id",jobId);return json(req,{ok:false,error:"AI_DISABLED",data:{job:created.data,message:"AI runtime disabled."}},409)}
      const {data:key,error:ke}=await admin.rpc("mta_get_ai_secret",{p_name:cfg.secret_name});
      if(ke||!key){await admin.from("mta_ai_jobs").update({status:"FAILED",error_code:"AI_NOT_CONFIGURED",completed_at:new Date().toISOString()}).eq("id",jobId);return json(req,{ok:false,error:"AI_NOT_CONFIGURED",data:{job:created.data}},409)}
      await admin.from("mta_ai_jobs").update({status:"RUNNING"}).eq("id",jobId);
      const provider=String(cfg.provider||"").toLowerCase(),model=String(cfg.model||"").trim(),prompt="Synthetic MTA DETENI AI integration test. Return JSON only with fields: status, job_type, input_ref, summary. status must be PASS.";
      const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),20000);let response;
      try{
        if(provider==="gemini"){const base=(cfg.api_url||"https://generativelanguage.googleapis.com/v1beta").replace(/\/$/,"");response=await fetch(base+"/models/"+encodeURIComponent(model)+":generateContent?key="+encodeURIComponent(key),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0,maxOutputTokens:128,responseMimeType:"application/json"}}),signal:ac.signal});}
        else{const base=(cfg.api_url||"https://api.openai.com/v1").replace(/\/$/,""),endpoint=base.endsWith("/chat/completions")?base:base+"/chat/completions";response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model,messages:[{role:"user",content:prompt}],temperature:0,max_tokens:128,response_format:{type:"json_object"}}),signal:ac.signal});}
        const raw=await response.text();
        if(!response.ok){await admin.from("mta_ai_jobs").update({status:"FAILED",error_code:"PROVIDER_ERROR",output:{httpStatus:response.status},completed_at:new Date().toISOString()}).eq("id",jobId);await admin.from("mta_audit_events").insert({action:"AI_JOB_EXECUTE",resource_type:"AI_JOB",resource_id:jobId,result:"FAILED",actor_user_id:user.id,request_id:crypto.randomUUID(),correlation_id:crypto.randomUUID(),metadata:{jobType,provider:cfg.provider,model,httpStatus:response.status}});return json(req,{ok:false,error:"PROVIDER_ERROR",data:{jobId,status:"FAILED",httpStatus:response.status}},502)}
        let output={rawPreview:raw.slice(0,1000)};
        try{const parsed=JSON.parse(raw);const textOut=parsed?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("")||parsed?.choices?.[0]?.message?.content||"";output=textOut?{provider:cfg.provider,model,text:textOut,parsed:JSON.parse(textOut)}:{provider:cfg.provider,model,rawPreview:raw.slice(0,1000)};}catch{}
        const done=await admin.from("mta_ai_jobs").update({status:"COMPLETED",output,completed_at:new Date().toISOString()}).eq("id",jobId).select("id,job_type,status,provider,model,input_ref,output,created_at,completed_at").single();
        await admin.from("mta_audit_events").insert({action:"AI_JOB_EXECUTE",resource_type:"AI_JOB",resource_id:jobId,result:"SUCCESS",actor_user_id:user.id,request_id:crypto.randomUUID(),correlation_id:crypto.randomUUID(),metadata:{jobType,provider:cfg.provider,model}});
        return json(req,{ok:true,resource,data:{job:done.data,message:"AI synthetic job PASS"}});
      }finally{clearTimeout(timer)}
    }catch(e){if(jobId)await admin.from("mta_ai_jobs").update({status:"FAILED",error_code:"AI_JOB_EXECUTION_FAILED",completed_at:new Date().toISOString()}).eq("id",jobId);return json(req,{ok:false,error:"AI_JOB_EXECUTION_FAILED"},500)}
  }

  if(resource==="admin-register" && req.method==="POST"){
    if(!new Set(["OWNER","ADMIN"]).has(role)) return json(req,{ok:false,error:"RBAC_REGISTER_DENIED",role},403);
    const body=await req.json().catch(()=>null);
    const email=String(body?.email||"").trim().toLowerCase();
    const password=String(body?.password||"");
    const displayName=String(body?.full_name||"").trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(req,{ok:false,error:"INVALID_EMAIL"},400);
    if(password.length<12||password.length>128) return json(req,{ok:false,error:"PASSWORD_POLICY_MIN_12"},400);
    if(displayName.length<2||displayName.length>120) return json(req,{ok:false,error:"INVALID_DISPLAY_NAME"},400);
    const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if(!serviceKey) return json(req,{ok:false,error:"ADMIN_REGISTRATION_NOT_CONFIGURED"},503);
    const admin=createClient(Deno.env.get("SUPABASE_URL")!,serviceKey,{auth:{autoRefreshToken:false,persistSession:false}});
    const created=await admin.auth.admin.createUser({email,password,email_confirm:false,user_metadata:{full_name:displayName,created_by:user.id}});
    if(created.error) return json(req,{ok:false,error:"ADMIN_REGISTRATION_FAILED"},400);
    return json(req,{ok:true,created:true,user:{id:created.data.user?.id,email:created.data.user?.email},createdBy:user.id},201);
  }
  
  if(resource==="backup"&&req.method==="GET"){
    if(!new Set(["OWNER","ADMIN"]).has(role))return json(req,{ok:false,error:"RBAC_BACKUP_READ_DENIED",role},403);
    const adminKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");if(!adminKey)return json(req,{ok:false,error:"SERVER_CONFIGURATION_ERROR"},503);
    const admin=createClient(Deno.env.get("SUPABASE_URL")!,adminKey,{auth:{autoRefreshToken:false,persistSession:false}});
    try{
      const names=["detainees","blocks","rooms","movements","placements","leaves","documents","audit"];
      const loaded=await Promise.all(names.map(async name=>{
        const table=name==="audit"?"mta_audit_events":"mta_"+name;
        const {data,error}=await admin.from(table).select("*");
        if(error)throw new Error("BACKUP_"+name.toUpperCase()+"_READ_FAILED");
        return [name,data||[]];
      }));
      const payload=Object.fromEntries(loaded);
      const scopeInfo=await admin.from("mta_scopes").select("id").limit(1000);
      if(scopeInfo.error)return json(req,{ok:false,error:"BACKUP_SCOPE_READ_FAILED"},500);
      const createdAt=new Date().toISOString();
      const backupId="BKP-"+crypto.randomUUID().replaceAll("-","").slice(0,20).toUpperCase();
      const payloadFingerprint=await sha256Hex(stableJson(payload));
      const manifest={schemaVersion:1,backupId,sourceRuntime:"MTA_API",createdAt,payloadFingerprint,syntheticOnly:false,scopeCount:(scopeInfo.data||[]).length};
      return json(req,{ok:true,resource,data:{manifest,payload}});
    }catch(e){
      emit("ERROR","backup.create.failed",{status:500,outcome:"FAILED",errorCode:"BACKUP_CREATE_FAILED"});
      return json(req,{ok:false,error:"BACKUP_CREATE_FAILED"},500);
    }
  }
  if(resource==="backup-restore"&&req.method==="POST"){
    if(role!=="OWNER")return json(req,{ok:false,error:"RBAC_BACKUP_RESTORE_DENIED",role},403);
    const adminKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");if(!adminKey)return json(req,{ok:false,error:"SERVER_CONFIGURATION_ERROR"},503);
    const admin=createClient(Deno.env.get("SUPABASE_URL")!,adminKey,{auth:{autoRefreshToken:false,persistSession:false}});
    try{
      const body=await req.json().catch(()=>null);
      const manifest=body?.manifest,payload=body?.payload;
      if(!manifest||manifest.schemaVersion!==1||!payload||typeof payload!=="object")return json(req,{ok:false,error:"BACKUP_INVALID"},400);
      if(Number(manifest.scopeCount||0)!==1)return json(req,{ok:false,error:"BACKUP_RESTORE_MULTI_SCOPE_UNSUPPORTED"},409);
      const scopeInfo=await admin.from("mta_scopes").select("id").limit(1000);
      if(scopeInfo.error)return json(req,{ok:false,error:"BACKUP_SCOPE_READ_FAILED"},500);
      if((scopeInfo.data||[]).length!==1)return json(req,{ok:false,error:"BACKUP_RESTORE_MULTI_SCOPE_UNSUPPORTED"},409);
      const roots=["detainees","blocks","rooms","movements","placements","leaves","documents","audit"];
      if(!roots.every(k=>Array.isArray(payload[k])))return json(req,{ok:false,error:"BACKUP_ROOT_INVALID"},400);
      const fingerprint=await sha256Hex(stableJson(payload));
      if(String(manifest.payloadFingerprint||"")!==fingerprint)return json(req,{ok:false,error:"BACKUP_FINGERPRINT_MISMATCH"},409);
      const requestHash=await sha256Hex(stableJson({manifest,payload}));
      const {data,error}=await admin.rpc("mta_restore_backup_transaction",{
        p_backup_id:String(manifest.backupId||""),
        p_request_hash:requestHash,
        p_payload:payload,
        p_actor_user_id:user.id,
        p_request_id:requestId,
        p_correlation_id:correlationId
      });
      if(error){
        const message=String(error.message||"");
        if(message.includes("BACKUP_RESTORE_NOT_READY"))return json(req,{ok:false,error:"BACKUP_RESTORE_NOT_PROVISIONED"},503);
        if(message.includes("BACKUP_RESTORE_"))return json(req,{ok:false,error:"BACKUP_RESTORE_REJECTED"},400);
        return json(req,{ok:false,error:"BACKUP_RESTORE_FAILED"},500);
      }
      await admin.from("mta_audit_events").insert({action:"BACKUP_RESTORE",resource_type:"BACKUP",resource_id:String(manifest.backupId||""),result:"SUCCESS",actor_user_id:user.id,request_id:requestId,correlation_id:correlationId,metadata:{payloadFingerprint:fingerprint}});
      return json(req,{ok:true,resource,data,replayed:!!data?.replayed});
    }catch(e){
      emit("ERROR","backup.restore.failed",{status:500,outcome:"FAILED",errorCode:"BACKUP_RESTORE_FAILED"});
      return json(req,{ok:false,error:"BACKUP_RESTORE_FAILED"},500);
    }
  }
  if(!TABLES.has(resource)) return json(req,{ok:false,error:"RESOURCE_NOT_FOUND"},404);
  // Audit events are server-generated inside canonical mutation boundaries.
  // There is deliberately no client-facing audit write endpoint.
  if(resource==="audit-event") return json(req,{ok:false,error:"AUDIT_WRITE_DISABLED"},405);

  if(resource==="audit" && req.method!=="GET") return json(req,{ok:false,error:"AUDIT_READ_ONLY"},405);
  if(["POST","PATCH","DELETE"].includes(req.method)&&!WRITE_ROLES.has(role)) return json(req,{ok:false,error:"RBAC_WRITE_DENIED",role},403);
  const table=resource==="audit"?"mta_audit_events":"mta_"+resource;
  try{
    if(req.method==="GET"){
      let query=supabase.from(table).select("*");
      if(id) query=query.eq("id",id).single();
      const {data,error}=await query;
      if(error) return json(req,{ok:false,error:"DB_READ_FAILED"},400);
      return json(req,{ok:true,resource,role,data});
    }

    const adminKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if(!adminKey) return json(req,{ok:false,error:"SERVER_CONFIGURATION_ERROR"},503);
    const admin=createClient(Deno.env.get("SUPABASE_URL")!,adminKey,{auth:{autoRefreshToken:false,persistSession:false}});
    const requestId=req.headers.get("X-Request-Id")||crypto.randomUUID();
    const correlationId=req.headers.get("X-Correlation-Id")||requestId;
    const idempotencyKey=String(req.headers.get("Idempotency-Key")||"").trim();
    if(WRITE_METHODS.has(req.method) && !idempotencyKey) return json(req,{ok:false,error:"IDEMPOTENCY_KEY_REQUIRED"},400,{requestId,correlationId});
    let body=req.method==="DELETE"?{}:await req.json().catch(()=>({}));
    let identityDecisionForAudit="";
    let canonicalScopeId=null;
    if(["blocks","rooms","detainees"].includes(resource)){
      const scoped=await admin.from("mta_profile_scopes").select("scope_id").eq("profile_id",user.id).eq("active",true).limit(1).maybeSingle();
      if(scoped.error||!scoped.data?.scope_id)return json(req,{ok:false,error:"SCOPE_REQUIRED"},409);
      canonicalScopeId=scoped.data.scope_id;
    }
    if(resource==="detainees" && req.method==="POST"){
      const identityResolution=await resolveDetaineeIdentityCandidates({admin,scopeId:canonicalScopeId,body});
      const identityDecision=String(body?.identity_decision||"").trim();
      identityDecisionForAudit=identityDecision;
      if(identityResolution.status==="CANDIDATES_FOUND" && identityDecision!=="NOT_SAME_PERSON"){
        emit("WARN","identity.create.denied",{status:409,outcome:"DENIED",errorCode:"IDENTITY_REVIEW_REQUIRED",resource,identityCandidateCount:identityResolution.candidates.length});
        return json(req,{ok:false,error:"IDENTITY_REVIEW_REQUIRED",identityResolution,requestId,correlationId},409,{requestId,correlationId});
      }
      delete body.identity_decision;
    }
    if(resource==="detainees"){
      if(Object.prototype.hasOwnProperty.call(body,"nid")){
        return json(req,{ok:false,error:req.method==="POST"?"NID_SYSTEM_GENERATED":"NID_IMMUTABLE"},400,{requestId,correlationId});
      }
      if(req.method==="POST"){
        const entryYear=Number(body?.entry_year??body?.entryYear);
        if(!Number.isInteger(entryYear)||entryYear<2000||entryYear>2099){
          return json(req,{ok:false,error:"ENTRY_YEAR_REQUIRED"},400,{requestId,correlationId});
        }
        delete body.entryYear;
        body={...body,entry_year:entryYear,scope_id:canonicalScopeId};
      }else if(id){
        if(Object.prototype.hasOwnProperty.call(body,"entry_year")||Object.prototype.hasOwnProperty.call(body,"entryYear")){
          return json(req,{ok:false,error:"ENTRY_YEAR_IMMUTABLE"},400,{requestId,correlationId});
        }
        const current=await admin.from("mta_detainees").select("scope_id").eq("id",id).single();
        if(current.error||!current.data)return json(req,{ok:false,error:"DETAINEE_NOT_FOUND"},404);
        if(current.data.scope_id!==canonicalScopeId)return json(req,{ok:false,error:"WRONG_SCOPE"},403);
      }
    }
    if(resource==="blocks"){
      if(req.method==="POST"){
        body={...body,scope_id:canonicalScopeId};
      }else if(id){
        const current=await admin.from("mta_blocks").select("scope_id").eq("id",id).single();
        if(current.error||!current.data)return json(req,{ok:false,error:"BLOCK_NOT_FOUND"},404);
        if(current.data.scope_id!==canonicalScopeId)return json(req,{ok:false,error:"WRONG_SCOPE"},403);
      }
    }
    if(resource==="rooms"){
      if(req.method==="POST"){
        const blockId=String(body.block_id||"");
        if(!blockId)return json(req,{ok:false,error:"ROOM_BLOCK_REQUIRED"},400);
        const block=await admin.from("mta_blocks").select("scope_id").eq("id",blockId).single();
        if(block.error||!block.data?.scope_id)return json(req,{ok:false,error:"BLOCK_NOT_FOUND"},404);
        if(block.data.scope_id!==canonicalScopeId)return json(req,{ok:false,error:"WRONG_SCOPE"},403);
        body={...body,scope_id:canonicalScopeId};
      }else if(id){
        const current=await admin.from("mta_rooms").select("scope_id").eq("id",id).single();
        if(current.error||!current.data)return json(req,{ok:false,error:"ROOM_NOT_FOUND"},404);
        if(current.data.scope_id!==canonicalScopeId)return json(req,{ok:false,error:"WRONG_SCOPE"},403);
      }
    }
    if(req.method==="POST" && resource==="movements" && body?.command==="MOVE_DETAINEE"){
      const requestHash=await sha256Hex(stableJson({method:req.method,resource,body}));
      const {data,error}=await admin.rpc("mta_execute_movement_transaction",{
        p_idempotency_key:idempotencyKey,
        p_request_hash:requestHash,
        p_detainee_id:body.detaineeId,
        p_target_room_id:body.targetRoomId,
        p_actor_user_id:user.id,
        p_request_id:requestId,
        p_correlation_id:correlationId,
        p_movement_type:body.movementType||"TRANSFER",
        p_purpose:body.purpose||null,
        p_occurred_at:body.occurredAt||new Date().toISOString()
      });
      if(error){
        const message=String(error.message||"");
        const map=[
          ["P11_IDEMPOTENCY_CONFLICT","IDEMPOTENCY_CONFLICT",409],
          ["P11_DETAINEE_NOT_FOUND","DETAINEE_NOT_FOUND",404],
          ["P11_ROOM_NOT_FOUND","ROOM_NOT_FOUND",404],
          ["P11_DETAINEE_NOT_ACTIVE","DETAINEE_NOT_ACTIVE",409],
          ["P11_ROOM_NOT_ACTIVE","ROOM_NOT_ACTIVE",409],
          ["P11_ROOM_SCOPE_MISMATCH","ROOM_SCOPE_MISMATCH",403],
          ["P11_DETAINEE_SCOPE_DENIED","DETAINEE_SCOPE_DENIED",403],
          ["P11_SAME_ROOM","SAME_ROOM",409],
          ["P11_ROOM_CAPACITY_EXCEEDED","ROOM_CAPACITY_EXCEEDED",409],
          ["P11_RBAC_WRITE_DENIED","RBAC_WRITE_DENIED",403]
        ];
        const hit=map.find(([needle])=>message.includes(needle));
        if(hit) return json(req,{ok:false,error:hit[1],command:"MOVE_DETAINEE",requestId,correlationId},hit[2]);
        return json(req,{ok:false,error:"TRANSACTIONAL_MOVEMENT_REJECTED",command:"MOVE_DETAINEE",requestId,correlationId},400);
      }
      return json(req,{ok:true,resource,role,command:"MOVE_DETAINEE",data,replayed:!!data?.replayed},data?.replayed?200:201);
    }
    const authorizationDecision=await authorizeGenericMutation({admin,userId:user.id,role,resource,method:req.method,id,body});
    if(!authorizationDecision.allowed){
      emit("WARN","authorization.denied",{status:403,outcome:"DENIED",errorCode:authorizationDecision.reasonCode,policyVersion:authorizationDecision.policyVersion,resource});
      return json(req,{ok:false,error:authorizationDecision.reasonCode,policyVersion:authorizationDecision.policyVersion},403,{requestId,correlationId});
    }
    const operation=req.method==="POST"?"INSERT":req.method==="PATCH"?"UPDATE":"DELETE";
    const requestHash=await sha256Hex(stableJson({method:req.method,resource,id:id||null,body}));
    const resourceType={detainees:"DETAINEE",placements:"PLACEMENT",movements:"MOVEMENT",leaves:"LEAVE",documents:"DOCUMENT",blocks:"BLOCK",rooms:"ROOM",audit:"AUDIT"}[resource];
    const action=resourceType+"_"+operation;
    const {data,error}=await admin.rpc("mta_execute_idempotent_mutation",{
      p_idempotency_key:idempotencyKey,
      p_request_hash:requestHash,
      p_operation:operation,
      p_table:table,
      p_payload:body,
      p_where:req.method==="POST"?{}:{id},
      p_audit:{
        action,
        resourceType,
        resourceId:id||null,
        result:"SUCCESS",
        actorUserId:user.id,
        requestId,
        correlationId,
        metadata:{role,resource,operation,idempotencyKey,...(resource==="detainees"&&req.method==="POST"?{identityDecision:identityDecisionForAudit}: {})}
      }
    });
    if(error){
      const message=String(error.message||"");
      if(message.includes("P9_7_IDEMPOTENCY_CONFLICT")) return json(req,{ok:false,error:"IDEMPOTENCY_CONFLICT"},409);
      if(message.includes("P9_7_TARGET_NOT_FOUND")) return json(req,{ok:false,error:"DB_TARGET_NOT_FOUND"},404);
      if(message.includes("P9_7_")) return json(req,{ok:false,error:"P9_7_MUTATION_REJECTED"},400);
      return json(req,{ok:false,error:"DB_MUTATION_FAILED"},400);
    }
    if(req.method==="POST") return json(req,{ok:true,resource,role,data:data?.row,row:data?.row,replayed:!!data?.replayed},data?.replayed?200:201);
    if(req.method==="PATCH") return json(req,{ok:true,resource,role,data:data?.row,replayed:!!data?.replayed});
    return json(req,{ok:true,resource,role,deleted:{id:data?.row?.id},replayed:!!data?.replayed});
  }catch(error){const safe=sanitizeObservabilityError(error);emit("ERROR","request.error",{status:500,outcome:"FAILED",errorCode:"UNHANDLED_API_ERROR",durationMs:performance.now()-startedAt});console.error(JSON.stringify({service:"mta-api",event:"request.error",requestId,correlationId,error:safe}));return json(req,{ok:false,error:"UNHANDLED_API_ERROR"},500,{requestId,correlationId});}
});
