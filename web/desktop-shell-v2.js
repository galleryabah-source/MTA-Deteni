(()=>{
  'use strict';
  const STYLE_ID='mta-desktop-shell-v2-style';
  const CSS='/desktop-shell-v2.css?v=6';
  const GROUPS={
    dashboard:'UTAMA',
    detainee:'DATA & PENEMPATAN',placement:'DATA & PENEMPATAN',
    movement:'OPERASIONAL',leave:'OPERASIONAL',monitor:'OPERASIONAL','ops-queue':'OPERASIONAL',
    documents:'REKAM & KEPATUHAN',audit:'REKAM & KEPATUHAN',reports:'REKAM & KEPATUHAN',
    'qr-center':'QR & PEMINDAIAN','scan-center':'QR & PEMINDAIAN','leave-qr':'QR & PEMINDAIAN','camera-scan':'QR & PEMINDAIAN',
    'room-ops':'FASILITAS','p6rooms':'FASILITAS','master-block':'FASILITAS','master-room':'FASILITAS','master-operational-catalogs':'FASILITAS','room-transfer-master':'FASILITAS',
    p9settings:'PENGATURAN'
  };
  function loadCss(){if(document.getElementById(STYLE_ID))return;const l=document.createElement('link');l.id=STYLE_ID;l.rel='stylesheet';l.href=CSS;document.head.appendChild(l)}
  const NAV_LABELS={
  dashboard:'Dashboard',detainee:'Data Deteni',placement:'Penempatan',movement:'Pergerakan',leave:'Izin',
  monitor:'Operational Monitor','ops-queue':'Operational Queue','qr-center':'QR Center','scan-center':'Scan Center',
  'leave-qr':'Leave QR','camera-scan':'Camera Scan',documents:'Dokumen',audit:'Audit Trail',reports:'Laporan',
  'room-ops':'Room Ops',p9settings:'Pengaturan'
  };
  const ICONS={
    dashboard:'⌂',detainee:'♙',placement:'▦',movement:'→',leave:'↪',
    documents:'▤',audit:'◷',monitor:'◉','ops-queue':'☷','qr-center':'▦',
    'scan-center':'⌗','leave-qr':'⌁','camera-scan':'⌾',reports:'▤',
    p9settings:'⚙','room-ops':'▥'
  };
  function syncA11y(nav){
    nav.setAttribute('aria-label','Navigasi utama MTA DETENI');
    nav.querySelectorAll('button[data-view]').forEach(b=>{
      const view=b.dataset.view;
      b.dataset.icon=ICONS[view]||'•';
      b.setAttribute('aria-current',b.classList.contains('active')?'page':'false');
      b.title=b.textContent.trim();
    });
  }
  const NAV_ORDER=['dashboard','detainee','placement','movement','leave','monitor','ops-queue','qr-center','scan-center','leave-qr','camera-scan','documents','audit','reports','room-ops','p9settings'];
  function groupNav(nav){
    const buttons=[...nav.querySelectorAll('button[data-view]')];
    const allowed=new Set(NAV_ORDER);
    const seen=new Set();
    buttons.forEach(b=>{
      const view=b.dataset.view;
      if(!allowed.has(view)||seen.has(view)) b.remove();
      else seen.add(view);
    });
    NAV_ORDER.forEach(view=>{
      if(nav.querySelector('button[data-view="'+view+'"]'))return;
      const b=document.createElement('button');
      b.type='button';
      b.dataset.view=view;
      b.textContent=NAV_LABELS[view]||view;
      b.addEventListener('click',()=>{if(typeof window.show==='function')window.show(view)});
      nav.appendChild(b);
    });
    const currentButtons=[...nav.querySelectorAll('button[data-view]')];
    const expectedViews=NAV_ORDER.filter(v=>currentButtons.some(b=>b.dataset.view===v));
    const actualViews=currentButtons.map(b=>b.dataset.view);
    const expectedGroups=[];
    let expectedLast='';
    expectedViews.forEach(v=>{
      const group=GROUPS[v];
      if(group&&group!==expectedLast){expectedGroups.push(group);expectedLast=group}
    });
    const actualGroups=[...nav.querySelectorAll('.mta-desktop-group-label')].map(x=>x.dataset.desktopGroupLabel||x.textContent.trim());
    const alreadyNormalized=
      actualViews.join('|')===expectedViews.join('|') &&
      actualGroups.join('|')===expectedGroups.join('|') &&
      currentButtons.every(b=>b.dataset.desktopGroup===GROUPS[b.dataset.view]);
    if(alreadyNormalized){
      nav.dataset.desktopGrouped='1';
      return;
    }
    nav.querySelectorAll('.mta-desktop-group-label').forEach(x=>x.remove());
    const byView=new Map([...nav.querySelectorAll('button[data-view]')].map(b=>[b.dataset.view,b]));
    NAV_ORDER.forEach(v=>{const b=byView.get(v);if(b&&b.parentElement===nav)nav.appendChild(b)});
    let last='';
    [...nav.querySelectorAll('button[data-view]')].forEach(b=>{
      const group=GROUPS[b.dataset.view];
      if(!group)return;
      b.dataset.desktopGroup=group;
      if(group!==last){
        const label=document.createElement('div');
        label.className='mta-desktop-group-label';
        label.dataset.desktopGroupLabel=group;
        label.textContent=group;
        nav.insertBefore(label,b);
        last=group;
      }
    });
    nav.dataset.desktopGrouped='1';
  }
  function statusStrip(){
    if(document.querySelector('.mta-desktop-status'))return;
    const view=document.querySelector('.view');
    if(!view||!view.parentElement)return;
    const strip=document.createElement('div');strip.className='mta-desktop-status';strip.setAttribute('role','status');
    strip.innerHTML='<span class="dot" aria-hidden="true"></span><span><strong>Runtime:</strong> Local Synthetic · AI OFF · Database NOT CONNECTED · Migration Freeze</span>';
    view.parentElement.insertBefore(strip,view);
  }
  function apply(){
    const desktop=window.matchMedia('(min-width:1025px)').matches;
    document.body.classList.toggle('mta-desktop-enhanced',desktop);
    const nav=document.getElementById('nav');
    if(!desktop||!nav)return;
    groupNav(nav);syncA11y(nav);statusStrip();
  }
  function setup(){
    loadCss();apply();
    const nav=document.getElementById('nav');
    if(nav){
      nav.addEventListener('click',()=>setTimeout(()=>{groupNav(nav);syncA11y(nav)},0),true);
      new MutationObserver(()=>{groupNav(nav);syncA11y(nav)}).observe(nav,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    }
    window.addEventListener('resize',apply,{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
  window.addEventListener('load',setup);
})();