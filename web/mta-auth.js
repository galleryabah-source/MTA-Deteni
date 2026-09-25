import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase=createClient(
  'https://tmmhxqgzelgrsrxbbfzh.supabase.co',
  'sb_publishable_EZD9g_MMeXKiEzKJOqH_oQ_0gIEk9ur',
  {
    auth:{
      persistSession:true,
      autoRefreshToken:true,
      detectSessionInUrl:true,
      storageKey:'mta-deteni-auth-session'
    }
  }
);

let authHydrationResolved=false;
let pendingAuthSession=null;

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

supabase.auth.onAuthStateChange((event,session)=>{
  // During a hard refresh Supabase may emit INITIAL_SESSION with null before
  // its persisted session has finished hydrating. Never translate that
  // transient state into a logout. getSession() is the authoritative
  // hydration boundary; subsequent events are authoritative after it resolves.
  if(!authHydrationResolved){
    pendingAuthSession=session||null;
    return;
  }
  void syncSession(session, true);
});

window.mtaAuth=Object.freeze({
  client:supabase,
  async signIn(email,password){return supabase.auth.signInWithPassword({email,password})},
  async signUp(){throw new Error("SELF_REGISTRATION_DISABLED")},
  async signOut(){return supabase.auth.signOut()},
  async session(){return supabase.auth.getSession()},
  async user(){const r=await supabase.auth.getUser();return r.data.user||null}
});

void (async()=>{
  try{
    const initial=await getSessionWithTimeout();
    authHydrationResolved=true;
    // Prefer the persisted session returned by getSession(). A transient
    // INITIAL_SESSION callback must never override it with null.
    await syncSession(initial.data.session, true);
    pendingAuthSession=null;
  }catch(err){
    // A timeout/network error is not evidence of an explicit logout.
    // Keep the auth boundary unresolved rather than forcing the login gate.
    console.warn('[MTA] auth session hydration deferred',err);
    authHydrationResolved=true;
    if(pendingAuthSession){
      await syncSession(pendingAuthSession, true);
      pendingAuthSession=null;
    }else{
      window.__mtaAuthState=Object.freeze({resolved:false,authenticated:false,user:null});
      window.dispatchEvent(new CustomEvent('mta-auth-state',{detail:{resolved:false,authenticated:false,user:null}}));
    }
  }
})();