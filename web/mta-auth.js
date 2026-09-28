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

window.mtaAuth=Object.freeze({
  client:supabase,
  async signIn(email,password){return supabase.auth.signInWithPassword({email,password})},
  async signUp(){throw new Error("SELF_REGISTRATION_DISABLED")},
  async signOut(){return supabase.auth.signOut()},
  async session(){return supabase.auth.getSession()},
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