(function(global){
  'use strict';
  const CONFIG=Object.freeze({
    supabaseUrl:'https://tmmhxqgzelgrsrxbbfzh.supabase.co',
    supabasePublishableKey:'sb_publishable_EZD9g_MMeXKiEzKJOqH_oQ_0gIEk9ur',
    apiBase:'/api/mta'
  });
  let accessToken=null;
  function setAccessToken(token){accessToken=token||null}
  async function stableHash(value){
    const bytes=new TextEncoder().encode(JSON.stringify(value));
    const hash=await crypto.subtle.digest('SHA-256',bytes);
    return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  async function request(resource,{method='GET',id,body,idempotencyKey}={}){
    const path=CONFIG.apiBase+'/'+encodeURIComponent(resource)+(id?'/'+encodeURIComponent(id):'');
    const headers={'Content-Type':'application/json'};
    if(accessToken)headers.Authorization='Bearer '+accessToken;
    if(['POST','PATCH','DELETE'].includes(method)){
      const key=idempotencyKey||body?.requestKey||await stableHash({method,resource,id:id||null,body:body||{}});
      headers['Idempotency-Key']=String(key).slice(0,240);
      headers['X-Request-Id']=crypto.randomUUID();
      headers['X-Correlation-Id']=crypto.randomUUID();
    }
    const response=await fetch(path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
    const data=await response.json().catch(()=>({ok:false,error:'INVALID_JSON'}));
    if(!response.ok)throw Object.assign(new Error(data.error||'API_ERROR'),{status:response.status,data});
    return data;
  }
  global.mtaProductionApi=Object.freeze({
    config:CONFIG,setAccessToken,
    list:(resource)=>request(resource),
    get:(resource,id)=>request(resource,{id}),
    create:(resource,body,options={})=>request(resource,{method:'POST',body,idempotencyKey:options.idempotencyKey}),
    update:(resource,id,body,options={})=>request(resource,{method:'PATCH',id,body,idempotencyKey:options.idempotencyKey}),
    remove:(resource,id,options={})=>request(resource,{method:'DELETE',id,idempotencyKey:options.idempotencyKey})
  });
})(window);