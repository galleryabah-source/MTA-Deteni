const SECURITY_HEADERS={
  "X-Frame-Options":"DENY",
  "X-Content-Type-Options":"nosniff",
  "Referrer-Policy":"strict-origin-when-cross-origin",
  "Permissions-Policy":"camera=(self), microphone=(), geolocation=()",
  "Cross-Origin-Resource-Policy":"same-origin",
  "Content-Security-Policy-Report-Only":"default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' https://esm.sh https://cdn.jsdelivr.net; connect-src 'self' https://tmmhxqgzelgrsrxbbfzh.supabase.co; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; media-src 'self' blob:;",
  "X-Robots-Tag":"noindex, nofollow"
};
function secureResponse(response){const headers=new Headers(response.headers);for(const [k,v] of Object.entries(SECURITY_HEADERS))headers.set(k,v);return new Response(response.body,{status:response.status,statusText:response.statusText,headers});}
function apiRequest(request,url){const headers=new Headers();const auth=request.headers.get("Authorization");const contentType=request.headers.get("Content-Type");if(auth?.startsWith("Bearer "))headers.set("Authorization",auth);if(contentType)headers.set("Content-Type",contentType);headers.set("Accept","application/json");return new Request(url.toString(),{method:request.method,headers,body:["GET","HEAD"].includes(request.method)?undefined:request.body});}
export default {async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname.startsWith("/api/mta/")){
    if(request.method==="OPTIONS"){
      const origin=request.headers.get("Origin")||url.origin;
      const allow=origin===url.origin||/^https:\/\/(?:[a-z0-9-]+-)?mta-deteni\.galleryabah\.workers\.dev$/i.test(origin);
      if(!allow)return secureResponse(Response.json({ok:false,error:"CORS_ORIGIN_DENIED"},{status:403,headers:{"Vary":"Origin"}}));
      return secureResponse(new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"Authorization, Content-Type, Accept","Access-Control-Allow-Methods":"GET,POST,PATCH,DELETE,OPTIONS","Vary":"Origin"}}));
    }
    const auth=request.headers.get("Authorization");
    if(!auth?.startsWith("Bearer "))return secureResponse(Response.json({ok:false,error:"AUTH_REQUIRED"},{status:401}));
    const upstream=new URL("https://tmmhxqgzelgrsrxbbfzh.supabase.co/functions/v1/mta-api");
    upstream.pathname+="/"+url.pathname.slice("/api/mta/".length);upstream.search=url.search;
    return secureResponse(await fetch(apiRequest(request,upstream)));
  }
  if(url.pathname==="/api/health")return secureResponse(Response.json({ok:true,app:"MTA DETENI",runtime:"cloudflare-static-adapter",preview:"operational-v17",dataMode:"SYNTHETIC_ONLY",database:"SUPABASE_PRODUCTION_SCHEMA_READY_RLS_DENY_DEFAULT",storage:"PRIVATE_BUCKET_READY",ai:"OFF",migrationFreeze:true,productionAccessAuthorized:false,livePostgresqlExecution:false,realDetaineeDataAllowed:false,externalTransportAllowed:false,durablePublicationAllowed:false,authGate:"LOGIN_REQUIRED",registrationPolicy:"OWNER_ADMIN_ONLY"}));
  if(url.pathname==="/api/runtime")return secureResponse(Response.json({mode:"SYNTHETIC_RUNTIME_DIAGNOSTIC",persistence:"BROWSER_LOCAL_STORAGE+INDEXED_DB_QUEUE",authorization:"AUTHENTICATED_RBAC_REQUIRED",registration:"OWNER_ADMIN_ONLY",productionDatabase:"SCHEMA_READY_RLS_DENY_DEFAULT",productionStorage:"PRIVATE_BUCKET_READY",ai:"OFF",audit:"SYNTHETIC_EVENT_LEDGER",migrationFreeze:true,productionAccessAuthorized:false,livePostgresqlExecution:false,previewVersion:"v17"}));
  const response=await env.ASSETS.fetch(request);const contentType=response.headers.get("content-type")||"";
  if(request.method==="GET"&&contentType.includes("text/html")){const transformed=new HTMLRewriter().on("body",{element(element){element.append('<script src="/offline-v1.js?v=2"></script><script src="/offline-queue-v1.js?v=1"></script><script src="/qr-camera-v2.js?v=4"></script><script src="/qr-context-v1.js?v=1"></script><script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"></script><script src="/preview-v5.js?v=11"></script><script src="/preview-v6.js?v=8"></script><script src="/qr-print-clean-v3.js?v=4"></script><script src="/room-ops-v9.js?v=9"></script><script src="/movement-v9.js?v=9"></script><script src="/admin-settings-v9.js?v=9"></script><script src="/master-room-guard-v10.js?v=10"></script><script src="/preview-v10.js?v=10"></script><script src="/desktop-shell-v2.js?v=2"></script><script src="/mobile-shell-v1.js?v=2"></script>',{html:true});}}).transform(response);return secureResponse(transformed);}
  return secureResponse(response);
}};
