(function(){
  'use strict';
  if(window.__mtaCoreShellBooted)return;
  window.__mtaCoreShellBooted=true;

  const view=document.getElementById('appView');
  const app=document.querySelector('.app');
  if(!view||!app)return;

  const escapeHtml=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const renderCore=()=>{
    // Bootstrap shell is intentionally neutral. Operational data/status are rendered only
    // by the canonical full runtime after the production adapter has hydrated.
    view.innerHTML=
      '<section class="mta-command-hero">'+
        '<div class="mta-command-copy"><div class="mta-eyebrow">MTA DETENI DIGITAL · OPERATIONAL COMMAND CENTER</div>'+ 
        '<h1>Dashboard</h1><p>Runtime sedang menginisialisasi. Data operasional akan ditampilkan setelah canonical runtime siap.</p>'+ 
        '<div class="mta-hero-actions"><span class="mta-panel-muted">Loading canonical runtime…</span></div></div>'+ 
        '<div class="mta-hero-visual"><div class="mta-orbit mta-orbit-a"></div><div class="mta-orbit mta-orbit-b"></div><div class="mta-core-mark">M</div><span class="mta-core-pulse"></span></div>'+ 
      '</section>'+
      '<section class="mta-dashboard-grid">'+
        '<article class="mta-panel mta-quick-panel"><div class="mta-panel-head"><div><span class="mta-section-kicker">RUNTIME</span><h2>Initializing</h2></div><span class="mta-panel-badge">LOADING</span></div>'+ 
        '<div class="mta-action-grid"><div class="mta-action-tile"><b>Canonical runtime</b><small>Menunggu operational runtime</small></div><div class="mta-action-tile"><b>Production state</b><small>Menunggu hydration</small></div></div></article>'+ 
        '<aside class="mta-panel mta-health-panel"><div class="mta-panel-head"><div><span class="mta-section-kicker">GOVERNANCE</span><h2>Runtime status</h2></div><span class="mta-live-dot">● LIVE</span></div>'+ 
        '<div class="mta-status-list"><div><span>Authentication</span><b>AUTHENTICATED</b></div><div><span>Data mode</span><b>LOADING</b></div><div><span>AI</span><b>OFF</b></div><div><span>Database</span><b>CONNECTING</b></div></div>'+ 
        '<div class="mta-governance-note"><strong>Governed runtime</strong><span>Migration Freeze · Canonical runtime sedang menginisialisasi</span></div></aside></section>';
  };

  app.style.removeProperty('display');
  document.body.classList.remove('mta-auth-locked');
  document.body.classList.add('mta-auth-ready');
  renderCore();

  // Canonical operational runtime asset: /mta-app-runtime-full.js?v=25 (static deferred in index.html).
  // It installs its auth-state listener before authenticated hydration can fire,
  // eliminating the previous dynamically-injected async handoff race.
  const loadProvenance=()=>{
    if(window.MTAProvenance||document.querySelector('script[data-mta-provenance]'))return;
    const provenance=document.createElement('script');
    provenance.src='/mta-provenance-v1.js?v=2';
    provenance.async=true;
    provenance.dataset.mtaProvenance='1';
    provenance.onload=()=>console.info('[MTA] provenance contract loaded v2');
    provenance.onerror=err=>console.warn('[MTA] provenance contract unavailable',err);
    document.body.appendChild(provenance);
  };
  if(window.__mtaOperationalRuntimeAssetFailed){
    const reason=String(window.__mtaOperationalRuntimeError||'MTA_APP_RUNTIME_FULL_UNAVAILABLE');
    view.innerHTML='<section class="hero"><h1>Runtime operasional gagal dimuat</h1><p class="sub">Canonical runtime tidak berhasil dieksekusi. Tidak ada data sintetis yang dipromosikan sebagai pengganti production runtime.</p><div class="notice" style="margin-top:12px">Reason: '+escapeHtml(reason)+'</div><div class="toolbar"><button class="btn primary" type="button" onclick="location.reload()">Coba lagi</button></div></section>';
  } else {
    window.setTimeout(()=>{
      if(window.__mtaOperationalRuntimeLoaded||window.__mtaOperationalRuntimeAssetFailed)return;
      view.innerHTML='<section class="hero"><h1>Runtime operasional tidak merespons</h1><p class="sub">Bootstrap shell sudah aktif, tetapi canonical operational runtime belum terdaftar setelah 3 detik.</p><div class="notice" style="margin-top:12px">Boundary: AUTHENTICATED → CANONICAL_RUNTIME</div><div class="toolbar"><button class="btn primary" type="button" onclick="location.reload()">Coba lagi</button></div></section>';
    },3000);
  }
  loadProvenance();
})();