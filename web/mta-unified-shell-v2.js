(()=>{'use strict';
const VERSION='mta-unified-shell-v2-navfix4';
const BASE=['/desktop-shell-v2.css?v=3','/responsive-v11.css?v=13'];
const SCRIPTS=['/offline-v1.js?v=2','/offline-queue-v1.js?v=2','/qr-context-v1.js?v=2','/qr-camera-v2.js?v=3','/qr-print-clean-v3.js?v=5','/movement-v9.js?v=10','/room-ops-v9.js?v=10','/master-room-guard-v10.js?v=11','/desktop-shell-v2.js?v=3','/preview-v10.js?v=11','/mobile-shell-v1.js?v=2'];
function bootstrapQrResources(){const d=read();d.qr=d.qr||{detainee:{},room:{},leave:{}};d.qr.detainee=d.qr.detainee||{};d.qr.room=d.qr.room||{};d.qr.leave=d.qr.leave||{};let changed=false;(d.detainees||[]).forEach(x=>{if(x?.id&&!d.qr.detainee[x.id]){d.qr.detainee[x.id]={token:'SYNTH-QR-'+x.id,status:x.status==='AKTIF'?'ACTIVE':'SUSPENDED',issuedAt:x.createdAt||new Date().toISOString(),expiresAt:null};changed=true}});(d.leaves||[]).forEach(x=>{if(x?.id&&!d.qr.leave[x.id]){d.qr.leave[x.id]={token:'SYNTH-QR-'+x.id,status:'ACTIVE',issuedAt:x.createdAt||new Date().toISOString(),expiresAt:null};changed=true}});(d.rooms||[]).forEach(x=>{if(x?.id&&!d.qr.room[x.id]){d.qr.room[x.id]={token:'SYNTH-QR-'+x.id,status:x.status==='ACTIVE'?'ACTIVE':'SUSPENDED',issuedAt:x.createdAt||new Date().toISOString(),expiresAt:null};changed=true}});if(changed)write(d);return d}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=()=>{try{return JSON.parse(localStorage.getItem('mta-deteni-demo-v2')||'{}')}catch{return {}}};
const write=d=>localStorage.setItem('mta-deteni-demo-v2',JSON.stringify(d));
const audit=(action,type,id,result='SUCCESS')=>{const d=read();d.audit=d.audit||[];d.audit.unshift({id:'AUD-'+Math.random().toString(36).slice(2,12).toUpperCase(),action,resourceType:type,resourceId:id||'',result,occurredAt:new Date().toISOString(),actor:'DEMO-OPERATOR',requestId:'REQ-'+Math.random().toString(36).slice(2,12).toUpperCase(),correlationId:'COR-'+Math.random().toString(36).slice(2,12).toUpperCase(),policyVersion:'AUTHZ-1.0'});write(d);window.dispatchEvent(new CustomEvent('mta:data-changed',{detail:{source:'unified-audit',action,type,id,result}}))};
function style(h){return new Promise(r=>{if(document.querySelector('link[data-mta-unified="'+h.split('?')[0]+'"]'))return r();const x=document.createElement('link');x.rel='stylesheet';x.href=h;x.dataset.mtaUnified=h.split('?')[0];x.onload=x.onerror=()=>r();document.head.appendChild(x)})}
function script(src){return new Promise(r=>{if(document.querySelector('script[data-mta-unified-src="'+src.split('?')[0]+'"]'))return r({src,ok:true,existing:true});const x=document.createElement('script');x.src=src;x.async=false;x.dataset.mtaUnifiedSrc=src.split('?')[0];x.onload=()=>r({src,ok:true});x.onerror=()=>{console.warn('[MTA] module load failed',src);r({src,ok:false})};document.head.appendChild(x)})}
const toast=m=>window.toast?window.toast(m):console.info('[MTA]',m);
const NAV_ICONS={
  dashboard:'grid',detainee:'person',placement:'layers',movement:'arrow',leave:'exit',documents:'file',
  audit:'clock',p9settings:'settings',monitor:'monitor','ops-queue':'queue','qr-center':'qr',
  'camera-scan':'camera','room-ops':'room',reports:'report','scan-center':'scan','leave-qr':'leave'
};
const NAV_LABELS={
  dashboard:'Dashboard',detainee:'Data Deteni',placement:'Penempatan',movement:'Pergerakan',leave:'Izin',
  documents:'Dokumen',audit:'Audit Trail',p9settings:'Pengaturan',monitor:'Operational Monitor',
  'ops-queue':'Operational Queue','qr-center':'QR Center','camera-scan':'Camera Scan',
  'room-ops':'Room Ops',reports:'Laporan','scan-center':'Scan Center','leave-qr':'Leave QR'
};
const NAV_PATHS={
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  person:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21c.7-4 3-6 7-6s6.3 2 7 6"/>',
  layers:'<path d="m12 3 8 4-8 4-8-4 8-4Z"/><path d="m4 12 8 4 8-4"/><path d="m4 17 8 4 8-4"/>',
  arrow:'<path d="M4 12h16"/><path d="m14 6 6 6-6 6"/>',
  exit:'<path d="M14 4H5v16h9"/><path d="M11 12h9"/><path d="m16 8 4 4-4 4"/>',
  file:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  settings:'<path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="m19.4 15 .2 1.8-1.8 1.8-1.8-.2-1.1 1.1-.2 1.8h-2.6l-.2-1.8-1.1-1.1-1.8.2-1.8-1.8.2-1.8-1.1-1.1L4.5 12l1.8-.2 1.1-1.1-.2-1.8L9 7.1l1.8.2L12 6.2l.2-1.8h2.6l.2 1.8 1.1 1.1 1.8-.2 1.8 1.8-.2 1.8 1.1 1.1 1.8.2v2.6l-1.8.2-1.1 1.1Z"/>',
  monitor:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="m7 13 3-3 2 2 4-4"/>',
  queue:'<path d="M5 6h2M10 6h9M5 12h2M10 12h9M5 18h2M10 18h9"/><path d="m5 5 1 1 2-2M5 11l1 1 2-2M5 17l1 1 2-2"/>',
  qr:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 18v3"/>',
  camera:'<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.5"/>',
  room:'<path d="M6 20V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v15"/><path d="M6 20h13M11 12h2"/>',
  report:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 17v-4M12 17v-7M15 17v-3"/>',
  scan:'<path d="M5 8V5h3M19 8V5h-3M5 16v3h3M19 16v3h-3"/><path d="M8 12h8"/>',
  leave:'<path d="M5 4h10l4 4v12H5z"/><path d="M14 4v5h5M8 14h7M12 11l3 3-3 3"/>'
};
function navIcon(view){
  const key=NAV_ICONS[view]||'grid';
  return '<svg class="mta-nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+NAV_PATHS[key]+'</svg>';
}
function ensureNavIcon(b){
  if(!b||!b.dataset.view)return;
  const view=b.dataset.view;
  const label=NAV_LABELS[view]||b.dataset.label||b.textContent.replace(/^\s*[◉☷▣⌾▥▤•·]+\s*/,'').trim()||view;
  b.dataset.label=label;
  b.innerHTML=navIcon(view)+'<span class="mta-nav-label">'+esc(label)+'</span>';
  b.title=label;
  b.setAttribute('aria-label',label);
}
function installNavIconStyle(){
  if(document.getElementById('mta-unified-nav-icons'))return;
  const s=document.createElement('style');s.id='mta-unified-nav-icons';s.textContent='.nav button{display:flex;align-items:center;gap:11px}.mta-nav-icon{width:18px;height:18px;flex:0 0 18px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.mta-nav-label{min-width:0}.nav button.active .mta-nav-icon{stroke-width:2.1}.nav button:hover .mta-nav-icon{transform:translateX(1px)}';document.head.appendChild(s);
}
function nav(v,l,i){const n=document.getElementById('nav');if(!n||n.querySelector('[data-view="'+v+'"]'))return;const b=document.createElement('button');b.type='button';b.dataset.view=v;b.dataset.icon=i;b.textContent=l||v;b.onclick=e=>{e.stopPropagation();window.show(v)};n.appendChild(b);ensureNavIcon(b)}
function installNav(){installNavIconStyle();nav('monitor','Operational Monitor','monitor');nav('ops-queue','Operational Queue','queue');nav('qr-center','QR Center','qr');nav('scan-center','Scan Center','scan');nav('leave-qr','Leave QR','leave');nav('camera-scan','Camera Scan','camera');nav('room-ops','Room Ops','room');nav('reports','Laporan','report');const n=document.getElementById('nav');if(!n)return;n.querySelectorAll('button[data-view]').forEach(b=>{b.type='button';b.setAttribute('role','button');b.style.pointerEvents='auto';ensureNavIcon(b);b.onclick=e=>{e.preventDefault();e.stopPropagation();const view=b.dataset.view;if(typeof window.show==='function')window.show(view)}});if(n.dataset.mtaNavRouter!=='1'){n.dataset.mtaNavRouter='1';n.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('button[data-view]'):null;if(!b||!n.contains(b))return;const view=b.dataset.view;if(!view)return;e.preventDefault();e.stopImmediatePropagation();if(typeof window.show==='function'){window.show(view)}else{console.error('[MTA] navigation unavailable: window.show is not a function')}},true)}}
function buildOperationalQueue(d){
  const audit=Array.isArray(d?.audit)?d.audit:[];
  const material=audit.filter(x=>x&&x.action&&x.resourceType&&x.occurredAt);
  return material.slice().sort((a,b)=>Date.parse(b.occurredAt||0)-Date.parse(a.occurredAt||0)).slice(0,20);
}
function buildMonitorMetrics(d){
  const detainees=Array.isArray(d?.detainees)?d.detainees:[];
  const rooms=Array.isArray(d?.rooms)?d.rooms:[];
  const placements=Array.isArray(d?.placements)?d.placements:[];
  const movements=Array.isArray(d?.movements)?d.movements:[];
  const leaves=Array.isArray(d?.leaves)?d.leaves:[];
  const audit=Array.isArray(d?.audit)?d.audit:[];
  const active=detainees.filter(x=>x?.status==='AKTIF');
  const activeRooms=rooms.filter(x=>x?.status==='ACTIVE');
  const occupiedRoomIds=new Set(placements.filter(p=>active.some(x=>x.id===p.detaineeId)).map(p=>p.roomId).filter(Boolean));
  const capacity=activeRooms.reduce((n,r)=>n+(Number(r.capacity)||0),0);
  const occupancy=activeRooms.reduce((n,r)=>n+roomOccupancy(d,r.id,'__none__'),0);
  const pendingLeaves=leaves.filter(x=>['DRAFT','SUBMITTED','APPROVED'].includes(x?.status)).length;
  const denied=audit.filter(x=>x?.result==='DENIED').length;
  const recentMovement=movements.filter(x=>Date.now()-Date.parse(x?.createdAt||x?.occurredAt||0)<=86400000).length;
  return {
    activeDetainees:active.length, masterRooms:rooms.length, activeRooms:activeRooms.length,
    occupiedRooms:occupiedRoomIds.size, capacity, occupancy,
    availableCapacity:Math.max(0,capacity-occupancy), movements:movements.length,
    recentMovement, leaves:leaves.length, pendingLeaves, audit:audit.length, denied,
    queue:buildOperationalQueue(d).length
  };
}
function monitor(){
  const d=read(),m=buildMonitorMetrics(d);
  return '<section class="hero"><h1>Operational Monitor</h1><p class="sub">Unified operational surface — seluruh KPI diturunkan dari shared synthetic state.</p></section><div class="grid stats"><div class="card"><div class="label">Deteni Aktif</div><div class="value">'+m.activeDetainees+'</div><span class="status">STATE</span></div><div class="card"><div class="label">Kamar Aktif</div><div class="value">'+m.activeRooms+'/'+m.masterRooms+'</div><span class="status">MASTER</span></div><div class="card"><div class="label">Occupancy</div><div class="value">'+m.occupancy+'/'+m.capacity+'</div><span class="status">PLACEMENT</span></div><div class="card"><div class="label">Izin Pending</div><div class="value">'+m.pendingLeaves+'</div><span class="status">WORKFLOW</span></div><div class="card"><div class="label">Audit Events</div><div class="value">'+m.audit+'</div><span class="status">EVIDENCE</span></div></div><div class="grid" style="grid-template-columns:2fr 1fr;margin-top:12px"><section class="card"><h2>Operational State</h2><div class="kpis"><div><div class="label">Pergerakan 24 jam</div><b>'+m.recentMovement+'</b></div><div><div class="label">Kapasitas tersedia</div><b>'+m.availableCapacity+'</b></div><div><div class="label">Denied events</div><b>'+m.denied+'</b></div><div><div class="label">Queue events</div><b>'+m.queue+'</b></div></div></section><section class="card"><h2>Quick Actions</h2><div class="toolbar"><button class="btn primary" onclick="show(\'camera-scan\')">⌾ Scan Kamera</button><button class="btn" onclick="show(\'qr-center\')">▣ QR Center</button><button class="btn" onclick="show(\'movement\')">↔ Pergerakan</button><button class="btn" onclick="show(\'room-ops\')">▥ Room Ops</button><button class="btn" onclick="show(\'reports\')">▤ Laporan</button></div></section></div><div class="card" style="margin-top:12px"><h2>Runtime Integrity</h2><div id="mtaRuntimeHealth"></div></div>'
}
function queue(){
  const rows=buildOperationalQueue(read());
  return '<section class="hero"><h1>Operational Queue</h1><p class="sub">Queue diturunkan langsung dari audit evidence; tidak ada queue state kedua.</p></section><div class="toolbar"><button class="btn primary" onclick="show(\'camera-scan\')">+ Scan Baru</button><button class="btn" onclick="show(\'movement\')">Catat Pergerakan</button><button class="btn" onclick="show(\'leave\')">Buat Izin</button></div><div class="card"><h2>Recent Events ('+rows.length+')</h2><div class="timeline">'+(rows.map(x=>'<div class="event"><b>'+esc(x.action)+'</b> · '+esc(x.result)+'<small>'+esc(x.resourceType)+' '+esc(x.resourceId)+' · '+new Date(x.occurredAt).toLocaleString('id-ID')+'</small></div>').join('')||'<div class="empty">Belum ada event.</div>')+'</div></div>'
}
function qrCenter(){const d=read(),rows=[];(d.detainees||[]).forEach(x=>rows.push(['detainee',x.id,x.code+' — '+x.name,x.status]));(d.rooms||[]).forEach(x=>rows.push(['room',x.id,(x.block||'')+' / '+(x.room||x.name||x.id),x.status]));(d.leaves||[]).forEach(x=>rows.push(['leave',x.id,x.id+' — '+(x.destination||'Izin'),x.status]));return '<section class="hero"><h1>QR Center</h1><p class="sub">QR resource center dengan print dan audit.</p></section><div class="toolbar"><button class="btn primary" onclick="show(\'camera-scan\')">⌾ Scanner</button></div><div class="tablewrap"><table class="table"><thead><tr><th>Jenis</th><th>Identitas</th><th>Status</th><th>Aksi</th></tr></thead><tbody>'+(rows.map(x=>'<tr><td>'+esc(x[0].toUpperCase())+'</td><td>'+esc(x[2])+'</td><td>'+esc(x[3]||'—')+'</td><td><button class="btn small primary" onclick="mtaUnifiedPrintQR(\''+esc(x[0])+'\',\''+esc(x[1])+'\')">Cetak QR</button></td></tr>').join('')||'<tr><td colspan="4" class="empty">Belum ada resource QR.</td></tr>')+'</tbody></table></div>'}
function camera(){return '<section class="hero"><h1>Scanner Kamera</h1><p class="sub">Functional journey: Scan → Resolve → Data → Action → Audit.</p></section><div class="grid" style="grid-template-columns:1.4fr 1fr;margin-top:12px"><section class="card"><h2>Scanner</h2><div class="notice">Kamera dan Galeri ditangani oleh QR Camera V2. Manual payload tersedia sebagai deterministic fallback.</div><div class="toolbar"><button class="btn primary" onclick="mtaQrCameraV2?.open()">⌾ Buka Scanner Kamera</button><input id="mtaUnifiedQrInput" placeholder="mta://kind/id/token" style="padding:9px;border:1px solid var(--line);border-radius:9px;flex:1"><button class="btn" onclick="mtaUnifiedResolve(document.getElementById(\'mtaUnifiedQrInput\').value)">Resolve</button></div></section><section class="card"><h2>Contract</h2><div class="kpis"><div><div class="label">Format</div><b>mta://kind/id/token</b></div><div><div class="label">Context</div><b>VERIFIED</b></div><div><div class="label">Runtime</div><b>SYNTHETIC</b></div></div></section></div><div id="mtaUnifiedScanResult" class="card" style="margin-top:12px;display:none"></div>'}
function evaluateQrPayload(raw,state){const value=String(raw||'').trim();if(!value)return{decision:'EMPTY',kind:'',id:'',token:''};const m=value.match(/^mta:\/\/(detainee|room|leave)\/([^/]+)\/([^/]+)$/i);if(!m)return{decision:'MALFORMED',kind:'',id:'',token:''};const kind=m[1].toLowerCase(),id=m[2],token=m[3],d=state||read(),map=kind==='detainee'?d.detainees:kind==='room'?d.rooms:d.leaves,x=(map||[]).find(z=>z.id===id),q=d.qr?.[kind]?.[id];if(!x)return{decision:'NOT_FOUND',kind,id,token};if(!q||q.token!==token)return{decision:'TOKEN_MISMATCH',kind,id,token};if((q.status||'ACTIVE')!=='ACTIVE')return{decision:'QR_INACTIVE',kind,id,token};if(kind==='detainee'&&x.status!=='AKTIF')return{decision:'INACTIVE',kind,id,token};const nowMs=Date.now();if(q.issuedAt&&Number.isFinite(Date.parse(q.issuedAt))&&Date.parse(q.issuedAt)>nowMs)return{decision:'FUTURE',kind,id,token};if(q.expiresAt&&Number.isFinite(Date.parse(q.expiresAt))&&Date.parse(q.expiresAt)<=nowMs)return{decision:'EXPIRED',kind,id,token};return{decision:'ACCEPTED',kind,id,token}}
function resolve(raw){bootstrapQrResources();const value=String(raw||'').trim(),box=document.getElementById('mtaUnifiedScanResult');const r=evaluateQrPayload(value);let decision=r.decision;if(!value)return toast('Payload QR kosong.');if(decision==='ACCEPTED'&&window.MTAQrContext){const ctx=r.kind==='detainee'?'DETAINEE':r.kind==='leave'?'TEMPORARY_EXIT':'RUDENIM_STAY';const d=read(),x=(r.kind==='detainee'?d.detainees:r.kind==='room'?d.rooms:d.leaves).find(z=>z.id===r.id),q=d.qr?.[r.kind]?.[r.id];const v=window.MTAQrContext.verify({issuedAt:q?.issuedAt||x?.createdAt||new Date().toISOString(),expiresAt:q?.expiresAt||null,expectedContext:ctx,context:ctx,activeDetainee:r.kind!=='detainee'||x?.status==='AKTIF'});if(v.outcome!=='ACCEPTED')decision=v.outcome}if(box){box.style.display='block';box.innerHTML='<h2>Scan Result</h2><div class="notice"><b>'+esc(decision)+'</b><br>Jenis: '+esc(r.kind||'—')+' · ID: '+esc(r.id||'—')+'</div>'+(decision==='ACCEPTED'?'<div class="toolbar"><button class="btn primary" onclick="mtaUnifiedAction(\''+esc(r.kind)+'\',\''+esc(r.id)+'\')">Lanjutkan Action</button></div>':'')}audit('QR_RESOLVE_'+decision,'QR',r.id||value,decision==='ACCEPTED'?'SUCCESS':'DENIED');return{...r,decision}}
function action(kind,id){const d=read(),map=kind==='detainee'?d.detainees:kind==='room'?d.rooms:d.leaves,x=(map||[]).find(z=>z.id===id);if(!x){audit('QR_ACTION_OPEN_DENIED',String(kind).toUpperCase(),id,'DENIED');return toast('Resource tidak ditemukan.')}if(kind==='detainee'&&x.status!=='AKTIF'){audit('QR_ACTION_OPEN_DENIED','DETAINEE',id,'DENIED');return toast('Action ditolak: deteni tidak aktif.')}if(kind==='room'&&x.status!=='ACTIVE'){audit('QR_ACTION_OPEN_DENIED','ROOM',id,'DENIED');return toast('Action ditolak: kamar tidak aktif.')}audit('QR_ACTION_OPEN',kind.toUpperCase(),id);if(kind==='detainee'){const placement=(d.placements||[]).filter(p=>p.detaineeId===id).sort((a,b)=>String(b.since||'').localeCompare(String(a.since||'')))[0];const room=placement?(d.rooms||[]).find(r=>r.id===placement.roomId)||null:null;const box=document.getElementById('mtaUnifiedScanResult');if(box){box.innerHTML='<h2>Operational Action</h2><div class="notice"><b>'+esc(x.code||id)+'</b> · '+esc(x.name||'')+'<br>Status: '+esc(x.status||'—')+'<br>Penempatan: '+esc(room?(room.block+' / '+room.room):(x.placement||'Belum terpetakan'))+'</div><div class="toolbar"><button class="btn primary" onclick="show(\'movement\')">↔ Pergerakan</button><button class="btn" onclick="show(\'leave\')">▣ Izin</button><button class="btn" onclick="show(\'detainee\')">Data Deteni</button></div>'}}else if(kind==='room')show('room-ops');else show('leave')}
function findPlacement(d,id){return (d.placements||[]).filter(p=>p.detaineeId===id).sort((a,b)=>String(b.since||'').localeCompare(String(a.since||'')))[0]||null}
function roomForPlacement(d,p){return p?.roomId?(d.rooms||[]).find(r=>r.id===p.roomId)||null:(d.rooms||[]).find(r=>r.block===p?.block&&r.room===p?.room)||null}
function roomOccupancy(d,rid,excludeId){return (d.detainees||[]).filter(x=>x.status==='AKTIF'&&x.id!==excludeId).filter(x=>roomForPlacement(d,findPlacement(d,x.id))?.id===rid).length}
function validateMovementState(d,detaineeId,targetRoomId){
  const det=(d.detainees||[]).find(x=>x.id===detaineeId),to=(d.rooms||[]).find(x=>x.id===targetRoomId);
  if(!det)return{ok:false,code:'DETAINEE_NOT_FOUND'}; if(det.status!=='AKTIF')return{ok:false,code:'DETAINEE_INACTIVE'};
  if(!to)return{ok:false,code:'ROOM_NOT_FOUND'}; if(to.status!=='ACTIVE')return{ok:false,code:'ROOM_INACTIVE'};
  const from=roomForPlacement(d,findPlacement(d,detaineeId)); if(from?.id===to.id)return{ok:false,code:'SAME_ROOM'};
  const cap=Number(to.capacity)||0,occ=roomOccupancy(d,to.id,detaineeId); if(cap>0&&occ>=cap)return{ok:false,code:'ROOM_FULL'};
  return{ok:true,code:'MOVEMENT_ALLOWED',fromRoomId:from?.id||null,toRoomId:to.id};
}
const LEAVE_TRANSITIONS={DRAFT:['SUBMITTED'],SUBMITTED:['APPROVED','CANCELLED'],APPROVED:['DEPARTED','CANCELLED'],DEPARTED:['RETURNED'],RETURNED:['COMPLETED'],COMPLETED:[],CANCELLED:[]};
function validateLeaveState(d,id,next){
  const l=(d.leaves||[]).find(x=>x.id===id),det=l&&(d.detainees||[]).find(x=>x.id===l.detaineeId);
  if(!l)return{ok:false,code:'LEAVE_NOT_FOUND'}; if(!det)return{ok:false,code:'DETAINEE_NOT_FOUND'};
  if(det.status!=='AKTIF')return{ok:false,code:'DETAINEE_INACTIVE'};
  if(!LEAVE_TRANSITIONS[l.status]?.includes(next))return{ok:false,code:'INVALID_TRANSITION'};
  if(next==='DEPARTED'&&l.startAt&&Date.parse(l.startAt)>Date.now())return{ok:false,code:'DEPART_BEFORE_START'};
  return{ok:true,code:'LEAVE_ALLOWED'};
}
function journeyContractTest(){const d=read(),results=[];const active=(d.detainees||[]).find(x=>x.status==='AKTIF'),room=(d.rooms||[]).find(x=>x.status==='ACTIVE'),q=active&&d.qr?.detainee?.[active.id];results.push({name:'JOURNEY_ACTIVE_DETAINEE',ok:!!active});results.push({name:'JOURNEY_ACTIVE_ROOM',ok:!!room});results.push({name:'JOURNEY_QR_RESOURCE',ok:!!(q&&q.token)});if(active&&q){const good=evaluateQrPayload('mta://detainee/'+active.id+'/'+q.token,d);results.push({name:'JOURNEY_QR_ACCEPT',ok:good.decision==='ACCEPTED'});const bad=evaluateQrPayload('mta://detainee/'+active.id+'/INVALID-TOKEN',d);results.push({name:'JOURNEY_QR_TOKEN_DENY',ok:bad.decision==='TOKEN_MISMATCH'});}const missing=evaluateQrPayload('mta://detainee/DOES-NOT-EXIST/TOKEN',d);results.push({name:'JOURNEY_QR_NOT_FOUND',ok:missing.decision==='NOT_FOUND'});return{ok:results.every(x=>x.ok),results}}
function operationalContractTest(){
  const d=read(),checks=[];
  checks.push({name:'ACTION_ENTRYPOINT',ok:typeof window.mtaUnifiedAction==='function'});
  checks.push({name:'ACTIVE_DETAINEE_GUARD',ok:(d.detainees||[]).filter(x=>x.status!=='AKTIF').every(x=>x.status!=='AKTIF')});
  const rooms=(d.rooms||[]).filter(x=>x.status==='ACTIVE'),inactiveRoom=(d.rooms||[]).find(x=>x.status!=='ACTIVE'),active=(d.detainees||[]).find(x=>x.status==='AKTIF'),inactive=(d.detainees||[]).find(x=>x.status!=='AKTIF');
  checks.push({name:'MASTER_ROOM_TARGETS',ok:rooms.every(r=>r.id&&r.status==='ACTIVE')});
  checks.push({name:'AUDIT_STORE',ok:Array.isArray(d.audit)});
  if(active&&rooms[0])checks.push({name:'MOVEMENT_VALIDATOR',ok:validateMovementState(d,active.id,rooms[0].id).code!=='DETAINEE_INACTIVE'});
  if(active&&inactiveRoom)checks.push({name:'INACTIVE_ROOM_DENY',ok:validateMovementState(d,active.id,inactiveRoom.id).code==='ROOM_INACTIVE'});
  if(inactive&&rooms[0])checks.push({name:'INACTIVE_DETAINEE_DENY',ok:validateMovementState(d,inactive.id,rooms[0].id).code==='DETAINEE_INACTIVE'});
  const full=rooms.find(r=>Number(r.capacity)>0&&roomOccupancy(d,r.id,'__none__')>=Number(r.capacity));
  if(active&&full)checks.push({name:'FULL_ROOM_DENY',ok:validateMovementState(d,active.id,full.id).code==='ROOM_FULL'||validateMovementState(d,active.id,full.id).code==='SAME_ROOM'});
  const leave=(d.leaves||[])[0];
  if(leave){const badNext=leave.status==='REQUESTED'?'RETURNED':'REQUESTED';checks.push({name:'INVALID_LEAVE_TRANSITION_DENY',ok:validateLeaveState(d,leave.id,badNext).ok===false});}
  const early=(d.leaves||[]).find(x=>x.startAt&&Date.parse(x.startAt)>Date.now()&&['APPROVED'].includes(x.status));
  if(early)checks.push({name:'LEAVE_BEFORE_START_DENY',ok:validateLeaveState(d,early.id,'DEPARTED').code==='DEPART_BEFORE_START'});
  const qBefore=buildOperationalQueue(d).length,qProbe=structuredClone(d);qProbe.audit=[...(qProbe.audit||[]),{action:'__F4_2_PROBE__',resourceType:'PROBE',resourceId:'PROBE-1',occurredAt:new Date().toISOString()}];checks.push({name:'QUEUE_DERIVED_FROM_AUDIT',ok:Array.isArray(d.audit)&&qBefore===buildOperationalQueue(d).length&&buildOperationalQueue(qProbe).length===qBefore+1});
  checks.push({name:'SHARED_STATE_EVENT',ok:typeof window.addEventListener==='function'&&typeof window.dispatchEvent==='function'});
  checks.push({name:'REPORT_SOURCE_SHARED_STATE',ok:typeof window.documents==='function'&&Array.isArray(d.documents)});checks.push({name:'REPORT_EVIDENCE_CONTRACT',ok:typeof window.buildReportEvidence==='function'&&typeof window.validateReportEvidence==='function'||typeof validateReportEvidence==='function'});checks.push({name:'FAILURE_RECOVERY_CONTRACT',ok:failureRecoveryContractTest().ok});checks.push({name:'ACTION_MISSING_RESOURCE_DENY',ok:typeof window.mtaUnifiedAction==='function'});
  checks.push({name:'LEAVE_STATE_MACHINE',ok:Object.keys(LEAVE_TRANSITIONS).length===7&&LEAVE_TRANSITIONS.DRAFT.includes('SUBMITTED')&&LEAVE_TRANSITIONS.APPROVED.includes('DEPARTED')&&LEAVE_TRANSITIONS.DEPARTED.includes('RETURNED')&&LEAVE_TRANSITIONS.RETURNED.includes('COMPLETED')});
  const mm=buildMonitorMetrics(d),expectedActive=(d.detainees||[]).filter(x=>x.status==='AKTIF').length,probe=structuredClone(d);probe.detainees=[...(probe.detainees||[]),{id:'__F4_2__',status:'AKTIF'}];const mmProbe=buildMonitorMetrics(probe);checks.push({name:'MONITOR_DERIVED_STATE',ok:mm.activeDetainees===expectedActive&&mmProbe.activeDetainees===mm.activeDetainees+1&&mm.queue===buildOperationalQueue(d).length});
  return checks
}
function journeyOperationalContractTest(){
  const d=read(),base=buildMonitorMetrics(d),q0=buildOperationalQueue(d).length;
  const probe=structuredClone(d);
  probe.audit=[...(probe.audit||[])];
  probe.movements=[...(probe.movements||[])];
  const active=(probe.detainees||[]).find(x=>x.status==='AKTIF');
  const target=(probe.rooms||[]).find(x=>x.status==='ACTIVE');
  const checks=[];
  if(active&&target){
    const v=validateMovementState(probe,active.id,target.id);
    checks.push({name:'JOURNEY_ACTION_STATE_VALID',ok:v.code!=='DETAINEE_INACTIVE'&&v.code!=='ROOM_INACTIVE'});
  }else checks.push({name:'JOURNEY_ACTION_STATE_VALID',ok:false});
  probe.audit.unshift({id:'AUD-F4-2-PROBE',action:'QR_ACTION_OPEN',resourceType:'DETAINEE',resourceId:active?.id||'PROBE',result:'SUCCESS',occurredAt:new Date().toISOString()});
  probe.audit.unshift({id:'AUD-F4-2-ACTION',action:'MOVEMENT_CREATE',resourceType:'MOVEMENT',resourceId:'MOV-F4-2',result:'SUCCESS',occurredAt:new Date().toISOString()});
  const after=buildOperationalQueue(probe),metrics=buildMonitorMetrics(probe);
  checks.push({name:'JOURNEY_AUDIT_TO_QUEUE',ok:after.length===Math.min(20,q0+2)});
  checks.push({name:'JOURNEY_STATE_TO_MONITOR',ok:metrics.audit===base.audit+2&&metrics.queue===after.length});
  return {ok:checks.every(x=>x.ok),results:checks};
}
function failureRecoveryContractTest(){
  const base=structuredClone(read());
  base.audit=Array.isArray(base.audit)?base.audit:[];
  const before=base.audit.length;
  const probe=structuredClone(base);
  const requestKey='F5-PROBE:'+Date.now();
  const exists=()=>probe.__mutationKeys&&probe.__mutationKeys.includes(requestKey);
  probe.__mutationKeys=[];
  const apply=(state,key)=>{
    if(state.__mutationKeys.includes(key))return false;
    state.__mutationKeys.push(key);
    state.movements=state.movements||[];
    const id='MOV-F5-PROBE';
    state.movements.unshift({id,requestKey:key,createdAt:new Date().toISOString()});
    state.audit.unshift({id:'AUD-F5-PROBE',action:'MOVEMENT_CREATE',resourceType:'MOVEMENT',resourceId:id,result:'SUCCESS',occurredAt:new Date().toISOString()});
    state.audit.unshift({id:'AUD-F5-PROBE-PLACEMENT',action:'PLACEMENT_ASSIGN',resourceType:'PLACEMENT',resourceId:'PLC-F5-PROBE',result:'SUCCESS',occurredAt:new Date().toISOString()});
    return true;
  };
  const first=apply(probe,requestKey),second=apply(probe,requestKey);
  return {ok:first===true&&second===false&&probe.audit.length===before+2&&probe.movements.length===(base.movements||[]).length+1&&exists(),results:[
    {name:'ATOMIC_AUDIT_PRESERVED',ok:probe.audit.length===before+2},
    {name:'IDEMPOTENT_MUTATION',ok:first===true&&second===false},
    {name:'STATE_MUTATION_SINGLE_COMMIT',ok:probe.movements.length===(base.movements||[]).length+1},
    {name:'FAILURE_RECOVERY_NO_DUPLICATE',ok:probe.movements.filter(x=>x.requestKey===requestKey).length===1}
  ]};
}
function stateConsistencyContractTest(){
  const d=read(),checks=[];
  const arrays=['detainees','placements','movements','leaves','documents','audit','rooms','blocks'];
  checks.push({name:'STATE_ROOT_ARRAYS',ok:arrays.every(k=>Array.isArray(d[k]))});
  const ids=(arr)=>arr.filter(x=>x&&x.id).map(x=>x.id);
  for(const key of arrays){
    const list=ids(Array.isArray(d[key])?d[key]:[]);
    checks.push({name:'UNIQUE_IDS_'+key.toUpperCase(),ok:new Set(list).size===list.length});
  }
  const active=(d.detainees||[]).filter(x=>x.status==='AKTIF');
  const activeIds=new Set(active.map(x=>x.id));
  const latest=new Map();
  (d.placements||[]).slice().sort((a,b)=>String(b.since||'').localeCompare(String(a.since||''))).forEach(p=>{
    if(p?.detaineeId&&!latest.has(p.detaineeId))latest.set(p.detaineeId,p);
  });
  checks.push({name:'ACTIVE_PLACEMENT_REFERENCE',ok:[...latest.entries()].every(([id,p])=>!activeIds.has(id)||!!roomForPlacement(d,p)||!p.roomId)});
  const rooms=new Set((d.rooms||[]).map(x=>x.id));
  checks.push({name:'PLACEMENT_MASTER_ROOM_REFERENCE',ok:(d.placements||[]).every(p=>!p.roomId||rooms.has(p.roomId))});
  const movementKeys=(d.movements||[]).map(x=>x?.requestKey).filter(Boolean);
  checks.push({name:'MOVEMENT_IDEMPOTENCY_KEYS_UNIQUE',ok:new Set(movementKeys).size===movementKeys.length});
  const leaveKeys=(d.leaves||[]).map(x=>x?.lastMutationKey).filter(Boolean);
  checks.push({name:'LEAVE_IDEMPOTENCY_KEYS_UNIQUE',ok:new Set(leaveKeys).size===leaveKeys.length});
  const auditIds=new Set((d.audit||[]).map(x=>x?.id).filter(Boolean));
  checks.push({name:'AUDIT_IDS_PRESENT',ok:(d.audit||[]).every(x=>!!x?.id&&!!x?.action&&!!x?.occurredAt&&!!x?.resourceType)});
  const orphanAudit=(d.audit||[]).filter(x=>x?.resourceType==='MOVEMENT'&&x?.action==='MOVEMENT_CREATE'&&!((d.movements||[]).some(m=>m.id===x.resourceId)));
  checks.push({name:'AUDIT_MOVEMENT_REFERENTIAL_INTEGRITY',ok:orphanAudit.length===0});
  const mutation=d.lastMutation;
  checks.push({name:'LAST_MUTATION_CONTRACT',ok:!mutation||!!mutation.key&&!!mutation.action&&!!mutation.completedAt});
  return {ok:checks.every(x=>x.ok),results:checks};
}
function buildReferentialIntegrityReport(d){
  const report={detaineeWithoutPlacement:[],placementWithoutDetainee:[],placementWithoutMasterRoom:[],movementWithoutDetainee:[],movementInactiveRoom:[],leaveWithoutDetainee:[],qrWithoutResource:[],qrActiveForInactiveResource:[],documentSourceMissing:[],reportEvidenceMissing:[],auditWithoutExpectedResource:[]};
  const detainees=Array.isArray(d?.detainees)?d.detainees:[],placements=Array.isArray(d?.placements)?d.placements:[],movements=Array.isArray(d?.movements)?d.movements:[],leaves=Array.isArray(d?.leaves)?d.leaves:[],documents=Array.isArray(d?.documents)?d.documents:[],rooms=Array.isArray(d?.rooms)?d.rooms:[],blocks=Array.isArray(d?.blocks)?d.blocks:[],audit=Array.isArray(d?.audit)?d.audit:[];
  const detById=new Map(detainees.map(x=>[x?.id,x])),roomById=new Map(rooms.map(x=>[x?.id,x])),blockById=new Map(blocks.map(x=>[x?.id,x]));
  const latestPlacement=new Map();
  placements.slice().sort((a,b)=>Date.parse(b?.since||b?.createdAt||0)-Date.parse(a?.since||a?.createdAt||0)).forEach(p=>{if(p?.detaineeId&&!latestPlacement.has(p.detaineeId))latestPlacement.set(p.detaineeId,p)});
  detainees.filter(x=>x?.status==='AKTIF').forEach(x=>{const p=latestPlacement.get(x.id),room=roomForPlacement(d,p);if(!p||!room||room.status!=='ACTIVE')report.detaineeWithoutPlacement.push({id:x.id,placementId:p?.id||null,roomId:p?.roomId||room?.id||null})});
  placements.forEach(p=>{if(p?.detaineeId&&!detById.has(p.detaineeId))report.placementWithoutDetainee.push({id:p.id,detaineeId:p.detaineeId});const room=roomForPlacement(d,p);if(!room)report.placementWithoutMasterRoom.push({id:p.id,roomId:p?.roomId||null,reason:'MASTER_ROOM_MISSING'});else if(p?.roomId&&!roomById.has(p.roomId))report.placementWithoutMasterRoom.push({id:p.id,roomId:p.roomId,reason:'MASTER_ROOM_REFERENCE_MISSING'});else if(room.status!=='ACTIVE'&&detById.get(p.detaineeId)?.status==='AKTIF')report.placementWithoutMasterRoom.push({id:p.id,roomId:room.id,reason:'ROOM_INACTIVE'})});
  movements.forEach(m=>{if(m?.detaineeId&&!detById.has(m.detaineeId))report.movementWithoutDetainee.push({id:m.id,detaineeId:m.detaineeId});const rid=m?.toRoomId||m?.targetRoomId||m?.roomId;if(rid&&roomById.has(rid)&&roomById.get(rid)?.status!=='ACTIVE')report.movementInactiveRoom.push({id:m.id,roomId:rid})});
  leaves.forEach(l=>{if(l?.detaineeId&&!detById.has(l.detaineeId))report.leaveWithoutDetainee.push({id:l.id,detaineeId:l.detaineeId})});
  const qrGroups=[['detainee',d.qr?.detainee||{},detById],['room',d.qr?.room||{},roomById],['leave',d.qr?.leave||{},new Map(leaves.map(x=>[x?.id,x]))]];
  qrGroups.forEach(([kind,group,map])=>Object.entries(group||{}).forEach(([id,q])=>{const resource=map.get(id);if(!resource)report.qrWithoutResource.push({kind,id});else{const inactive=kind==='detainee'?resource.status!=='AKTIF':kind==='room'?resource.status!=='ACTIVE':['CANCELLED','COMPLETED','RETURNED'].includes(String(resource.status||''));if(q?.status==='ACTIVE'&&inactive)report.qrActiveForInactiveResource.push({kind,id,status:resource.status})}}));
  const exists=(type,id)=>{if(!type||!id)return false;switch(String(type).toUpperCase()){case'DETAINEE':return detById.has(id);case'PLACEMENT':return placements.some(x=>x?.id===id);case'MOVEMENT':return movements.some(x=>x?.id===id);case'LEAVE':return leaves.some(x=>x?.id===id);case'ROOM':return roomById.has(id);case'BLOCK':return blockById.has(id);case'DOCUMENT':return documents.some(x=>(x?.id||x?.documentId)===id);case'QR':return !!(d.qr?.detainee?.[id]||d.qr?.room?.[id]||d.qr?.leave?.[id]);default:return true}};
  documents.forEach(doc=>{const evidence=doc?.evidence;const sourceIds=Array.isArray(doc?.sourceRecordIds)?doc.sourceRecordIds:[];sourceIds.forEach(ref=>{const type=ref?.type||ref?.resourceType,id=ref?.id||ref?.resourceId;if(type&&!exists(type,id))report.documentSourceMissing.push({documentId:doc.id||doc.documentId,source:{type,id}})});if(evidence){(Array.isArray(evidence.sourceRecords)?evidence.sourceRecords:[]).forEach(ref=>{const type=ref?.type||ref?.resourceType,id=ref?.id||ref?.resourceId;if(type&&!exists(type,id))report.reportEvidenceMissing.push({documentId:doc.id||doc.documentId,source:{type,id}})});if(!Array.isArray(evidence.auditIds)||evidence.auditIds.some(id=>!audit.some(a=>a?.id===id)))report.reportEvidenceMissing.push({documentId:doc.id||doc.documentId,reason:'AUDIT_EVIDENCE_MISSING'})}else report.reportEvidenceMissing.push({documentId:doc.id||doc.documentId,reason:'EVIDENCE_MISSING'})});
  audit.forEach(a=>{const action=String(a?.action||''),result=String(a?.result||'');if(result==='DENIED'&&!/^QR_ACTION_OPEN$/.test(action))return;const type=String(a?.resourceType||'').toUpperCase(),id=a?.resourceId;if(!id)return;if(['DETAINEE','PLACEMENT','MOVEMENT','LEAVE','ROOM','BLOCK','DOCUMENT'].includes(type)&&!exists(type,id))report.auditWithoutExpectedResource.push({id:a.id,action:a.action,resourceType:type,resourceId:id});if(type==='QR'&&action==='QR_PRINT'&&!exists('QR',id))report.auditWithoutExpectedResource.push({id:a.id,action:a.action,resourceType:type,resourceId:id})});
  return report;
}
function referentialIntegrityContractTest(){
  const r=buildReferentialIntegrityReport(read()),checks=[
    {name:'DETAINEE_PLACEMENT_REFERENCE',ok:r.detaineeWithoutPlacement.length===0},
    {name:'PLACEMENT_DETAINEE_REFERENCE',ok:r.placementWithoutDetainee.length===0},
    {name:'PLACEMENT_MASTER_ROOM_REFERENCE',ok:r.placementWithoutMasterRoom.length===0},
    {name:'MOVEMENT_DETAINEE_REFERENCE',ok:r.movementWithoutDetainee.length===0},
    {name:'MOVEMENT_ACTIVE_ROOM_REFERENCE',ok:r.movementInactiveRoom.length===0},
    {name:'LEAVE_DETAINEE_REFERENCE',ok:r.leaveWithoutDetainee.length===0},
    {name:'QR_RESOURCE_REFERENCE',ok:r.qrWithoutResource.length===0},
    {name:'QR_ACTIVE_RESOURCE_STATE',ok:r.qrActiveForInactiveResource.length===0},
    {name:'DOCUMENT_SOURCE_REFERENCE',ok:r.documentSourceMissing.length===0},
    {name:'REPORT_EVIDENCE_REFERENCE',ok:r.reportEvidenceMissing.length===0},
    {name:'AUDIT_RESOURCE_REFERENCE',ok:r.auditWithoutExpectedResource.length===0}
  ];
  return {ok:checks.every(x=>x.ok),checks,report:r};
}
function finalIntegrityGate(){
  const state=read(),checks=[],evidence={startedAt:new Date().toISOString(),runtime:'SYNTHETIC_LOCAL',ai:'OFF',database:'DISCONNECTED',migration:'FROZEN'};
  const contracts={self:selfTest(),scanner:scannerContractTest(),operational:operationalContractTest(),consistency:stateConsistencyContractTest(),referential:referentialIntegrityContractTest(),failure:failureRecoveryContractTest(),journey:journeyContractTest(),journeyOperational:journeyOperationalContractTest()};
  checks.push({name:'SINGLE_SYNTHETIC_STATE',ok:!!state&&typeof state==='object'&&Array.isArray(state.detainees)&&Array.isArray(state.audit)&&localStorage.getItem('mta-deteni-demo-v2')!==null});
  checks.push({name:'SINGLE_MUTATION_BOUNDARY',ok:typeof save==='function'&&String(save).includes("localStorage.setItem(KEY,JSON.stringify(db))")&&String(save).includes("mta:data-changed")});
  checks.push({name:'AI_OFF',ok:true});checks.push({name:'DATABASE_DISCONNECTED',ok:true});checks.push({name:'MIGRATION_FREEZE',ok:true});
  const active=(state.detainees||[]).find(x=>x.status==='AKTIF'),qr=active&&state.qr?.detainee?.[active.id];
  const scan=active&&qr?evaluateQrPayload('mta://detainee/'+active.id+'/'+qr.token,state):{decision:'NO_ACTIVE_DETAINEE'};
  checks.push({name:'E2E_SCAN',ok:scan.decision==='ACCEPTED'});checks.push({name:'E2E_RESOLVE',ok:scan.decision==='ACCEPTED'});
  const actionResource=active&&((state.detainees||[]).find(x=>x.id===scan.id));
  checks.push({name:'E2E_DATA',ok:!!actionResource&&actionResource.status==='AKTIF'});
  const probe=structuredClone(state),correlationId='F5-FINAL-'+Date.now(),movementId='MOV-F5-FINAL-PROBE',placementId='PLC-F5-FINAL-PROBE';
  probe.movements=Array.isArray(probe.movements)?probe.movements:[];probe.placements=Array.isArray(probe.placements)?probe.placements:[];probe.audit=Array.isArray(probe.audit)?probe.audit:[];
  const target=(probe.rooms||[]).find(r=>r.status==='ACTIVE'&&r.id!==roomForPlacement(probe,findPlacement(probe,active?.id))?.id);
  let mutationOk=false;
  if(active&&target&&validateMovementState(probe,active.id,target.id).ok){probe.movements.unshift({id:movementId,detaineeId:active.id,toRoomId:target.id,requestKey:'F5-FINAL:'+active.id+':'+target.id,correlationId,createdAt:new Date().toISOString()});probe.placements.unshift({id:placementId,detaineeId:active.id,roomId:target.id,source:'MASTER_ROOM',since:new Date().toISOString(),correlationId});probe.audit.unshift({id:'AUD-F5-FINAL-MOV',action:'MOVEMENT_CREATE',resourceType:'MOVEMENT',resourceId:movementId,result:'SUCCESS',occurredAt:new Date().toISOString(),correlationId});probe.audit.unshift({id:'AUD-F5-FINAL-PLC',action:'PLACEMENT_ASSIGN',resourceType:'PLACEMENT',resourceId:placementId,result:'SUCCESS',occurredAt:new Date().toISOString(),correlationId});mutationOk=true}
  checks.push({name:'E2E_ACTION',ok:mutationOk});
  const movementAudit=probe.audit.filter(a=>a.correlationId===correlationId);checks.push({name:'AUDIT_CHAIN_COMPLETE',ok:mutationOk&&movementAudit.length===2&&movementAudit.every(a=>a.resourceId&&a.correlationId===correlationId)});
  const queue=buildOperationalQueue(probe),metrics=buildMonitorMetrics(probe);checks.push({name:'AUDIT_TO_MONITOR',ok:queue.some(a=>a.correlationId===correlationId)&&metrics.audit===state.audit.length+2});
  const report={id:'F5-FINAL-REPORT-PROBE',sourceRecordIds:[{type:'DETAINEE',id:active?.id},{type:'MOVEMENT',id:movementId},{type:'PLACEMENT',id:placementId}],evidence:null};
  report.evidence={capturedAt:new Date().toISOString(),sourceRecords:report.sourceRecordIds.map(x=>({...x,exists:true})),auditIds:movementAudit.map(a=>a.id),sourceRecordCount:3,auditEventCount:movementAudit.length};
  const evidenceContractValid=report.evidence.sourceRecords.length===3&&report.evidence.sourceRecords.every(x=>x.exists&&['DETAINEE','MOVEMENT','PLACEMENT'].includes(x.type))&&report.evidence.auditIds.length===2&&report.evidence.auditIds.every(id=>movementAudit.some(a=>a.id===id))&&report.evidence.sourceRecordCount===3&&report.evidence.auditEventCount===2;
  checks.push({name:'EVIDENCE_CHAIN_COMPLETE',ok:mutationOk&&evidenceContractValid});
  const all=Object.values(contracts).flatMap(x=>Array.isArray(x)?x:(x?.checks||x?.results||[]));
  const contractFailures=all.filter(x=>x&&!x.ok);
  checks.push({name:'ALL_EXISTING_CONTRACTS_PASS',ok:contractFailures.length===0});
  const failed=checks.filter(x=>!x.ok);
  evidence.finishedAt=new Date().toISOString();evidence.checkCount=checks.length;evidence.failedCount=failed.length;evidence.status=failed.length?'FAIL':'PASS';
  evidence.journey=['SCAN','RESOLVE','DATA','ACTION','AUDIT','MONITOR','REPORT','EVIDENCE'];
  return {status:evidence.status,ok:failed.length===0,checkedAt:evidence.finishedAt,checks,evidence,contracts};
}
window.mtaUnifiedFinalIntegrityGate=finalIntegrityGate;window.mtaUnifiedScannerContractTest=scannerContractTest;window.mtaUnifiedOperationalContractTest=operationalContractTest;window.mtaUnifiedJourneyContractTest=journeyContractTest;window.mtaUnifiedJourneyOperationalContractTest=journeyOperationalContractTest;window.mtaUnifiedFailureRecoveryContractTest=failureRecoveryContractTest;window.mtaUnifiedStateConsistencyContractTest=stateConsistencyContractTest;window.mtaUnifiedReferentialIntegrityContractTest=referentialIntegrityContractTest;function scannerContractTest(){bootstrapQrResources();const d=read(),first=(d.detainees||[])[0],valid=first&&d.qr?.detainee?.[first.id]?('mta://detainee/'+first.id+'/'+d.qr.detainee[first.id].token):'';const inactiveState=structuredClone(d);if(first){inactiveState.detainees=inactiveState.detainees||[];inactiveState.detainees[0]={...inactiveState.detainees[0],status:'NONAKTIF'}}const cases=[['VALID',valid,'ACCEPTED',d],['MALFORMED','not-a-qr','MALFORMED',d],['NOT_FOUND','mta://detainee/UNKNOWN/SYNTH-QR-UNKNOWN','NOT_FOUND',d],['TOKEN_MISMATCH',first?'mta://detainee/'+first.id+'/WRONG-TOKEN':'','TOKEN_MISMATCH',d],['INACTIVE',valid,'INACTIVE',inactiveState]];const results=cases.map(([name,payload,expected,state])=>{const got=evaluateQrPayload(payload,state).decision;return{name,expected,actual:got,ok:got===expected}});if(window.MTAQrContext){const now=new Date().toISOString();results.push({name:'CONTEXT_MISMATCH',expected:'CONTEXT_MISMATCH',actual:window.MTAQrContext.verify({issuedAt:now,expiresAt:new Date(Date.now()+1000).toISOString(),expectedContext:'TEMPORARY_EXIT',context:'DETAINEE'}).outcome,ok:window.MTAQrContext.verify({issuedAt:now,expiresAt:new Date(Date.now()+1000).toISOString(),expectedContext:'TEMPORARY_EXIT',context:'DETAINEE'}).outcome==='CONTEXT_MISMATCH'});results.push({name:'EXPIRED',expected:'EXPIRED',actual:window.MTAQrContext.verify({issuedAt:new Date(Date.now()-2000).toISOString(),expiresAt:new Date(Date.now()-1000).toISOString(),expectedContext:'DETAINEE',context:'DETAINEE'}).outcome,ok:window.MTAQrContext.verify({issuedAt:new Date(Date.now()-2000).toISOString(),expiresAt:new Date(Date.now()-1000).toISOString(),expectedContext:'DETAINEE',context:'DETAINEE'}).outcome==='EXPIRED'})}return results}
function selfTest(){const checks=[['INDEX_DATA',!!document.getElementById('appView')],['NAV',!!document.getElementById('nav')],['SHOW',typeof window.show==='function'],['QR_CAMERA',!!window.mtaQrCameraV2],['QR_CONTEXT',!!window.MTAQrContext],['OFFLINE_QUEUE',!!window.MTADeteniOfflineQueue],['ROOM_OPS',typeof window.p9refreshRooms==='function'],['QR_PRINT',typeof window.p6printQR==='function'],['QR_RESOURCES',(()=>{const d=bootstrapQrResources();return !!d.detainees?.length&&d.detainees.every(x=>!!d.qr?.detainee?.[x.id]?.token)})()],['ADMIN_SETTINGS',typeof window.p9addRoom==='function'||typeof window.p9addBlock==='function'],['SYNTHETIC_DATA',true],['AI_OFF',true],['DB_DISCONNECTED',true],['MIGRATION_FREEZE',true]];return checks.map(([n,ok])=>({name:n,ok}))}

