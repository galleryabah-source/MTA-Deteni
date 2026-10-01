import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigin=(origin)=>{
  if(!origin)return "*";
  return /^https:\/\/(?:[a-z0-9-]+-)?mta-deteni\.galleryabah\.workers\.dev$/i.test(origin)||origin==="https://mta-deteni.galleryabah.workers.dev"?origin:"null";
};
const cors=(req)=>({
  "Access-Control-Allow-Origin":allowedOrigin(req.headers.get("Origin")),
  "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type, x-request-id, x-correlation-id",
  "Access-Control-Allow-Methods":"POST,OPTIONS",
  "Vary":"Origin",
  "Content-Type":"application/json",
  "X-Content-Type-Options":"nosniff"
});
const json=(req,body,status=200)=>new Response(JSON.stringify(body),{status,headers:cors(req)});

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(req)});
  if(req.method!=="POST")return json(req,{ok:false,error:"METHOD_NOT_ALLOWED"},405);
  const body=await req.json().catch(()=>null)||{};
  const nip=String(body.nip||"").trim();
  const password=String(body.password||"");
  // Never log the NIP or password. Return one generic authentication error
  // for invalid format, missing account, inactive account, or bad password.
  if(!/^\d{18}$/.test(nip)||!password)return json(req,{ok:false,error:"INVALID_LOGIN"},401);

  const serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl=Deno.env.get("SUPABASE_URL");
  const anonKey=Deno.env.get("SUPABASE_ANON_KEY");
  if(!serviceKey||!supabaseUrl||!anonKey)return json(req,{ok:false,error:"SERVER_CONFIGURATION_ERROR"},503);

  const admin=createClient(supabaseUrl,serviceKey,{auth:{autoRefreshToken:false,persistSession:false}});
  const verifier=createClient(supabaseUrl,anonKey,{auth:{autoRefreshToken:false,persistSession:false}});
  try{
    const profile=await admin.from("mta_profiles").select("id,active").eq("nip",nip).maybeSingle();
    if(profile.error||!profile.data?.id||profile.data.active!==true)return json(req,{ok:false,error:"INVALID_LOGIN"},401);
    const target=await admin.auth.admin.getUserById(profile.data.id);
    const email=target.data.user?.email;
    if(target.error||!email)return json(req,{ok:false,error:"INVALID_LOGIN"},401);
    const result=await verifier.auth.signInWithPassword({email,password});
    if(result.error||!result.data.session)return json(req,{ok:false,error:"INVALID_LOGIN"},401);
    return json(req,{ok:true,data:{session:result.data.session,user:result.data.user}});
  }catch{
    return json(req,{ok:false,error:"INVALID_LOGIN"},401);
  }
});
