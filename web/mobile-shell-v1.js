(()=>{
  'use strict';
  const STYLE_ID='mta-mobile-shell-v2-style';
  const NAV_ID='mtaMobileBottomNav';
  const DRAWER_ID='mtaMobileMenuDrawer';
  let observerStarted=false;
  let syncTimer=0;
  function css(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style'); s.id=STYLE_ID; s.textContent=`
      @media (max-width:1024px){
        :root{--mta-mobile-bottom:82px;--mta-mobile-safe:max(12px,env(safe-area-inset-bottom));}
        html,body{width:100%;max-width:100%;overflow-x:hidden!important}
        body{padding-bottom:0!important}
        .app{grid-template-rows:56px 1fr 0!important;min-height:100dvh!important}
        .layout{display:block!important;min-height:calc(100dvh - 56px)!important}
        .side{display:none!important}
        .main{padding:14px 14px calc(var(--mta-mobile-bottom) + var(--mta-mobile-safe) + 18px)!important;overflow-x:hidden!important;overflow-y:auto!important;min-width:0!important;width:100%!important}
        .view{width:100%!important;max-width:none!important;margin:0!important;min-width:0!important}
        .top{height:56px!important;min-height:56px!important;padding:0 12px!important;z-index:100!important}
        .brand{gap:9px;min-width:0}.logo{width:38px;height:38px;border-radius:11px;font-size:19px;flex:0 0 auto}
        .brand strong{font-size:15px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:210px}
        .brand small{display:block!important;font-size:10px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:210px}
        .topright{gap:6px}.topright .pill,.topright .btn,.topright input{display:none!important}
        .hero{padding:18px!important;border-radius:18px!important;margin-bottom:12px!important;max-width:100%!important}
        .hero h1{font-size:27px!important;line-height:1.12!important}.sub{font-size:13px!important;line-height:1.45!important}
        .stats{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}.card{border-radius:16px!important;padding:14px!important;min-width:0!important}
        .toolbar{gap:8px!important;margin:12px 0!important;max-width:100%!important}.toolbar .btn.primary{min-height:46px;font-weight:700}.toolbar input{min-height:44px!important;min-width:0!important;flex:1 1 180px}
        .tablewrap{border:0!important;background:transparent!important;overflow:visible!important}.tablewrap>.table{display:none!important}
        .mta-mobile-records{display:grid;gap:10px;margin-top:10px}.mta-mobile-record{background:rgba(255,255,255,.96);border:1px solid var(--line,#d7dce3);border-radius:18px;padding:14px;box-shadow:0 7px 24px rgba(30,45,65,.06);display:grid;gap:9px;min-width:0}
        .mta-mobile-record-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;min-width:0}.mta-mobile-record-code{font-weight:800;font-size:15px;color:#172033;letter-spacing:.01em}.mta-mobile-record-name{font-size:14px;color:#526176;margin-top:3px;overflow:hidden;text-overflow:ellipsis}
        .mta-mobile-record-status{white-space:nowrap;padding:6px 9px;border-radius:999px;background:#edf8f0;color:#16763b;font-size:11px;font-weight:700}.mta-mobile-record-meta{display:grid;grid-template-columns:1fr 1fr;gap:7px;color:#526176;font-size:12px}.mta-mobile-record-meta span{background:#f6f8fb;border-radius:10px;padding:8px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mta-mobile-record-actions{display:flex;gap:7px;justify-content:flex-end;padding-top:2px}.mta-mobile-record-actions .btn{min-height:38px}
        .mta-mobile-bottom{position:fixed;left:0;right:0;bottom:0;height:calc(var(--mta-mobile-bottom) + var(--mta-mobile-safe));padding:7px 10px var(--mta-mobile-safe);background:rgba(255,255,255,.96);border-top:1px solid #dce2ea;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);display:grid;grid-template-columns:1fr 1fr 1.25fr 1fr 1fr;align-items:end;z-index:120;box-shadow:0 -8px 30px rgba(30,45,65,.08)}
        .mta-mobile-bottom button{border:0;background:transparent;color:#526176;min-width:0;height:62px;border-radius:15px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:11px;font-weight:600;padding:2px 3px;touch-action:manipulation}.mta-mobile-bottom button.active{color:#0754ae;background:#e7f0ff}.mta-mobile-bottom .mta-mobile-icon{font-size:23px;line-height:1;font-weight:700}
        .mta-mobile-bottom .mta-scan-wrap{height:82px;position:relative;align-self:start;margin-top:-30px;display:flex;align-items:center;justify-content:center}.mta-mobile-bottom .mta-scan{width:76px;height:76px;border-radius:50%;background:linear-gradient(145deg,#1976e8,#0754ae);border:4px solid #fff;box-shadow:0 0 0 2px #9dc9ff,0 8px 24px rgba(7,84,174,.35);color:#fff;position:relative}.mta-mobile-bottom .mta-scan .mta-mobile-icon{font-size:30px}.mta-mobile-bottom .mta-scan-label{position:absolute;top:78px;color:#172033;font-size:10px;font-weight:800;white-space:nowrap}
        .mta-mobile-menu{position:fixed;inset:0;background:rgba(15,23,42,.35);z-index:130;display:none;align-items:flex-end;padding:0}.mta-mobile-menu.open{display:flex}.mta-mobile-menu-panel{width:100%;max-height:min(78dvh,620px);overflow:auto;background:#fff;border-radius:24px 24px 0 0;padding:16px 14px calc(18px + var(--mta-mobile-safe));box-shadow:0 -18px 60px rgba(0,0,0,.2)}.mta-mobile-menu-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.mta-mobile-menu-head strong{font-size:18px}.mta-mobile-menu-close{border:0;background:#f1f4f8;width:38px;height:38px;border-radius:50%;font-size:20px}.mta-mobile-menu-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.mta-mobile-menu-grid button{border:1px solid var(--line,#d7dce3);background:#fff;border-radius:14px;min-height:50px;text-align:left;padding:10px;color:#303640;font-weight:650}.mta-mobile-menu-grid button:active{background:#e7f0ff;color:#0754ae}
      }
      @media (max-width:430px){.main{padding-left:9px!important;padding-right:9px!important}.brand strong{max-width:175px}.brand small{max-width:175px}.hero{padding:15px!important}.hero h1{font-size:24px!important}.stats{grid-template-columns:1fr!important}.mta-mobile-record-meta{grid-template-columns:1fr}.mta-mobile-bottom{padding-left:6px;padding-right:6px}.mta-mobile-bottom button{font-size:10px}.mta-mobile-bottom .mta-scan{width:72px;height:72px}.mta-mobile-bottom .mta-scan-wrap{margin-top:-27px}}
      @media (min-width:761px) and (max-width:1024px){.main{padding-left:20px!important;padding-right:20px!important}.mta-mobile-bottom{padding-left:28px;padding-right:28px}.mta-mobile-menu-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media (prefers-reduced-motion:reduce){.mta-mobile-bottom *,.mta-mobile-menu *{transition:none!important;animation:none!important}}
    `;document.head.appendChild(s);
  }
  function show(view){if(typeof window.show==='function'){window.show(view);scheduleSync()}}
  function scan(){if(window.mtaQrCameraV2?.open){window.mtaQrCameraV2.open();return}if(typeof window.p5showQR==='function'){window.p5showQR('MTA-SCAN');return}window.alert('Scanner QR belum siap. Muat ulang halaman setelah koneksi tersedia.')}
  function sync(){
    const current=document.querySelector('#nav button.active')?.dataset.view;
    document.querySelectorAll('#nav button[data-view]').forEach(b=>b.classList.remove('active'));
    if(current)document.querySelectorAll(`[data-mobile-view="${current}"]`).forEach(b=>b.classList.add('active'));
    renderMobileRecords();
  }
  function scheduleSync(){clearTimeout(syncTimer);syncTimer=setTimeout(sync,60)}
  function makeBottom(){
    if(document.getElementById(NAV_ID))return;
    const nav=document.createElement('nav');nav.id=NAV_ID;nav.className='mta-mobile-bottom';nav.setAttribute('aria-label','Navigasi utama mobile');
    [['dashboard','⌂','Beranda'],['detainee','♙','Deteni'],['scan','⌾','Scan QR'],['reports','▤','Laporan'],['menu','☰','Menu']].forEach(([key,icon,label])=>{
      const b=document.createElement('button');b.type='button';b.dataset.mobileView=key==='scan'||key==='menu'?'':key;b.setAttribute('aria-label',label);b.innerHTML=`<span class="mta-mobile-icon">${icon}</span><span>${label}</span>`;
      if(key==='scan'){b.className='mta-scan';const wrap=document.createElement('div');wrap.className='mta-scan-wrap';b.querySelector('span:last-child').className='mta-scan-label';wrap.appendChild(b);nav.appendChild(wrap);b.onclick=scan}
      else if(key==='menu'){b.onclick=openMenu;nav.appendChild(b)}
      else{b.onclick=()=>show(key);nav.appendChild(b)}
    });
    document.body.appendChild(nav);sync();
  }
  function openMenu(){
    let d=document.getElementById(DRAWER_ID);
    if(!d){
      d=document.createElement('div');d.id=DRAWER_ID;d.className='mta-mobile-menu';
      d.innerHTML='<div class="mta-mobile-menu-panel"><div class="mta-mobile-menu-head"><strong>Menu MTA DETENI</strong><button type="button" class="mta-mobile-menu-close" aria-label="Tutup menu">×</button></div><div class="mta-mobile-menu-grid"></div></div>';
      d.addEventListener('click',e=>{if(e.target===d)d.classList.remove('open')});d.querySelector('.mta-mobile-menu-close').onclick=()=>d.classList.remove('open');document.body.appendChild(d);
    }
    const grid=d.querySelector('.mta-mobile-menu-grid');grid.innerHTML='';
    document.querySelectorAll('#nav button[data-view]').forEach(src=>{const b=document.createElement('button');b.type='button';b.textContent=src.textContent.trim();b.onclick=()=>{d.classList.remove('open');show(src.dataset.view)};grid.appendChild(b)});
    d.classList.add('open');
  }
  function renderMobileRecords(){
    const tbody=document.getElementById('dRows');if(!tbody)return;const wrap=tbody.closest('.tablewrap');if(!wrap)return;
    let box=wrap.parentElement.querySelector('.mta-mobile-records');if(!box){box=document.createElement('div');box.className='mta-mobile-records';wrap.after(box)}
    const rows=Array.from(tbody.rows).filter(row=>row.style.display!=='none');
    box.innerHTML='';
    rows.forEach(row=>{const c=row.cells;if(!c||c.length<6)return;const card=document.createElement('article');card.className='mta-mobile-record';const status=(c[3]?.textContent||'').trim();card.innerHTML=`<div class="mta-mobile-record-head"><div><div class="mta-mobile-record-code">${c[0].innerHTML}</div><div class="mta-mobile-record-name">${c[1].textContent}</div></div><span class="mta-mobile-record-status">${status||'—'}</span></div><div class="mta-mobile-record-meta"><span>🌐 ${c[2].textContent||'—'}</span><span>▣ ${c[4].textContent||'—'}</span></div><div class="mta-mobile-record-actions"></div>`;const actions=card.querySelector('.mta-mobile-record-actions');Array.from(c[5].querySelectorAll('button')).forEach(src=>{const b=src.cloneNode(true);b.onclick=src.onclick;actions.appendChild(b)});box.appendChild(card)});
  }
  function observe(){if(observerStarted)return;const root=document.getElementById('appView');if(!root)return;observerStarted=true;new MutationObserver(()=>scheduleSync()).observe(root,{childList:true,subtree:true})}
  function init(){css();makeBottom();observe();scheduleSync()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();window.addEventListener('load',init);
})();
