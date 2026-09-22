import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase=createClient(
  'https://tmmhxqgzelgrsrxbbfzh.supabase.co',
  'sb_publishable_EZD9g_MMeXKiEzKJOqH_oQ_0gIEk9ur'
);

async function syncSession(session){
  const token=session?.access_token||null;
  window.mtaProductionApi?.setAccessToken(token);
  window.dispatchEvent(new CustomEvent('mta-auth-state',{detail:{authenticated:!!session,user:session?.user||null}}));
}
supabase.auth.onAuthStateChange((_event,session)=>syncSession(session));
const initial=await supabase.auth.getSession();
await syncSession(initial.data.session);

window.mtaAuth=Object.freeze({
  client:supabase,
  async signIn(email,password){return supabase.auth.signInWithPassword({email,password})},
  async adminRegister(payload){const r=await window.mtaProductionApi.create("admin-register",payload);return {data:r,error:null}},
  async signOut(){return supabase.auth.signOut()},
  async session(){return supabase.auth.getSession()},
  async user(){const r=await supabase.auth.getUser();return r.data.user||null}
});
