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
    const init=()=>({method,headers:{'Content-Type':'application/json',...(accessToken?{Authorization:'Bearer '+accessToken}:{})},body:body===undefined?undefined:JSON.stringify(body)});
    let response=await fetch(path,init());
    if(response.status===401&&global.mtaAuth?.refreshSession){
      try{
        const refreshed=await global.mtaAuth.refreshSession();
        if(refreshed?.access_token){accessToken=refreshed.access_token;response=await fetch(path,init());}
      }catch{}
    }
    const data=await response.json().catch(()=>({ok:false,error:'INVALID_JSON'}));
    if(!response.ok) throw Object.assign(new Error(data.error||'API_ERROR'),{status:response.status,data});
    return data;
  }
  global.mtaProductionApi=Object.freeze({
    config:CONFIG,setAccessToken,
    list:(resource)=>request(resource),
    get:(resource,id)=>request(resource,{id}),
    create:(resource,body)=>request(resource,{method:'POST',body}),
    post:(resource,id,body)=>request(resource,{method:'POST',id,body}),
    update:(resource,id,body)=>request(resource,{method:'PATCH',id,body}),
    remove:(resource,id)=>request(resource,{method:'DELETE',id})
  });
})(window);
