(function(global){
  'use strict';
  const CONFIG=Object.freeze({
    supabaseUrl:'https://tmmhxqgzelgrsrxbbfzh.supabase.co',
    supabasePublishableKey:'sb_publishable_EZD9g_MMeXKiEzKJOqH_oQ_0gIEk9ur',
    apiBase:'/api/mta'
  });
  let accessToken=null;
  function setAccessToken(token){accessToken=token||null}
  async function request(resource,{method='GET',id,body}={}){
    const path=CONFIG.apiBase+'/'+encodeURIComponent(resource)+(id?'/'+encodeURIComponent(id):'');
    const response=await fetch(path,{method,headers:{'Content-Type':'application/json',...(accessToken?{Authorization:'Bearer '+accessToken}:{})},body:body===undefined?undefined:JSON.stringify(body)});
    const data=await response.json().catch(()=>({ok:false,error:'INVALID_JSON'}));
    if(!response.ok) throw Object.assign(new Error(data.error||'API_ERROR'),{status:response.status,data});
    return data;
  }
  global.mtaProductionApi=Object.freeze({
    config:CONFIG,setAccessToken,
    list:(resource)=>request(resource),
    get:(resource,id)=>request(resource,{id}),
    create:(resource,body)=>request(resource,{method:'POST',body}),
    update:(resource,id,body)=>request(resource,{method:'PATCH',id,body}),
    remove:(resource,id)=>request(resource,{method:'DELETE',id})
  });
})(window);
