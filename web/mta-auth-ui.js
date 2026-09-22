(function(){
  'use strict';

  const ROLES=Object.freeze(['OWNER','ADMIN','EDITOR','REVIEWER','AUDITOR']);
  const RBAC=Object.freeze({
    OWNER:{label:'Owner',views:['dashboard','detainee','placement','movement','leave','documents','audit','p6rooms','p6leaveqr','p6camera','p6reports','p5monitor','p5qr','p5scan','p5ops'],readOnly:false},
    ADMIN:{label:'Administrator',views:['dashboard','detainee','placement','movement','leave','documents','audit','p6rooms','p6leaveqr','p6camera','p6reports','p5monitor','p5qr','p5scan','p5ops'],readOnly:false},
    EDITOR:{label:'Operator / Editor',views:['dashboard','detainee','placement','movement','leave','documents','p6rooms','p6leaveqr','p6camera','p6reports','p5monitor','p5qr','p5scan','p5ops'],readOnly:false},
    REVIEWER:{label:'Reviewer',views:['dashboard','detainee','placement','movement','leave','documents','audit','p6camera','p6reports','p5monitor','p5qr','p5scan','p5ops'],readOnly:true},
    AUDITOR:{label:'Auditor',views:['dashboard','documents','audit','p6reports','p5monitor','p5qr','p5scan'],readOnly:true}
  });

  let state={resolved:false,authenticated:false,user:null,role:null,profile:null};

  function el(tag,props,text){
    const x=document.createElement(tag);
    Object.entries(props||{}).forEach(([k,v])=>x[k]=v);
    if(text!==undefined)x.textContent=text;
    return x;
  }

  function installStyles(){
    if(document.getElementById('mta-rbac-auth-style'))return;
    const s=document.createElement('style');
    s.id='mta-rbac-auth-style';
    s.textContent=`
      body.mta-auth-pending .app,
      body.mta-auth-guest .app{display:none!important}
      #mtaAuthGate{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#f7f9fc,#e7edf5)}
      .mta-auth-card{width:min(440px,100%);background:#fff;border:1px solid #d7dce3;border-radius:20px;padding:28px;box-shadow:0 24px 70px rgba(15,23,42,.14)}
      .mta-auth-brand{display:flex;align-items:center;gap:12px;margin-bottom:24px}
      .mta-auth-logo{width:44px;height:44px;border-radius:12px;background:#0b63ce;color:#fff;display:grid;place-items:center;font-weight:800;font-size:20px}
      .mta-auth-title{font-size:20px;font-weight:800;margin:0}.mta-auth-sub{font-size:11px;color:#687385;margin-top:3px}
      .mta-auth-card h2{font-size:18px;margin:0 0 6px}.mta-auth-card .field{margin-top:12px}
      .mta-auth-card input{width:100%;padding:11px;border:1px solid #d7dce3;border-radius:9px;outline:none}
      .mta-auth-card input:focus{border-color:#6aa2e8;box-shadow:0 0 0 3px #e6f0ff}
      .mta-auth-submit{width:100%;margin-top:18px}
      .mta-auth-error{display:none;margin-top:12px;padding:10px 12px;border-radius:9px;background:#fff0ee;border:1px solid #f2c8c2;color:#b42318;font-size:12px}
      .mta-auth-meta{margin-top:16px;text-align:center;font-size:10px;color:#98a2b3}
      .mta-rbac-badge{display:inline-flex;align-items:center;padding:5px 9px;border-radius:999px;background:#eaf2ff;color:#175cd3;border:1px solid #cfe0fb;font-size:10px;font-weight:800}
      .mta-rbac-denied{opacity:.45!important;pointer-events:none!important}
      .mta-readonly-note{margin-left:6px;font-size:9px;color:#8a5a00}
    `;
    document.head.appendChild(s);
  }

  function gate(){
    let g=document.getElementById('mtaAuthGate');
    if(!g){
      g=document.createElement('div');
      g.id='mtaAuthGate';
      document.body.appendChild(g);
    }
    g.innerHTML='';
    const card=el('div',{className:'mta-auth-card'});
    const brand=el('div',{className:'mta-auth-brand'});
    brand.append(el('div',{className:'mta-auth-logo'},'M'));
    const bt=el('div');
    bt.append(el('div',{className:'mta-auth-title'},'MTA DETENI Digital'),el('div',{className:'mta-auth-sub'},'Manajemen Terpadu Administrasi Deteni'));
    brand.append(bt);
    const h=el('h2',{},'Login');
    const sub=el('div',{className:'mta-auth-sub'},'Masuk menggunakan akun yang telah diberikan role RBAC.');
    const form=el('form',{id:'mtaRbacLogin'});
    const ef=el('div',{className:'field'});
    const email=el('input',{type:'email',name:'email',autocomplete:'username',required:true,placeholder:'Email'});
    ef.append(el('label',{},'Email'),email);
    const pf=el('div',{className:'field'});
    const pass=el('input',{type:'password',name:'password',autocomplete:'current-password',required:true,placeholder:'Password'});
    pf.append(el('label',{},'Password'),pass);
    const err=el('div',{className:'mta-auth-error',id:'mtaAuthError'});
    const submit=el('button',{className:'btn primary mta-auth-submit',type:'submit'},'Login');
    form.append(ef,pf,err,submit);
    const meta=el('div',{className:'mta-auth-meta'},'Akses publik dan pendaftaran mandiri dinonaktifkan. Role diberikan melalui administrasi akun.');
    card.append(brand,h,sub,form,meta);g.append(card);
    form.onsubmit=async e=>{
      e.preventDefault();
      err.style.display='none';
      submit.disabled=true;
      submit.textContent='Memeriksa…';
      try{
        const r=await window.mtaAuth.signIn(email.value.trim(),pass.value);
        if(r.error)throw r.error;
        if(!r.data?.session)throw new Error('SESSION_NOT_ESTABLISHED');
        await resolveAuthenticated(r.data.session);
      }catch(ex){
        err.textContent=ex?.message||'Login gagal. Periksa kredensial atau status akun.';
        err.style.display='block';
      }finally{
        submit.disabled=false;
        submit.textContent='Login';
      }
    };
    setTimeout(()=>email.focus(),0);
  }

  function setGateVisible(visible){
    document.body.classList.toggle('mta-auth-pending',!state.resolved);
    document.body.classList.toggle('mta-auth-guest',state.resolved&&!state.authenticated);
    const g=document.getElementById('mtaAuthGate');
    if(g)g.style.display=visible?'flex':'none';
  }

  function roleViews(role){
    return RBAC[role]?.views||[];
  }

  function applyRbac(){
    const role=state.role;
    const allowed=new Set(roleViews(role));
    document.querySelectorAll('#nav button,[data-view]').forEach(b=>{
      const view=b.dataset.view;
      if(!view)return;
      const ok=allowed.has(view);
      b.hidden=!ok;
      b.classList.toggle('mta-rbac-denied',!ok);
      if(!ok)b.setAttribute('aria-hidden','true');else b.removeAttribute('aria-hidden');
    });
    const host=document.querySelector('.topright');
    if(host){
      let badge=document.getElementById('mtaRbacBadge');
      if(!badge){
        badge=el('span',{id:'mtaRbacBadge',className:'mta-rbac-badge'});
        host.prepend(badge);
      }
      badge.textContent=role+' · '+(RBAC[role]?.label||'RBAC');
      badge.title=RBAC[role]?.readOnly?'Mode baca/review':'Mode operasional sesuai role';
      let logout=document.getElementById('mtaRbacLogout');
      if(!logout){
        logout=el('button',{id:'mtaRbacLogout',className:'btn small'},'Logout');
        host.appendChild(logout);
        logout.onclick=async()=>{await window.mtaAuth.signOut()};
      }
      logout.hidden=false;
    }
    const backup=document.getElementById('backupBtn');
    const restore=document.getElementById('importBtn');
    if(backup)backup.hidden=!['OWNER','ADMIN'].includes(role);
    if(restore)restore.hidden=!['OWNER','ADMIN'].includes(role);
  }

  async function resolveAuthenticated(session){
    state.authenticated=true;
    state.user=session?.user||null;
    try{
      const me=await window.mtaProductionApi.get('me');
      const role=String(me?.role||'').toUpperCase();
      if(!ROLES.includes(role))throw new Error('RBAC_ROLE_NOT_ASSIGNED');
      state.role=role;
      state.profile=me;
      state.resolved=true;
      setGateVisible(false);
      applyRbac();
      window.dispatchEvent(new CustomEvent('mta-rbac-ready',{detail:{user:state.user,role,profile:me}}));
    }catch(e){
      state.authenticated=false;
      state.role=null;
      state.profile=null;
      state.resolved=true;
      try{await window.mtaAuth.signOut()}catch(_){}
      setGateVisible(true);
      const err=document.getElementById('mtaAuthError');
      if(err){err.textContent='Akun terautentikasi tetapi belum memiliki role RBAC yang valid. Hubungi administrator.';err.style.display='block'}
    }
  }

  async function handleAuth(event){
    const session=event.detail?.session||null;
    state.authenticated=!!session;
    state.user=event.detail?.user||session?.user||null;
    if(!session){
      state.resolved=true;state.role=null;state.profile=null;
      const logout=document.getElementById('mtaRbacLogout');if(logout)logout.hidden=true;
      setGateVisible(true);
      return;
    }
    await resolveAuthenticated(session);
  }

  window.mtaRbac=Object.freeze({
    roles:ROLES,
    matrix:RBAC,
    getState:()=>Object.freeze({...state}),
    canView:view=>!!state.role&&roleViews(state.role).includes(view),
    isReadOnly:()=>!!state.role&&!!RBAC[state.role]?.readOnly
  });

  installStyles();
  document.body.classList.add('mta-auth-pending');
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{gate();setGateVisible(true)});else{gate();setGateVisible(true)}
  window.addEventListener('mta-auth-state',handleAuth);
  window.addEventListener('mta-rbac-ready',applyRbac);
  new MutationObserver(()=>{if(state.authenticated&&state.role)applyRbac()}).observe(document.documentElement,{subtree:true,childList:true});
})();
