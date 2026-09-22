(function(){
  'use strict';

  const CAN_REGISTER=new Set(['OWNER','ADMIN']);
  const state={authenticated:false,role:null,profile:null,session:null};

  function el(tag,props,text){
    const x=document.createElement(tag);
    Object.entries(props||{}).forEach(([k,v])=>x[k]=v);
    if(text!==undefined)x.textContent=text;
    return x;
  }

  function installStyles(){
    if(document.getElementById('mta-auth-gate-style'))return;
    const s=document.createElement('style');
    s.id='mta-auth-gate-style';
    s.textContent=`
      .app{display:none!important}
      body.mta-authenticated .app{display:grid!important}
      #mtaAuthGate{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#f7f9fc,#e9eef5)}
      #mtaAuthGate[hidden]{display:none}
      .mta-auth-card{width:min(430px,100%);background:#fff;border:1px solid #d7dce3;border-radius:18px;padding:28px;box-shadow:0 20px 70px rgba(15,23,42,.12)}
      .mta-auth-logo{width:46px;height:46px;border-radius:12px;background:#0b63ce;color:#fff;display:grid;place-items:center;font-weight:800;font-size:21px;margin-bottom:16px}
      .mta-auth-title{margin:0 0 5px;font-size:24px;color:#172033}
      .mta-auth-sub{margin:0 0 20px;color:#687385;font-size:12px;line-height:1.5}
      .mta-auth-field{display:grid;gap:6px;margin-top:12px}
      .mta-auth-field label{font-size:11px;color:#526176;font-weight:700}
      .mta-auth-field input{width:100%;border:1px solid #d7dce3;border-radius:9px;padding:11px;background:#fff;outline:none}
      .mta-auth-field input:focus{border-color:#6aa2e8;box-shadow:0 0 0 3px #e6f0ff}
      .mta-auth-actions{display:flex;gap:8px;margin-top:18px}
      .mta-auth-actions button{flex:1}
      .mta-auth-status{min-height:18px;margin-top:12px;font-size:11px;color:#b42318}
      .mta-auth-runtime{margin-top:18px;padding:9px 11px;border-radius:9px;background:#f5f8fc;border:1px solid #d7dce3;color:#536071;font-size:10px}
      .mta-auth-admin{display:none}
      #mtaAuthUi{display:inline-flex;gap:6px;align-items:center}
    `;
    document.head.appendChild(s);
  }

  function gate(){
    let g=document.getElementById('mtaAuthGate');
    if(g)return g;
    g=document.createElement('section');
    g.id='mtaAuthGate';
    g.innerHTML=`
      <div class="mta-auth-card" role="dialog" aria-labelledby="mtaLoginTitle">
        <div class="mta-auth-logo">M</div>
        <h1 id="mtaLoginTitle" class="mta-auth-title">Login MTA DETENI</h1>
        <p class="mta-auth-sub">Silakan login untuk masuk ke aplikasi. Akses aplikasi tidak tersedia dalam mode Guest.</p>
        <form id="mtaLoginForm" autocomplete="on">
          <div class="mta-auth-field"><label for="mtaLoginEmail">Email</label><input id="mtaLoginEmail" type="email" autocomplete="username" required></div>
          <div class="mta-auth-field"><label for="mtaLoginPassword">Password</label><input id="mtaLoginPassword" type="password" autocomplete="current-password" required></div>
          <div id="mtaLoginStatus" class="mta-auth-status" aria-live="polite"></div>
          <div class="mta-auth-actions"><button class="btn primary" type="submit">Login</button></div>
        </form>
        <div class="mta-auth-runtime">MTA DETENI · Authenticated runtime · Synthetic data only</div>
      </div>`;
    document.body.appendChild(g);
    g.querySelector('#mtaLoginForm').addEventListener('submit',async e=>{
      e.preventDefault();
      const status=g.querySelector('#mtaLoginStatus');
      status.textContent='Memverifikasi akun…';
      try{
        if(!window.mtaAuth)throw new Error('AUTH_RUNTIME_NOT_READY');
        const r=await window.mtaAuth.signIn(g.querySelector('#mtaLoginEmail').value.trim(),g.querySelector('#mtaLoginPassword').value);
        if(r.error)throw r.error;
        status.textContent='';
      }catch(err){status.textContent=err?.message||'Login gagal.';}
    });
    return g;
  }

  function renderHeader(){
    const host=document.querySelector('.topright');
    if(!host||document.getElementById('mtaAuthUi'))return;
    const box=el('span',{id:'mtaAuthUi'});
    const stateEl=el('span',{id:'mtaAuthUiState',className:'pill'},'Guest');
    const register=el('button',{id:'mtaAuthRegister',className:'btn small'},'Tambah Pengguna');
    const logout=el('button',{id:'mtaAuthLogout',className:'btn small'},'Logout');
    register.style.display='none';
    logout.style.display='none';
    box.append(stateEl,register,logout);
    host.prepend(box);
    register.onclick=()=>showRegister();
    logout.onclick=async()=>{await window.mtaAuth?.signOut();};
  }

  function showRegister(){
    if(!CAN_REGISTER.has(state.role)){
      window.toast?.('Hanya OWNER/ADMIN yang dapat mendaftarkan akun.');
      return;
    }
    const html=`
      <div class="dialoghead"><h2>Tambah Pengguna</h2><button class="x" id="mtaRegClose" type="button">×</button></div>
      <div class="notice">Registrasi hanya tersedia untuk OWNER/ADMIN. Akun baru dibuat melalui endpoint backend terproteksi.</div>
      <div class="formgrid" style="margin-top:12px">
        <div class="field full"><label>Nama</label><input id="mtaRegName" type="text" autocomplete="name" required></div>
        <div class="field"><label>Email</label><input id="mtaRegEmail" type="email" autocomplete="email" required></div>
        <div class="field"><label>Password sementara</label><input id="mtaRegPassword" type="password" autocomplete="new-password" minlength="12" required></div>
      </div>
      <div id="mtaRegStatus" class="notice" style="margin-top:12px;display:none"></div>
      <div class="actions"><button class="btn" id="mtaRegCancel" type="button">Batal</button><button class="btn primary" id="mtaRegGo" type="button">Daftarkan</button></div>`;
    openModal(html);
    const dialog=document.getElementById('dialog');
    dialog.querySelector('#mtaRegClose').onclick=()=>closeModal();
    dialog.querySelector('#mtaRegCancel').onclick=()=>closeModal();
    dialog.querySelector('#mtaRegGo').onclick=async()=>{
      const status=dialog.querySelector('#mtaRegStatus');
      const go=dialog.querySelector('#mtaRegGo');
      status.style.display='block';status.textContent='Mendaftarkan akun…';go.disabled=true;
      try{
        const r=await window.mtaAuth.adminRegister({
          email:dialog.querySelector('#mtaRegEmail').value.trim(),
          password:dialog.querySelector('#mtaRegPassword').value,
          full_name:dialog.querySelector('#mtaRegName').value.trim()
        });
        if(r.error)throw r.error;
        status.textContent='Akun berhasil dibuat. Pengguna baru harus melakukan login sendiri.';
        window.toast?.('Pengguna berhasil didaftarkan.');
        setTimeout(()=>closeModal(),900);
      }catch(err){
        status.textContent=err?.message||'Pendaftaran gagal.';
        go.disabled=false;
      }
    };
  }

  async function update(event){
    const authenticated=!!event?.detail?.authenticated;
    state.authenticated=authenticated;
    state.session=event?.detail?.session||null;
    const g=gate();
    const stateEl=document.getElementById('mtaAuthUiState');
    const register=document.getElementById('mtaAuthRegister');
    const logout=document.getElementById('mtaAuthLogout');

    if(!authenticated){
      state.role=null; state.profile=null;
      document.body.classList.remove('mta-authenticated');
      g.hidden=false;
      if(stateEl)stateEl.textContent='Guest';
      if(register)register.style.display='none';
      if(logout)logout.style.display='none';
      return;
    }

    try{
      const me=await window.mtaProductionApi.get('me');
      state.role=String(me.role||'').toUpperCase();
      state.profile=me.profile||null;
      if(!CAN_REGISTER.has(state.role)&&!['OWNER','ADMIN','EDITOR','REVIEWER','AUDITOR'].includes(state.role)){
        throw new Error('RBAC_PROFILE_INVALID');
      }
      g.hidden=true;
      document.body.classList.add('mta-authenticated');
      if(stateEl)stateEl.textContent=state.role;
      if(register)register.style.display=CAN_REGISTER.has(state.role)?'inline-flex':'none';
      if(logout)logout.style.display='inline-flex';
      window.dispatchEvent(new CustomEvent('mta-auth-authorized',{detail:{role:state.role,profile:state.profile}}));
    }catch(err){
      await window.mtaAuth?.signOut();
      document.body.classList.remove('mta-authenticated');
      g.hidden=false;
      const status=g.querySelector('#mtaLoginStatus');
      if(status)status.textContent=err?.message==='RBAC_PROFILE_INVALID'?'Role akun tidak valid.':'Akun berhasil login tetapi profil RBAC tidak aktif/terdaftar.';
    }
  }

  function boot(){
    installStyles();
    gate();
    renderHeader();
    window.addEventListener('mta-auth-state',update);
    if(window.mtaAuth?.session)window.mtaAuth.session().then(r=>update({detail:{authenticated:!!r.data?.session,session:r.data?.session||null}}));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();