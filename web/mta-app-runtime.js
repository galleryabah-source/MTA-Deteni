(function(){
  'use strict';
  if(window.__mtaCoreShellBooted)return;
  window.__mtaCoreShellBooted=true;

  const view=document.getElementById('appView');
  const app=document.querySelector('.app');
  if(!view||!app)return;

  const escapeHtml=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const renderCore=()=>{
    view.innerHTML=
      '<section class="hero"><h1>Dashboard</h1><p class="sub">MTA DETENI Digital · Core runtime aktif setelah authentication.</p></section>'+
      '<section class="grid stats" style="margin-top:12px">'+
        '<div class="card"><div class="label">Deteni Aktif</div><div class="value">2</div><span class="status">Synthetic</span></div>'+
        '<div class="card"><div class="label">Penempatan</div><div class="value">2</div><span class="status">Tracked</span></div>'+
        '<div class="card"><div class="label">Pergerakan</div><div class="value">0</div><span class="status">Logged</span></div>'+
        '<div class="card"><div class="label">Izin</div><div class="value">0</div><span class="status">Workflow</span></div>'+
        '<div class="card"><div class="label">Audit Event</div><div class="value">0</div><span class="status">Evidence</span></div>'+
      '</section>'+
      '<section class="card" style="margin-top:12px"><h2>Runtime</h2><div class="kpis">'+
        '<div><div class="label">Authentication</div><b>AUTHENTICATED</b></div>'+
        '<div><div class="label">Data</div><b>SYNTHETIC</b></div>'+
        '<div><div class="label">AI</div><b>OFF</b></div>'+
      '</div></section>';
  };

  app.style.removeProperty('display');
  document.body.classList.remove('mta-auth-locked');
  document.body.classList.add('mta-auth-ready');
  renderCore();

  // Operational runtime is deliberately non-blocking.
  const s=document.createElement('script');
  s.src='/mta-app-runtime-full.js?v=1';
  s.async=true;
  s.dataset.mtaOperationalRuntime='1';
  s.onload=()=>console.info('[MTA] operational runtime loaded');
  s.onerror=err=>console.warn('[MTA] operational runtime unavailable; core dashboard remains active',err);
  document.body.appendChild(s);
})();