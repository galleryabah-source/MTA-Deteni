import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase=createClient(
  'https://tmmhxqgzelgrsrxbbfzh.supabase.co',
  'sb_publishable_EZD9g_MMeXKiEzKJOqH_oQ_0gIEk9ur'
);

async function syncSession(session){
  const token=session?.access_token||null;
  const authenticated=!!session;
  window.mtaProductionApi?.setAccessToken(token);
  window.__mtaAuthState=Object.freeze({resolved:true,authenticated,user:session?.user||null});
  window.dispatchEvent(new CustomEvent('mta-auth-state',{detail:{authenticated,user:session?.user||null}}));
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

supabase.auth.onAuthStateChange((_event,session)=>{void syncSession(session)});

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
    await syncSession(initial.data.session);
  }catch(_){
    await syncSession(null);
  }
})();