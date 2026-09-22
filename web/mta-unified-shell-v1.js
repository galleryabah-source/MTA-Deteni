(()=>{
'use strict';
/* MTA DETENI — Unified Integration Shell v1
   Purpose: reconcile existing feature modules into one reachable synthetic runtime.
   No production DB, no real detainee data, AI OFF, migration freeze.
*/
const VERSION='mta-unified-shell-v1';
const BASE=['/desktop-shell-v2.css?v=2','/responsive-v11.css?v=12'];
const SCRIPTS=[
  '/offline-v1.js?v=1',
  '/offline-queue-v1.js?v=1',
  '/qr-context-v1.js?v=1',
  '/qr-camera-v2.js?v=2',
  '/qr-print-clean-v3.js?v=3',
  '/movement-v9.js?v=9',
  '/room-ops-v9.js?v=9',
  '/admin-settings-v9.js?v=9',
  '/master-room-guard-v10.js?v=10',
  '/desktop-shell-v2.js?v=2',
  '/preview-v10.js?v=10',
  '/mobile-shell-v1.js?v=1'
];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=()=>{try{return JSON.parse(localStorage.getItem('mta-deteni-demo-v2')||'{}')}catch{return {}}};
const put=d=>localStorage.setItem('mta-deteni-demo-v2',JSON.stringify(d));
const uid=p=>p+'-'+(crypto.randomUUID?crypto.randomUUID().slice(0,10):Math.random().toString(36).slice(2,12)).toUpperCase();
const audit=(action,type,id,result='SUCCESS')=>{const d=get();d.audit=d.audit||[];d.audit.unshift({id:uid('AUD'),action,resourceType:type,resourceId:id||'',result,occurredAt:new Date().toISOString(),actor:'DEMO-OPERATOR',requestId:uid('REQ'),correlationId:uid('COR'),policyVersion:'AUTHZ-1.0'});put(d)};
function loadStyle(href){return new Promise(resolve=>{if(document.querySelector('link[href^="'+href.split('?')[0]+'"]'))return resolve();const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.onload=resolve;l.onerror=resolve;document.head.appendChild(l)})}
function loadScript(src){return new Promise(resolve=>{if(document.querySelector('script[data-mta-unified-src="'+src.split('?')[0]+'"]'))return resolve();const s=document.createElement('script');s.src=src;s.async=false;s.dataset.mtaUnifiedSrc=src.split('?')[0];s.onload=resolve;s.onerror=()=>{console.warn('MTA module unavailable',src);resolve()};document.head.appendChild(s)})}
function toast(msg){if(typeof window.toast==='function')window.toast(msg);else console.info('[MTA]',msg)}
function navButton(view,label,icon){const nav=document.getElementById('nav');if(!nav||nav.querySelector('[data-view="'+view+'"]'))return;const b=document.createElement('button');b.type='button';b.dataset.view=view;b.textContent=(icon?icon+' ':'')+label;b.onclick=e=>{e.stopPropagation();window.show(view)};nav.appendChild(b)}
function installNav(){
  navButton('monitor','Operational Monitor','◉');
  navButton('ops-queue','Operational Queue','☷');
  navButton('qr-center','QR Center','▣');
  navButton('camera-scan','Scanner Kamera','⌾');
  navButton('room-ops','Room Operations','▥');
  navButton('reports','Laporan','▤');
}
function dashboardMonitor(){
 const d=get(), active=(d.detainees||[]).filter(x=>x.status==='AKTIF').length;
 const rooms=(d.rooms||[]), moves=(d.movements||[]), leaves=(d.leaves||[]);
 const queued=(d.offlineQueueCount||0);
 return '<section class="hero"><h1>Operational Monitor</h1><p class="sub">Satu permukaan untuk memantau state operasional synthetic tanpa mengaktifkan database production.</p></section>'+
 '<div class="grid stats"><div class="card"><div class="label">Deteni Aktif</div><div class="value">'+active+'</div><span class="status">SYNTHETIC</span></div>'+
 '<div class="card"><div class="label">Kamar Master</div><div class="value">'+rooms.length+'</div><span class="status">GOVERNED</span></div>'+
 '<div class="card"><div class="label">Pergerakan</div><div class="value">'+moves.length+'</div><span class="status">LOGGED</span></div>'+
 '<div class="card"><div class="label">Izin</div><div class="value">'+leaves.length+'</div><span class="status">WORKFLOW</span></div>'+
 '<div class="card"><div class="label">Offline Queue</div><div class="value">'+queued+'</div><span class="status">LOCAL</span></div></div>'+
 '<div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-top:12px">'+
 '<section class="card"><h2>Quick Actions</h2><div class="toolbar"><button class="btn primary" onclick="window.show(\'camera-scan\')">⌾ Scan Kamera</button><button class="btn" onclick="window.show(\'qr-center\')">▣ QR Center</button><button class="btn" onclick="window.show(\'movement\')">↔ Pergerakan</button><button class="btn" onclick="window.show(\'room-ops\')">▥ Room Ops</button><button class="btn" onclick="window.show(\'reports\')">▤ Laporan</button></div></section>'+
 '<section class="card"><h2>Runtime Integrity</h2><div class="kpis"><div><div class="label">Data</div><b>SYNTHETIC</b></div><div><div class="label">AI</div><b>OFF</b></div><div><div class="label">DB</div><b>DISCONNECTED</b></div></div></section></div>';
}
function queueView(){
 const d=get(), a=d.audit||[];
 return '<section class="hero"><h1>Operational Queue</h1><p class="sub">Queue material yang dapat ditindaklanjuti. Runtime preview menggunakan audit/event lokal sebagai evidence.</p></section>'+
 '<div class="toolbar"><button class="btn primary" onclick="window.show(\'camera-scan\')">+ Scan Baru</button><button class="btn" onclick="window.show(\'movement\')">Catat Pergerakan</button><button class="btn" onclick="window.show(\'leave\')">Buat Izin</button></div>'+
 '<div class="card"><h2>Recent Events</h2><div class="timeline">'+(a.slice(0,12).map(x=>'<div class="event"><b>'+esc(x.action)+'</b> · '+esc(x.result)+'<small>'+esc(x.resourceType)+' '+esc(x.resourceId)+' · '+new Date(x.occurredAt).toLocaleString('id-ID')+'</small></div>').join('')||'<div class="empty">Belum ada event.</div>')+'</div></div>';
}
function qrCenter(){
 const d=get(), detainees=d.detainees||[], rooms=d.rooms||[], leaves=d.leaves||[];
 const rows=[];
 detainees.forEach(x=>rows.push({kind:'detainee',id:x.id,label:x.code+' — '+x.name,status:x.status}));
 rooms.forEach(x=>rows.push({kind:'room',id:x.id,label:x.block+' / '+x.room,status:x.status}));
 leaves.forEach(x=>rows.push({kind:'leave',id:x.id,label:x.id+' — '+(x.destination||'Izin'),status:x.status}));
 return '<section class="hero"><h1>QR Center</h1><p class="sub">Pusat QR untuk deteni, kamar, dan izin. QR print memakai payload opaque dan audit event.</p></section>'+
 '<div class="toolbar"><button class="btn primary" onclick="window.show(\'camera-scan\')">⌾ Scan Kamera</button></div>'+
 '<div class="tablewrap"><table class="table"><thead><tr><th>Jenis</th><th>Identitas</th><th>Status</th><th>Aksi</th></tr></thead><tbody>'+
 (rows.map(x=>'<tr><td>'+esc(x.kind.toUpperCase())+'</td><td>'+esc(x.label)+'</td><td>'+esc(x.status||'—')+'</td><td><button class="btn small primary" onclick="window.mtaUnifiedPrintQR(\''+esc(x.kind)+'\',\''+esc(x.id)+'\')">Cetak QR</button></td></tr>').join('')||'<tr><td colspan="4" class="empty">Belum ada data yang dapat diberi QR.</td></tr>')+'</tbody></table></div>';
}
function cameraView(){
 return '<section class="hero"><h1>Scanner Kamera</h1><p class="sub">Alur utama: Scan → Resolve → Data → Action. Kamera menggunakan QR engine yang sudah tersedia; Galeri menjadi fallback.</p></section>'+
 '<div class="grid" style="grid-template-columns:1.4fr 1fr;margin-top:12px"><section class="card"><h2>Scanner</h2><div class="notice">Gunakan kamera belakang pada perangkat mobile/tablet. Jika izin kamera tidak tersedia, gunakan Galeri pada scanner.</div><div class="toolbar"><button class="btn primary" onclick="window.mtaQrCameraV2?.open()">⌾ Buka Scanner Kamera</button><input id="mtaUnifiedQrInput" placeholder="Tempel payload QR mta://..." style="padding:9px;border:1px solid var(--line);border-radius:9px;flex:1"><button class="btn" onclick="window.mtaUnifiedResolve(document.getElementById(\'mtaUnifiedQrInput\').value)">Resolve</button></div></section>'+
 '<section class="card"><h2>Contract</h2><div class="kpis"><div><div class="label">Engine</div><b>QR_CODE</b></div><div><div class="label">Context</div><b>VERIFIED</b></div><div><div class="label">Data</div><b>SYNTHETIC</b></div></div></section></div><div id="mtaUnifiedScanResult" class="card" style="margin-top:12px;display:none"></div>';
}
function resolve(raw){
 const value=String(raw||'').trim(), box=document.getElementById('mtaUnifiedScanResult');
 if(!value){toast('Payload QR kosong.');return}
 let m=value.match(/^mta:\/\/(detainee|room|leave)\/([^/]+)\/([^/]+)$/i);
 if(!m){if(box){box.style.display='block';box.innerHTML='<div class="notice">QR tidak sesuai contract <b>mta://kind/id/token</b>. Action dihentikan.</div>'}audit('QR_RESOLVE_FAILED','QR',value,'FAILED');return}
 const kind=m[1].toLowerCase(),id=m[2],token=m[3],d=get();
 const map=kind==='detainee'?d.detainees:kind==='room'?d.rooms:d.leaves;
 const x=(map||[]).find(z=>z.id===id), q=d.qr?.[kind]?.[id];
 let decision='ACCEPTED';
 if(!x)decision='NOT_FOUND'; else if(!q||q.token!==token)decision='TOKEN_MISMATCH'; else if(kind==='detainee'&&x.status!=='AKTIF')decision='INACTIVE';
 if(window.MTAQrContext&&decision==='ACCEPTED'){
   const ctx=kind==='detainee'?'DETAINEE':kind==='leave'?'TEMPORARY_EXIT':'RUDENIM_STAY';
   const v=window.MTAQrContext.verify({issuedAt:new Date(Date.now()-1000).toISOString(),expiresAt:new Date(Date.now()+300000).toISOString(),expectedContext:ctx,context:ctx,activeDetainee:kind!=='detainee'||x.status==='AKTIF'});
   if(v.outcome!=='ACCEPTED')decision=v.outcome;
 }
 if(box){box.style.display='block';box.innerHTML='<h2>Scan Result</h2><div class="notice"><b>'+esc(decision)+'</b><br>Jenis: '+esc(kind)+' · ID: '+esc(id)+'</div>'+
   (decision==='ACCEPTED'?'<div class="toolbar"><button class="btn primary" onclick="window.mtaUnifiedAction(\''+esc(kind)+'\',\''+esc(id)+'\')">Lanjutkan Action</button><button class="btn" onclick="window.mtaUnifiedCloseScanResult()">Tutup</button></div>':'<div class="toolbar"><button class="btn" onclick="window.mtaUnifiedCloseScanResult()">Tutup</button></div>')+'</div>'}
 audit('QR_RESOLVE_'+decision,'QR',id,decision==='ACCEPTED'?'SUCCESS':'DENIED');
}
function action(kind,id){
 const d=get(), x=(kind==='detainee'?d.detainees:kind==='room'?d.rooms:d.leaves||[]).find(z=>z.id===id);
 if(!x){toast('Resource tidak ditemukan.');return}
 if(kind==='detainee'){window.show('detainee');setTimeout(()=>{const q=document.querySelector('#dSearch');if(q){q.value=x.code||id;window.filterDetainee?.()}},50)}
 else if(kind==='room'){window.show('room-ops')}
 else {window.show('leave')}
 audit('QR_ACTION_OPEN',kind.toUpperCase(),id);
}
function installCustomViews(){
 const old=window.show;
 window.show=function(view){
   document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
   if(view==='monitor'){document.getElementById('appView').innerHTML=dashboardMonitor();return}
   if(view==='ops-queue'){document.getElementById('appView').innerHTML=queueView();return}
   if(view==='qr-center'){document.getElementById('appView').innerHTML=qrCenter();return}
   if(view==='camera-scan'){document.getElementById('appView').innerHTML=cameraView();return}
   if(view==='reports'){if(typeof window.documents==='function')return window.documents(document.getElementById('appView'));document.getElementById('appView').innerHTML='<section class="hero"><h1>Laporan</h1><p class="sub">Gunakan menu Dokumen untuk workflow laporan harian.</p></section>' ;return}
   if(view==='room-ops'){if(typeof window.p9refreshRooms==='function')return window.p9refreshRooms();if(typeof window.show==='function'&&view==='room-ops'){}}
   return old(view);
 };
 window.mtaUnifiedResolve=resolve;
 window.mtaUnifiedAction=action;
 window.mtaUnifiedCloseScanResult=()=>{const x=document.getElementById('mtaUnifiedScanResult');if(x)x.style.display='none'};
 window.mtaUnifiedPrintQR=(kind,id)=>{if(typeof window.p6printQR==='function')return window.p6printQR(kind,id);toast('QR print module belum siap.')};
}
function boot(){
 Promise.all(BASE.map(loadStyle)).then(async()=>{
   for(const s of SCRIPTS)await loadScript(s);
   installNav();
   installCustomViews();
   document.documentElement.dataset.mtaUnifiedShell=VERSION;
   document.body.classList.add('mta-unified-runtime');
   setTimeout(()=>{if(typeof window.render==='function')window.render();window.show('monitor')},50);
   window.dispatchEvent(new CustomEvent('mta:unified-ready',{detail:{version:VERSION,scripts:SCRIPTS.length}}));
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();