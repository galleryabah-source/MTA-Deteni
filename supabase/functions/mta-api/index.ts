import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createObservabilityEvent, sanitizeObservabilityError, serializeObservabilityEvent } from "./observability.ts";

const allowedOrigin=(origin)=>origin&&(/^https:\/\/(?:[a-z0-9-]+-)?mta-deteni\.galleryabah\.workers\.dev$/i.test(origin)||origin==="https://mta-deteni.galleryabah.workers.dev")?origin:"null";
const cors=(req)=>({"Access-Control-Allow-Origin":allowedOrigin(req.headers.get("Origin")),"Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type, x-request-id, x-correlation-id, idempotency-key","Access-Control-Allow-Methods":"GET,POST,PATCH,DELETE,OPTIONS","Access-Control-Expose-Headers":"X-Request-Id, X-Correlation-Id","Vary":"Origin","Content-Type":"application/json","X-Content-Type-Options":"nosniff"});
const TABLES=new Set(["detainees","placements","movements","leaves","documents","blocks","rooms","audit"]);
const WRITE_ROLES=new Set(["OWNER","ADMIN","EDITOR"]);
const requestStarts=new WeakMap();
const json=(req,body,status=200,context={})=>{const requestId=context.requestId||req.headers.get("X-Request-Id")||crypto.randomUUID();const correlationId=context.correlationId||req.headers.get("X-Correlation-Id")||requestId;const durationMs=requestStarts.has(req)?performance.now()-requestStarts.get(req):undefined;const event=(()=>{try{return serializeObservabilityEvent(createObservabilityEvent({level:status>=500?"ERROR":status>=400?"WARN":"INFO",service:"mta-api",event:status>=500?"request.failed":"request.completed",requestId,correlationId,method:req.method,route:new URL(req.url).pathname,status,durationMs,outcome:status>=500?"FAILED":status>=400?"DENIED":"SUCCESS",errorCode:body?.error}));}catch{return null;}})();if(event)console.log(event);return new Response(JSON.stringify(body),{status,headers:{...cors(req),"X-Request-Id":requestId,"X-Correlation-Id":correlationId}});};
const stableJson=(value)=>{if(value===null||typeof value!=="object")return JSON.stringify(value);if(Array.isArray(value))return "["+value.map(stableJson).join(",")+"]";return "{"+Object.keys(value).sort().map((k)=>JSON.stringify(k)+":"+stableJson(value[k])).join(",")+"}";};
const sha256Hex=async(value)=>{const bytes=new TextEncoder().encode(value),hash=await crypto.subtle.digest("SHA-256",bytes);return Array.from(new Uint8Array(hash)).map((b)=>b.toString(16).padStart(2,"0")).join("");};

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


  if(resource==="admin-users"){
    if(!new Set(["OWNER","ADMIN"]).has(role)) return json(req,{ok:false,error:"RBAC_USER_ADMIN_DENIED"},403);
    const adminKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if(!adminKey) return json(req,{ok:false,error:"SERVER_CONFIGURATION_ERROR"},503);
    const admin=createClient(Deno.env.get("SUPABASE_URL")!,adminKey,{auth:{autoRefreshToken:false,persistSession:false}});
    try{
      if(req.method==="GET"){
        const {data:profiles,error:pe}=await admin.from("mta_profiles").select("id,role,display_name,active,must_change_password,created_at,updated_at").order("created_at",{ascending:true});
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
        const email=String(body.email||"").trim().toLowerCase();
        const password=String(body.password||"");
        const displayName=String(body.display_name||"").trim();
        const requestedRole=String(body.role||"VIEWER").toUpperCase();
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(req,{ok:false,error:"USER_EMAIL_INVALID"},400);
        if(password.length<12) return json(req,{ok:false,error:"USER_PASSWORD_TOO_WEAK"},400);
        const allowedRoles=role==="OWNER"?new Set(["OWNER","ADMIN","EDITOR","REVIEWER","AUDITOR","VIEWER"]):new Set(["EDITOR","REVIEWER","AUDITOR","VIEWER"]);
        if(!allowedRoles.has(requestedRole)) return json(req,{ok:false,error:"USER_ROLE_NOT_ALLOWED"},403);
        const created=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:displayName}});
        if(created.error||!created.data.user) return json(req,{ok:false,error:"ADMIN_USER_CREATE_FAILED"},400);
        const uid=created.data.user.id;
        const prof=await admin.from("mta_profiles").upsert({id:uid,role:requestedRole,display_name:displayName||email,active:true,must_change_password:true},{onConflict:"id"}).select("id,role,display_name,active,created_at,updated_at").single();
        if(prof.error){
          await admin.auth.admin.deleteUser(uid);
          return json(req,{ok:false,error:"ADMIN_PROFILE_CREATE_FAILED"},500);
        }
        await admin.from("mta_audit_events").insert({action:"USER_CREATE",resource_type:"USER",resource_id:uid,result:"SUCCESS",actor_user_id:user.id,request_id:requestId,correlation_id:correlationId,metadata:{role:requestedRole,email}});
        return json(req,{ok:true,resource,data:{...prof.data,email,temporaryCredentialIssued:true,must_change_password:true}});
      }
      if(req.method==="POST"&&id&&routeParts[2]==="password-reset"){
        if(!new Set(["OWNER","ADMIN"]).has(role)) return json(req,{ok:false,error:"RBAC_PASSWORD_RESET_DENIED"},403);
        const target=await admin.from("mta_profiles").select("id,role,display_name,active").eq("id",id).single();
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
        if(body.role!==undefined)patch.role=nextRole;
        if(body.display_name!==undefined)patch.display_name=String(body.display_name||"").trim()||target.data.display_name;
        if(body.active!==undefined)patch.active=!!body.active;
        if(!Object.keys(patch).length)return json(req,{ok:false,error:"USER_UPDATE_EMPTY"},400);
        const updated=await admin.from("mta_profiles").update(patch).eq("id",id).select("id,role,display_name,active,created_at,updated_at").single();
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
  
  if(!TABLES.has(resource)) return json(req,{ok:false,error:"RESOURCE_NOT_FOUND"},404);
  if(resource==="audit-event" && req.method==="POST"){
    if(!WRITE_ROLES.has(role))return json(req,{ok:false,error:"RBAC_WRITE_DENIED",role},403);
    const body=await req.json().catch(()=>({}));
    const requestId=req.headers.get("X-Request-Id")||crypto.randomUUID(),correlationId=req.headers.get("X-Correlation-Id")||crypto.randomUUID();
    const adminKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");if(!adminKey)return json(req,{ok:false,error:"SERVER_CONFIGURATION_ERROR"},503);
    const admin=createClient(Deno.env.get("SUPABASE_URL")!,adminKey,{auth:{autoRefreshToken:false,persistSession:false}});
    const inserted=await admin.from("mta_audit_events").insert({action:String(body.action||"RUNTIME_EVENT"),resource_type:String(body.resource_type||"RUNTIME"),resource_id:body.resource_id?String(body.resource_id):null,result:String(body.result||"SUCCESS"),actor_user_id:user.id,request_id:requestId,correlation_id:correlationId,metadata:body.metadata&&typeof body.metadata==="object"?body.metadata:{}}).select("*").single();
    if(inserted.error)return json(req,{ok:false,error:"AUDIT_WRITE_FAILED"},400);
    return json(req,{ok:true,resource,data:inserted.data});
  }

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
    const idempotencyKey=req.headers.get("Idempotency-Key")||crypto.randomUUID();
    let body=req.method==="DELETE"?{}:await req.json().catch(()=>({}));
    if(req.method==="POST"&&resource==="blocks"&&!body.scope_id){
      const scoped=await admin.from("mta_profile_scopes").select("scope_id").eq("profile_id",user.id).eq("active",true).limit(1).maybeSingle();
      if(scoped.error||!scoped.data?.scope_id)return json(req,{ok:false,error:"SCOPE_REQUIRED"},409);
      body={...body,scope_id:scoped.data.scope_id};
    }
    if(req.method==="POST"&&resource==="rooms"&&!body.scope_id){
      const blockId=String(body.block_id||"");
      if(!blockId)return json(req,{ok:false,error:"ROOM_BLOCK_REQUIRED"},400);
      const block=await admin.from("mta_blocks").select("scope_id").eq("id",blockId).single();
      if(block.error||!block.data?.scope_id)return json(req,{ok:false,error:"BLOCK_NOT_FOUND"},404);
      body={...body,scope_id:block.data.scope_id};
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
        metadata:{role,resource,operation,idempotencyKey}
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
