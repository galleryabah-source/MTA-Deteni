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
