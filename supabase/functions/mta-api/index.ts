import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigin=(origin)=>origin&&(/^https:\/\/(?:[a-z0-9-]+-)?mta-deteni\.galleryabah\.workers\.dev$/i.test(origin)||origin==="https://mta-deteni.galleryabah.workers.dev")?origin:"null";
const cors=(req)=>({"Access-Control-Allow-Origin":allowedOrigin(req.headers.get("Origin")),"Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"GET,POST,PATCH,DELETE,OPTIONS","Vary":"Origin","Content-Type":"application/json","X-Content-Type-Options":"nosniff"});
const TABLES=new Set(["detainees","placements","movements","leaves","documents"]);
const WRITE_ROLES=new Set(["OWNER","ADMIN","EDITOR"]);
const json=(req,body,status=200)=>new Response(JSON.stringify(body),{status,headers:cors(req)});

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS") return new Response(null,{status:204,headers:cors(req)});
  const authorization=req.headers.get("Authorization");
  if(!authorization?.startsWith("Bearer ")) return json(req,{ok:false,error:"AUTH_REQUIRED"},401);
  const supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:authorization}}});
  const {data:{user},error:userError}=await supabase.auth.getUser();
  if(userError||!user) return json(req,{ok:false,error:"AUTH_INVALID"},401);
  const {data:profile,error:profileError}=await supabase.from("mta_profiles").select("id,role,display_name,active").eq("id",user.id).single();
  if(profileError||!profile?.active) return json(req,{ok:false,error:"RBAC_PROFILE_MISSING_OR_INACTIVE"},403);
  const role=String(profile.role||"").toUpperCase();
  const url=new URL(req.url);
  const parts=url.pathname.replace(/^\/+/,"").split("/").filter(Boolean);
  const resource=parts[0],id=parts[1];
  if(resource==="me" && req.method==="GET") return json(req,{ok:true,user:{id:user.id,email:user.email},profile,role});

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
  if(["POST","PATCH","DELETE"].includes(req.method)&&!WRITE_ROLES.has(role)) return json(req,{ok:false,error:"RBAC_WRITE_DENIED",role},403);
  const table="mta_"+resource;
  try{
    if(req.method==="GET"){
      let query=supabase.from(table).select("*");
      if(id) query=query.eq("id",id).single();
      const {data,error}=await query;
      if(error) return json(req,{ok:false,error:"DB_READ_FAILED"},400);
      return json(req,{ok:true,resource,role,data});
    }
    if(req.method==="POST"){
      const body=await req.json();
      const {data,error}=await supabase.from(table).insert(body).select("*").single();
      if(error) return json(req,{ok:false,error:"DB_INSERT_FAILED"},400);
      return json(req,{ok:true,resource,role,data},201);
    }
    if(!id) return json(req,{ok:false,error:"ID_REQUIRED"},400);
    if(req.method==="PATCH"){
      const body=await req.json();
      const {data,error}=await supabase.from(table).update(body).eq("id",id).select("*").single();
      if(error) return json(req,{ok:false,error:"DB_UPDATE_FAILED"},400);
      return json(req,{ok:true,resource,role,data});
    }
    if(req.method==="DELETE"){
      const {data,error}=await supabase.from(table).delete().eq("id",id).select("id").single();
      if(error) return json(req,{ok:false,error:"DB_DELETE_FAILED"},400);
      return json(req,{ok:true,resource,role,deleted:data});
    }
    return json(req,{ok:false,error:"METHOD_NOT_ALLOWED"},405);
  }catch(error){console.error("MTA_API_UNHANDLED_ERROR",error);return json(req,{ok:false,error:"UNHANDLED_API_ERROR"},500);}
});
