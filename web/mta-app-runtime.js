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
      '<section class="mta-command-hero">'+
        '<div class="mta-command-copy"><div class="mta-eyebrow">MTA DETENI DIGITAL · OPERATIONAL COMMAND CENTER</div>'+
        '<h1>Dashboard</h1><p>Ruang kendali operasional untuk memantau deteni, penempatan, pergerakan, izin, QR, dokumen, dan audit dalam satu alur kerja.</p>'+
        '<div class="mta-hero-actions"><button class="btn primary" onclick="show(\'camera-scan\')">Scan QR</button><button class="btn" onclick="show(\'detainee\')">Data Deteni</button><button class="btn" onclick="show(\'monitor\')">Operational Monitor</button></div></div>'+
        '<div class="mta-hero-visual"><div class="mta-orbit mta-orbit-a"></div><div class="mta-orbit mta-orbit-b"></div><div class="mta-core-mark">M</div><span class="mta-core-pulse"></span></div>'+
      '</section>'+
      '<section class="mta-kpi-grid">'+
        '<div class="mta-kpi-card accent"><span class="mta-kpi-icon">♙</span><div><small>Deteni Aktif</small><strong>2</strong><em>Operational</em></div></div>'+
        '<div class="mta-kpi-card"><span class="mta-kpi-icon">▱</span><div><small>Penempatan</small><strong>2</strong><em>Tracked</em></div></div>'+
        '<div class="mta-kpi-card"><span class="mta-kpi-icon">→</span><div><small>Pergerakan</small><strong>0</strong><em>Logged</em></div></div>'+
        '<div class="mta-kpi-card"><span class="mta-kpi-icon">⇥</span><div><small>Izin</small><strong>0</strong><em>Workflow</em></div></div>'+
        '<div class="mta-kpi-card"><span class="mta-kpi-icon">◷</span><div><small>Audit Event</small><strong>0</strong><em>Evidence</em></div></div>'+
      '</section>'+
      '<section class="mta-dashboard-grid">'+
        '<article class="mta-panel mta-quick-panel"><div class="mta-panel-head"><div><span class="mta-section-kicker">OPERASIONAL</span><h2>Alur kerja cepat</h2></div><span class="mta-panel-badge">SYNTHETIC</span></div>'+
          '<div class="mta-action-grid">'+
            '<button onclick="show(\'detainee\')" class="mta-action-tile"><span>♙</span><b>Data Deteni</b><small>Kelola master data</small></button>'+
            '<button onclick="show(\'placement\')" class="mta-action-tile"><span>▱</span><b>Penempatan</b><small>Assignment kamar</small></button>'+
            '<button onclick="show(\'movement\')" class="mta-action-tile"><span>→</span><b>Pergerakan</b><small>Catat mutasi</small></button>'+
            '<button onclick="show(\'leave\')" class="mta-action-tile"><span>⇥</span><b>Izin</b><small>Workflow keluar sementara</small></button>'+
            '<button onclick="show(\'documents\')" class="mta-action-tile"><span>▤</span><b>Dokumen</b><small>Laporan & evidence</small></button>'+
            '<button onclick="show(\'audit\')" class="mta-action-tile"><span>◷</span><b>Audit Trail</b><small>Jejak tindakan</small></button>'+
          '</div>'+
        '</article>'+
        '<aside class="mta-panel mta-health-panel"><div class="mta-panel-head"><div><span class="mta-section-kicker">GOVERNANCE</span><h2>Runtime status</h2></div><span class="mta-live-dot">● LIVE</span></div>'+
          '<div class="mta-status-list"><div><span>Authentication</span><b>AUTHENTICATED</b></div><div><span>Data mode</span><b>SYNTHETIC</b></div><div><span>AI</span><b>OFF</b></div><div><span>Database</span><b>NOT CONNECTED</b></div></div>'+
          '<div class="mta-governance-note"><strong>Governed runtime</strong><span>Migration Freeze · Production access locked · Synthetic data only</span></div>'+
        '</aside>'+
      '</section>'+
      '<section class="mta-roadmap-panel"><div class="mta-panel-head"><div><span class="mta-section-kicker">ROADMAP</span><h2>Operational journey</h2></div><span class="mta-panel-muted">Scan → Resolve → Data → Action → Audit → Monitor → Report</span></div>'+
        '<div class="mta-roadmap"><div class="done"><span>01</span><b>Scan</b><small>QR / Camera</small></div><i></i><div class="done"><span>02</span><b>Resolve</b><small>Context</small></div><i></i><div><span>03</span><b>Action</b><small>Mutation</small></div><i></i><div><span>04</span><b>Audit</b><small>Evidence</small></div><i></i><div><span>05</span><b>Monitor</b><small>Operational</small></div><i></i><div><span>06</span><b>Report</b><small>Daily Guard</small></div></div>'+
      '</section>';
  };

  app.style.removeProperty('display');
  document.body.classList.remove('mta-auth-locked');
  document.body.classList.add('mta-auth-ready');
  renderCore();

  // Operational runtime is deliberately non-blocking.
  // Cache-bust after the persistence/branding fixes; this must load the current full runtime.
  const s=document.createElement('script');
  s.src='/mta-app-runtime-full.js?v=17';
  s.async=true;
  s.dataset.mtaOperationalRuntime='1';
  s.onload=()=>console.info('[MTA] operational runtime loaded v16');
  s.onerror=err=>console.warn('[MTA] operational runtime unavailable; core dashboard remains active',err);
  document.body.appendChild(s);
})();