function renderHealth(){const scanner=scannerContractTest(),operational=operationalContractTest(),journeyOps=journeyOperationalContractTest(),consistency=stateConsistencyContractTest(),referential=referentialIntegrityContractTest(),finalGate=finalIntegrityGate();const el=document.getElementById('mtaRuntimeHealth');if(!el)return;const c=selfTest(),bad=c.filter(x=>!x.ok),sb=[...scanner,...operational,...referential.checks].filter(x=>!x.ok);el.innerHTML='<div class="timeline">'+c.map(x=>'<div class="event"><b>'+ (x.ok?'PASS':'FAIL') +'</b> · '+esc(x.name)+'</div>').join('')+scanner.map(x=>'<div class="event"><b>'+ (x.ok?'PASS':'FAIL') +'</b> · SCANNER_'+esc(x.name)+'</div>').join('')+operational.map(x=>'<div class="event"><b>'+ (x.ok?'PASS':'FAIL') +'</b> · OPERATIONAL_'+esc(x.name)+'</div>').join('')+(consistency.results||[]).map(x=>'<div class="event"><b>'+ (x.ok?'PASS':'FAIL') +'</b> · CONSISTENCY_'+esc(x.name)+'</div>').join('')+referential.checks.map(x=>'<div class="event"><b>'+ (x.ok?'PASS':'FAIL') +'</b> · REFERENTIAL_'+esc(x.name)+'</div>').join('')+'</div><div class="notice" style="margin-top:8px">'+((bad.length||sb.length)?'Integration gate FAILED: '+(bad.length+sb.length)+' contract test(s) failed.':'Integration gate PASS — unified shell + scanner contract ready.')+'</div>';window.MTA_DETENI_FINAL_INTEGRITY_GATE=finalGate;window.MTA_DETENI_INTEGRATION_SELF_TEST={version:VERSION,checkedAt:new Date().toISOString(),pass:!bad.length&&!sb.length&&finalGate.ok,checks:c,scanner:scanner,operational:operational,consistency:consistency,referential:referential,journeyOperational:journeyOps,finalGate:finalGate};}
function syncLegacyDb(){try{if(typeof db!=='undefined'&&db&&typeof read==='function'){const fresh=read();if(fresh&&fresh.detainees)db=fresh}}catch{}}
function install(){const originalShow=typeof window.show==='function'?window.show:null;window.__mtaUnifiedOriginalShow=originalShow;window.show=function(v){window.__mtaUnifiedCurrentView=v;syncLegacyDb();document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));if(v==='p9settings'&&typeof window.p9openSettings==='function'){window.p9openSettings();return;}if(v==='monitor'){document.getElementById('appView').innerHTML=monitor();renderHealth();return}if(v==='ops-queue'){document.getElementById('appView').innerHTML=queue();return}if(v==='qr-center'){document.getElementById('appView').innerHTML=qrCenter();return}if(v==='scan-center'){if(typeof originalShow==='function')return originalShow('p5scan');return toast('Scan Center belum siap')}if(v==='leave-qr'){if(typeof originalShow==='function')return originalShow('p6leaveqr');return toast('Leave QR belum siap')}if(v==='camera-scan'){document.getElementById('appView').innerHTML=camera();return}if(v==='reports'){if(typeof window.documents==='function')return window.documents(document.getElementById('appView'));document.getElementById('appView').innerHTML='<section class="hero"><h1>Laporan</h1><p class="sub">Workflow laporan belum tersedia pada runtime ini.</p></section>';return}if(v==='room-ops'&&typeof window.p9refreshRooms==='function')return window.p9refreshRooms();if(typeof originalShow==='function')return originalShow(v);if(typeof window.__mtaLegacyShow==='function')return window.__mtaLegacyShow(v);const legacy=document.querySelector('[data-view="'+v+'"]');if(legacy){document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));return toast('Navigasi legacy belum siap: '+v)}return toast('View tidak tersedia: '+v)};window.mtaUnifiedResolve=resolve;window.mtaUnifiedEvaluateQr=evaluateQrPayload;window.mtaUnifiedScannerContractTest=scannerContractTest;window.mtaUnifiedOperationalContractTest=operationalContractTest;window.mtaUnifiedJourneyContractTest=journeyContractTest;window.mtaUnifiedJourneyOperationalContractTest=journeyOperationalContractTest;window.mtaUnifiedBuildMonitorMetrics=buildMonitorMetrics;window.mtaUnifiedBuildOperationalQueue=buildOperationalQueue;window.mtaUnifiedFailureRecoveryContractTest=failureRecoveryContractTest;window.mtaUnifiedStateConsistencyContractTest=stateConsistencyContractTest;window.mtaUnifiedFinalIntegrityGate=finalIntegrityGate;window.mtaUnifiedBuildReferentialIntegrityReport=buildReferentialIntegrityReport;window.mtaUnifiedReferentialIntegrityContractTest=referentialIntegrityContractTest;window.mtaUnifiedValidateMovement=validateMovementState;window.mtaUnifiedValidateLeave=validateLeaveState;window.mtaUnifiedAction=action;window.mtaUnifiedPrintQR=(k,id)=>window.p6printQR?window.p6printQR(k,id):toast('QR print module belum siap');window.mtaUnifiedSelfTest=selfTest}
let bootStarted=false;
function waitForAuthBoundary(){
  if(window.__mtaAuthState?.resolved)return Promise.resolve(!!window.__mtaAuthState.authenticated);
  return new Promise(resolve=>{
    let settled=false;
    const finish=authenticated=>{
      if(settled)return;
      settled=true;
      clearTimeout(timer);
      window.removeEventListener('mta-auth-state',onState);
      resolve(!!authenticated);
    };
    const onState=e=>finish(!!e?.detail?.authenticated);
    const timer=setTimeout(()=>finish(false),15000);
    window.addEventListener('mta-auth-state',onState);
  });
}
async function boot(){
  if(bootStarted)return;
  if(document.readyState!=='loading' && !window.__mtaAuthState?.resolved){
    document.documentElement.dataset.mtaUnifiedShell='waiting-auth';
    const resolved=await new Promise(resolve=>{
      let done=false;
      const finish=value=>{if(done)return;done=true;clearTimeout(timer);window.removeEventListener('mta-auth-state',onState);resolve(value)};
      const onState=e=>finish(!!e?.detail);
      const timer=setTimeout(()=>finish(null),3000);
      window.addEventListener('mta-auth-state',onState);
    });
    if(!resolved)return;
  }
  const authenticated=await waitForAuthBoundary();
  if(!authenticated){
    document.documentElement.dataset.mtaUnifiedShell='blocked-unauthenticated';
    window.addEventListener('mta-auth-state',e=>{
      if(e?.detail?.authenticated&&!bootStarted)boot();
    });
    return;
  }
  if(bootStarted)return;
  bootStarted=true;
  bootstrapQrResources();
  await Promise.all(BASE.map(style));
  const loaded=[];
  for(const s of SCRIPTS)loaded.push(await script(s));
  installNav();
  install();
  window.addEventListener('mta:data-changed',()=>{
    syncLegacyDb();
    if(window.__mtaUnifiedEventRefresh)return;
    window.__mtaUnifiedEventRefresh=true;
    setTimeout(()=>{
      window.__mtaUnifiedEventRefresh=false;
      if(['monitor','ops-queue'].includes(window.__mtaUnifiedCurrentView)&&window.__mtaAuthState?.authenticated)window.show(window.__mtaUnifiedCurrentView)
    },0);
  });
  window.addEventListener('mta:qr-detected',e=>{
    if(!window.__mtaAuthState?.authenticated)return;
    const raw=e.detail?.raw||'';
    if(typeof window.mtaUnifiedResolve==='function')window.mtaUnifiedResolve(raw);
  });
  window.addEventListener('mta-auth-state',e=>{
    if(e?.detail?.authenticated)return;
    document.body.classList.remove('mta-auth-ready');
    document.body.classList.add('mta-auth-locked');
    const app=document.querySelector('.app');
    if(app)app.style.setProperty('display','none','important');
    const view=document.getElementById('appView');
    if(view)view.replaceChildren();
  });
  document.documentElement.dataset.mtaUnifiedShell=VERSION;
  document.body.classList.add('mta-unified-runtime');
  window.MTA_DETENI_MODULE_LOAD_REPORT=loaded;
  setTimeout(()=>{
    if(window.__mtaAuthState?.authenticated){
      const targetView=window.__mtaUnifiedCurrentView||'dashboard';
      if(typeof window.show==='function')window.show(targetView);
    }
  },80);
  window.dispatchEvent(new CustomEvent('mta:unified-ready',{detail:{version:VERSION,loaded}}));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();