import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.1';

const supabase=createClient(
  'https://tmmhxqgzelgrsrxbbfzh.supabase.co',
  'sb_publishable_EZD9g_MMeXKiEzKJOqH_oQ_0gIEk9ur',
  {
    auth:{
      persistSession:true,
      autoRefreshToken:true,
      detectSessionInUrl:true,
      storageKey:'mta-deteni-auth-session',
      storage:window.localStorage
    }
  }
);

let authHydrationResolved=false;
let pendingAuthSession=null;
let authHydrationPromise=null;
let authRefreshPromise=null;

async function syncSession(session, resolved=true){
  const token=session?.access_token||null;
  const authenticated=!!session;
  window.mtaProductionApi?.setAccessToken(token);
  window.__mtaAuthState=Object.freeze({resolved:!!resolved,authenticated,user:session?.user||null});
  window.dispatchEvent(new CustomEvent('mta-auth-state',{detail:{resolved:!!resolved,authenticated,user:session?.user||null}}));
}

const getSessionWithTimeout=async()=>{
  let timer;
  try{
    return await Promise.race([
      supabase.auth.getSession(),
      new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('AUTH_SESSION_TIMEOUT')),8000)})
    ]);
  }finally{
    clearTimeout(timer);
  }
};

const hydrateAuthSession=async()=>{
  if(authHydrationPromise)return authHydrationPromise;
  authHydrationPromise=(async()=>{
    // INITIAL_SESSION can arrive before the persisted storage adapter has
    // completed hydration. Never treat that transient null as a logout.
    // A hard refresh is allowed a longer hydration window because the
    // browser may restore storage and the auth client may need one refresh
    // round before getSession() exposes the persisted session.
    for(let attempt=0;attempt<8;attempt++){
      try{
        const result=await getSessionWithTimeout();
        const session=result?.data?.session||pendingAuthSession||null;
        if(session){
          authHydrationResolved=true;
          pendingAuthSession=null;
          await syncSession(session,true);
          return session;
        }
        if(attempt<7) await new Promise(r=>setTimeout(r,500));
      }catch(err){
        if(attempt<7) await new Promise(r=>setTimeout(r,500));
        else{
          authHydrationResolved=false;
          throw err;
        }
      }
    }
    authHydrationResolved=true;
    pendingAuthSession=null;
    await syncSession(null,true);
    return null;
  })();
  return authHydrationPromise;
};

supabase.auth.onAuthStateChange((event,session)=>{
  if(!authHydrationResolved){
    // Keep INITIAL_SESSION/null entirely inside the hydration boundary.
    // Only a real session is retained as a candidate for the final state.
    if(session)pendingAuthSession=session;
    return;
  }
  void syncSession(session,true);
});

const refreshSession=async()=>{
  if(authRefreshPromise)return authRefreshPromise;
  authRefreshPromise=(async()=>{
    const result=await supabase.auth.refreshSession();
    if(result?.error)throw result.error;
    const session=result?.data?.session||null;
    if(session){
      authHydrationResolved=true;
      pendingAuthSession=null;
      await syncSession(session,true);
      return session;
    }
    return null;
  })().finally(()=>{authRefreshPromise=null});
  return authRefreshPromise;
};

window.mtaAuth=Object.freeze({
  client:supabase,
  async signIn(nip,password){
    const normalized=String(nip||'').trim();
    if(!/^\d{18}$/.test(normalized))return {data:{session:null,user:null},error:{message:'NIP harus tepat 18 digit',code:'NIP_INVALID'}};
    const response=await fetch('/api/mta-login',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({nip:normalized,password})
    });
    const data=await response.json().catch(()=>({ok:false,error:'INVALID_LOGIN'}));
    if(!response.ok||!data?.ok||!data?.data?.session){
      return {data:{session:null,user:null},error:{message:data?.error||'INVALID_LOGIN',code:data?.error||'INVALID_LOGIN'}};
    }
    const sessionResult=await supabase.auth.setSession({
      access_token:data.data.session.access_token,
      refresh_token:data.data.session.refresh_token
    });
    return {data:sessionResult.data,error:sessionResult.error};
  },
  async signUp(){throw new Error("SELF_REGISTRATION_DISABLED")},
  async signOut(){return supabase.auth.signOut()},
  async session(){return supabase.auth.getSession()},
  async refreshSession(){return refreshSession()},
  async user(){const r=await supabase.auth.getUser();return r.data.user||null}
});

void hydrateAuthSession().catch(err=>{
  // A provider/network timeout is not an explicit logout. Keep the shell
  // locked until the browser receives a definitive auth state.
  console.warn('[MTA] auth session hydration deferred',err);
  authHydrationResolved=false;
  window.__mtaAuthState=Object.freeze({resolved:false,authenticated:false,user:null});
  window.dispatchEvent(new CustomEvent('mta-auth-state',{detail:{resolved:false,authenticated:false,user:null}}));
});