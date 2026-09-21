import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"GET,POST,PATCH,DELETE,OPTIONS","Content-Type":"application/json"};
const TABLES=new Set(["detainees","placements","movements","leaves","documents"]);
const WRITE_ROLES=new Set(["OWNER","ADMIN","EDITOR"]);
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS") return new Response(null,{status:204,headers:cors});
  const authorization=req.headers.get("Authorization");
  if(!authorization?.startsWith("Bearer ")) return json({ok:false,error:"AUTH_REQUIRED"},401);
  const supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:authorization}}});
  const {data:{user},error:userError}=await supabase.auth.getUser();
  if(userError||!user) return json({ok:false,error:"AUTH_INVALID"},401);
  const {data:profile,error:profileError}=await supabase.from("mta_profiles").select("id,role,display_name,active").eq("id",user.id).single();
  if(profileError||!profile?.active) return json({ok:false,error:"RBAC_PROFILE_MISSING_OR_INACTIVE"},403);
  const role=profile.role;
  const url=new URL(req.url);
  const parts=url.pathname.replace(/^\/+/,"").split("/").filter(Boolean);
  const resource=parts[0],id=parts[1];
  if(resource==="me" && req.method==="GET") return json({ok:true,user:{id:user.id,email:user.email},profile,role});
  if(!TABLES.has(resource)) return json({ok:false,error:"RESOURCE_NOT_FOUND"},404);
  if(["POST","PATCH","DELETE"].includes(req.method)&&!WRITE_ROLES.has(role)) return json({ok:false,error:"RBAC_WRITE_DENIED",role},403);
  const table="mta_"+resource;
  try{
    if(req.method==="GET"){
      let query=supabase.from(table).select("*");
      if(id) query=query.eq("id",id).single();
      const {data,error}=await query;
      if(error) return json({ok:false,error:"DB_READ_FAILED",detail:error.message},400);
      return json({ok:true,resource,role,data});
    }
    if(req.method==="POST"){
      const body=await req.json();
      const {data,error}=await supabase.from(table).insert(body).select("*").single();
      if(error) return json({ok:false,error:"DB_INSERT_FAILED",detail:error.message},400);
      return json({ok:true,resource,role,data},201);
    }
    if(!id) return json({ok:false,error:"ID_REQUIRED"},400);
    if(req.method==="PATCH"){
      const body=await req.json();
      const {data,error}=await supabase.from(table).update(body).eq("id",id).select("*").single();
      if(error) return json({ok:false,error:"DB_UPDATE_FAILED",detail:error.message},400);
      return json({ok:true,resource,role,data});
    }
    if(req.method==="DELETE"){
      const {data,error}=await supabase.from(table).delete().eq("id",id).select("id").single();
      if(error) return json({ok:false,error:"DB_DELETE_FAILED",detail:error.message},400);
      return json({ok:true,resource,role,deleted:data});
    }
    return json({ok:false,error:"METHOD_NOT_ALLOWED"},405);
  }catch(error){return json({ok:false,error:"UNHANDLED_API_ERROR",detail:String(error)},500);}
});
