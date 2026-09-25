(()=>{ 
  'use strict';

  const GATE_ID='mtaAuthGate';

  const css=()=>{
    if(document.getElementById('mtaAuthGateCss')) return;
    const s=document.createElement('style');
    s.id='mtaAuthGateCss';
    s.textContent=`
      body.mta-auth-locked .app{display:none!important}body.mta-auth-ready #mtaAuthGate{display:none!important}
      #mtaAuthGate{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#eef4ff 0%,#f7f9fc 48%,#eaf0f7 100%);font-family:"Segoe UI",system-ui,-apple-system,BlinkMacSystemFont,sans-serif}
      #mtaAuthGate.open{display:flex}
      .mta-auth-card{width:min(440px,100%);background:rgba(255,255,255,.96);border:1px solid #d7dce3;border-radius:22px;padding:30px;box-shadow:0 24px 80px rgba(15,23,42,.14)}
      .mta-auth-brand{display:flex;align-items:center;gap:12px;margin-bottom:24px}
      .mta-auth-logo{width:44px;height:44px;border-radius:12px;background:#0b63ce;color:#fff;display:grid;place-items:center;font-weight:800;font-size:20px}
      .mta-auth-brand strong{display:block;font-size:17px;color:#172033}.mta-auth-brand small{display:block;color:#667085;font-size:11px;margin-top:2px}
      .mta-auth-title{font-size:26px;font-weight:750;color:#172033;margin:0 0 6px}
      .mta-auth-sub{font-size:13px;line-height:1.5;color:#667085;margin:0 0 20px}
      .mta-auth-mode{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px;background:#f2f4f7;border-radius:11px;margin-bottom:16px}
      .mta-auth-mode button{border:0;background:transparent;border-radius:8px;padding:9px;color:#667085;cursor:pointer;font-weight:650}
      .mta-auth-mode button.active{background:#fff;color:#0754ae;box-shadow:0 1px 4px rgba(15,23,42,.08)}
      .mta-auth-field{display:grid;gap:6px;margin-top:11px}.mta-auth-field label{font-size:11px;color:#526176;font-weight:650}
      .mta-auth-field input{width:100%;border:1px solid #d7dce3;border-radius:10px;padding:11px 12px;outline:none;background:#fff}
      .mta-auth-field input:focus{border-color:#6aa2e8;box-shadow:0 0 0 3px #e6f0ff}
      .mta-auth-submit{width:100%;margin-top:18px;border:0;border-radius:10px;padding:12px;background:#0b63ce;color:#fff;font-weight:700;cursor:pointer}
      .mta-auth-submit:disabled{opacity:.6;cursor:wait}
      .mta-auth-message{min-height:18px;margin-top:10px;font-size:11px;color:#667085}.mta-auth-message.error{color:#b42318}.mta-auth-message.ok{color:#16763b}
      .mta-auth-foot{margin-top:18px;padding-top:14px;border-top:1px solid #edf0f4;color:#98a2b3;font-size:10px;line-height:1.5;text-align:center}
      @media(max-width:600px){#mtaAuthGate{padding:14px}.mta-auth-card{padding:22px;border-radius:18px}.mta-auth-title{font-size:23px}}
    `;
    document.head.appendChild(s);
  };

  function makeGate(){
    if(document.getElementById(GATE_ID)) return document.getElementById(GATE_ID);
    css();
    document.body.classList.add('mta-auth-locked');
    const gate=document.createElement('div');
    gate.id=GATE_ID;
    gate.innerHTML=`
      <div class="mta-auth-card">
        <div class="mta-auth-brand">
          <div class="mta-auth-logo">M</div>
          <div><strong>MTA DETENI Digital</strong><small>Manajemen Terpadu Administrasi Deteni</small></div>
        </div>
        <h1 class="mta-auth-title">Masuk ke MTA DETENI</h1>
        <p class="mta-auth-sub">Authentication diperlukan sebelum mengakses dashboard dan data operasional. Runtime saat ini tetap synthetic dan tidak menggunakan data deteni produksi.</p>
        <div class="mta-auth-mode">
          <button type="button" id="mtaAuthLoginMode" class="active">Login</button>
          
        </div>
        <form id="mtaAuthForm">
          <div class="mta-auth-field"><label>Email</label><input id="mtaAuthEmail" type="email" autocomplete="email" required></div>
          <div class="mta-auth-field"><label>Password</label><input id="mtaAuthPassword" type="password" autocomplete="current-password" required minlength="6"></div>
          <button class="mta-auth-submit" id="mtaAuthSubmit" type="submit">Login</button>
          <div class="mta-auth-message" id="mtaAuthMessage"></div>
        </form>
        <div class="mta-auth-foot">MTA DETENI · Authentication boundary · AI OFF · Synthetic runtime</div>
      </div>`;
    document.body.appendChild(gate);
    return gate;
  }

  function renderHeader(authenticated,user){
    const host=document.querySelector('.topright');
    if(!host) return;
    let box=document.getElementById('mtaAuthUi');
    if(!box){
      box=document.createElement('span');
      box.id='mtaAuthUi';
      box.style.cssText='display:inline-flex;gap:5px;align-items:center';
      host.prepend(box);
    }
    box.innerHTML='';
    const state=document.createElement('span');
    state.className='pill';
    state.textContent=authenticated ? (user?.email||'Authenticated') : 'Guest';
    box.appendChild(state);
    if(authenticated){
      const logout=document.createElement('button');
      logout.className='btn small'; logout.type='button'; logout.textContent='Logout';
      logout.onclick=async()=>{await window.mtaAuth.signOut()};
      box.appendChild(logout);
    }
  }

  function mode(signup){
    const login=document.getElementById('mtaAuthLoginMode');
    const submit=document.getElementById('mtaAuthSubmit');
    if(!login||!submit)return;
    login.classList.add('active');
    submit.textContent='Login';
    document.getElementById('mtaAuthPassword')?.setAttribute('autocomplete','current-password');
    document.getElementById('mtaAuthMessage').textContent='';
  }

  function bindForm(){
    const gate=makeGate();
    document.getElementById('mtaAuthForm').onsubmit=async(e)=>{
      e.preventDefault();
      const msg=document.getElementById('mtaAuthMessage');
      const submit=document.getElementById('mtaAuthSubmit');
      const signup=false;
      submit.disabled=true; msg.className='mta-auth-message'; msg.textContent='Memproses...';
      try{
        const email=document.getElementById('mtaAuthEmail').value.trim();
        const password=document.getElementById('mtaAuthPassword').value;
        const r=await window.mtaAuth.signIn(email,password);
        if(r?.error) throw r.error;
        if(!r?.data?.session) throw new Error('AUTH_SESSION_NOT_RETURNED');
        msg.className='mta-auth-message ok';
        msg.textContent='Login berhasil. Membuka aplikasi...';
        // Do not depend solely on Supabase's asynchronous auth event.
        // Complete the UI handoff directly from the successful sign-in response.
        const authDetail={authenticated:true,user:r.data.user||r.data.session.user||null};
        window.mtaProductionApi?.setAccessToken(r.data.session.access_token||null);
        activateAuthenticatedShell(authDetail.user);
        msg.textContent='Dashboard terbuka. Runtime operasional sedang dimuat...';
        // Notify the rest of the application only after the core shell is visible.
        window.dispatchEvent(new CustomEvent('mta-auth-state',{detail:authDetail}));
        // Runtime loading is owned by index.html's single authenticated loader.
      }catch(err){
        msg.className='mta-auth-message error';
        msg.textContent='Email atau password tidak valid, atau autentikasi belum dapat diproses.';
      }finally{submit.disabled=false}
    };
    mode(false);
  }

  async function update(event){
    const authenticated=!!event?.detail?.authenticated;
    const gate=makeGate();
    if(authenticated){
      document.body.classList.remove('mta-auth-locked');
      document.body.classList.add('mta-auth-ready');
      const app=document.querySelector('.app');
      if(app)app.style.removeProperty('display');
      gate.classList.remove('open');
      renderHeader(true,event.detail.user);
      // Protected API metadata is resolved by the authenticated runtime using the bearer token.
    }else{
      document.body.classList.remove('mta-auth-ready');
      document.body.classList.add('mta-auth-locked');
      const app=document.querySelector('.app');
      if(app)app.style.setProperty('display','none','important');
      gate.classList.add('open');
      renderHeader(false,null);
    }
  }

  function activateAuthenticatedShell(user){
    document.body.classList.remove('mta-auth-locked');
    document.body.classList.add('mta-auth-ready');
    const gate=makeGate();
    gate.classList.remove('open');
    gate.style.display='none';
    const app=document.querySelector('.app');
    if(app){
      app.style.removeProperty('display');
      app.style.display='grid';
    }
    const view=document.getElementById('appView');
    if(view){
      view.innerHTML='<section class="hero"><h1>Dashboard</h1><p class="sub">MTA DETENI Digital · Authentication aktif · Core dashboard siap.</p></section>'+
        '<section class="grid stats" style="margin-top:12px">'+
        '<div class="card"><div class="label">Authentication</div><div class="value" style="font-size:18px">AUTHENTICATED</div><span class="status">PASS</span></div>'+
        '<div class="card"><div class="label">Data Mode</div><div class="value" style="font-size:18px">SYNTHETIC</div><span class="status">SAFE</span></div>'+
        '<div class="card"><div class="label">AI</div><div class="value" style="font-size:18px">OFF</div><span class="status">CONTROLLED</span></div>'+
        '<div class="card"><div class="label">Session</div><div class="value" style="font-size:18px">ACTIVE</div><span class="status">SECURE</span></div>'+
        '<div class="card"><div class="label">Runtime</div><div class="value" style="font-size:18px">CORE</div><span class="status">READY</span></div>'+
        '</section>';
    }
    renderHeader(true,user||null);
  }

  function loadAuthModule(){
    if(window.__mtaAuthModuleLoading)return window.__mtaAuthModuleLoading;
    if(window.mtaAuth)return Promise.resolve();
    window.__mtaAuthModuleLoading=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.type='module';
      s.src='/mta-auth.js?v=2';
      s.onload=()=>resolve();
      s.onerror=()=>reject(new Error('AUTH_MODULE_LOAD_FAILED'));
      document.head.appendChild(s);
    }).catch(err=>{
      window.__mtaAuthModuleLoading=null;
      const msg=document.getElementById('mtaAuthMessage');
      if(msg){msg.textContent='Authentication service belum dapat dimuat. Silakan refresh.';msg.className='mta-auth-message error'}
      throw err;
    });
    return window.__mtaAuthModuleLoading;
  }
  function init(){
    makeGate();
    bindForm();
    window.addEventListener('mta-auth-state',update);
    // Never block the first paint on the authentication provider.
    const startAuth=()=>void loadAuthModule().catch(()=>{});
    if('requestIdleCallback' in window){
      window.requestIdleCallback(startAuth,{timeout:1500});
    }else{
      window.setTimeout(startAuth,50);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();