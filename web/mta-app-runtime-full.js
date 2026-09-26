const KEY='mta-deteni-demo-v2'; const BRANDING_KEY='mta-deteni-branding-v1'; const stateKernel=()=>window.MTADeteniStateKernel;
const seed={meta:{version:2,createdAt:new Date().toISOString()},blocks:[{id:'BLK-001',name:'Blok A',status:'ACTIVE',source:'SYNTHETIC_SEED'},{id:'BLK-002',name:'Blok B',status:'ACTIVE',source:'SYNTHETIC_SEED'}],rooms:[{id:'ROOM-001',blockId:'BLK-001',block:'Blok A',room:'Kamar 01',capacity:8,status:'ACTIVE',type:'STANDARD',gender:'UMUM',source:'SYNTHETIC_SEED',version:1},{id:'ROOM-002',blockId:'BLK-002',block:'Blok B',room:'Kamar 02',capacity:8,status:'ACTIVE',type:'STANDARD',gender:'UMUM',source:'SYNTHETIC_SEED',version:1}],detainees:[{id:'DET-001',code:'DET-2026-001',name:'SYNTHETIC A',nationality:'Contoh',status:'AKTIF',placement:'Blok A / Kamar 01',createdAt:'2026-09-16T07:00:00Z'},{id:'DET-002',code:'DET-2026-002',name:'SYNTHETIC B',nationality:'Contoh',status:'AKTIF',placement:'Blok B / Kamar 02',createdAt:'2026-09-16T07:10:00Z'}],placements:[{id:'PLC-001',detaineeId:'DET-001',roomId:'ROOM-001',blockId:'BLK-001',block:'Blok A',room:'Kamar 01',since:'2026-09-16T07:20:00Z',source:'SYNTHETIC_SEED'},{id:'PLC-002',detaineeId:'DET-002',roomId:'ROOM-002',blockId:'BLK-002',block:'Blok B',room:'Kamar 02',since:'2026-09-16T07:25:00Z',source:'SYNTHETIC_SEED'}],movements:[],leaves:[],documents:[],audit:[]};
let db=null; let current='dashboard'; window.MTA_DETAINEE_CRUD_OWNER='CORE_RUNTIME_V2';
function load(){
  try{
    const STATE_KERNEL=stateKernel();
    if(STATE_KERNEL){
      const state=STATE_KERNEL.read();
      if(state&&Array.isArray(state.detainees)&&state.detainees.length)return state;
    }
    const x=JSON.parse(localStorage.getItem(KEY)||'null');
    const state=x&&Array.isArray(x.detainees)?x:JSON.parse(JSON.stringify(seed));
    for(const k of ['detainees','placements','movements','leaves','documents','audit','rooms','blocks'])if(!Array.isArray(state[k]))state[k]=[];
    return state;
  }catch(err){console.error('[MTA] load failed',err);return JSON.parse(JSON.stringify(seed))}
}
function save(){
  try{
    if(!db||typeof db!=='object')throw new Error('STATE_NOT_READY');
    const STATE_KERNEL=stateKernel();
    if(STATE_KERNEL)return STATE_KERNEL.write(db);
    const branding=db.adminSettings?.branding;
    const persist=JSON.parse(JSON.stringify(db));
    if(persist.adminSettings)delete persist.adminSettings.branding;
    const serialized=JSON.stringify(persist);
    localStorage.setItem(KEY,serialized);
    if(localStorage.getItem(KEY)!==serialized)throw new Error('STORAGE_VERIFY_FAILED');
    if(branding)localStorage.setItem(BRANDING_KEY,JSON.stringify(branding));
    window.dispatchEvent(new CustomEvent('mta:data-changed',{detail:{source:'core-save'}}));
    return true;
  }catch(err){console.error('[MTA] save failed',err);toast('Gagal menyimpan data: '+(err?.message||'STORAGE_ERROR'));return false}
}
function uid(prefix){return prefix+'-'+Math.random().toString(36).slice(2,8).toUpperCase()}
function now(){return new Date().toISOString()}
function validateRuntimeState(x){if(!x||typeof x!=='object')throw new Error('STATE_INVALID');const roots=['detainees','placements','movements','leaves','documents','audit','rooms','blocks'];for(const k of roots)if(!Array.isArray(x[k]))throw new Error('STATE_ARRAY_REQUIRED:'+k);for(const k of roots){const ids=x[k].map(v=>v?.id).filter(Boolean);if(new Set(ids).size!==ids.length)throw new Error('STATE_DUPLICATE_ID:'+k)}if(x.audit.some(a=>!a?.id||!a?.action||!a?.resourceType||!a?.occurredAt))throw new Error('AUDIT_INVALID');const roomIds=new Set(x.rooms.map(r=>r.id));if(x.placements.some(p=>p.roomId&&!roomIds.has(p.roomId)))throw new Error('PLACEMENT_MASTER_ROOM_MISSING');const detaineeIds=new Set(x.detainees.map(d=>d.id));if(x.movements.some(m=>m.detaineeId&&!detaineeIds.has(m.detaineeId)))throw new Error('MOVEMENT_DETAINEE_MISSING');if(x.leaves.some(l=>l.detaineeId&&!detaineeIds.has(l.detaineeId)))throw new Error('LEAVE_DETAINEE_MISSING');return true}
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function appendAudit(state,action,resourceType,resourceId,result='SUCCESS',correlationId){
  const kernel=stateKernel();
  if(kernel?.audit)return kernel.audit(state,action,resourceType,resourceId,result,{actor:'DEMO-OPERATOR',correlationId});
  state.audit=state.audit||[];
  const event={id:uid('AUD'),action,resourceType,resourceId:resourceId||'',result,occurredAt:now(),actor:'DEMO-OPERATOR',requestId:uid('REQ'),correlationId:correlationId||uid('COR'),policyVersion:'AUTHZ-1.0'};
  state.audit.unshift(event);
  return event;
}
function audit(action,resourceType,resourceId,result='SUCCESS',correlationId){return appendAudit(db,action,resourceType,resourceId,result,correlationId)}
function openModal(html){document.getElementById('dialog').innerHTML=html;document.getElementById('modal').classList.add('open')}
function closeModal(){document.getElementById('modal').classList.remove('open')}
document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
function statCards(){return `<section class="grid stats"><div class="card"><div class="label">Deteni Aktif</div><div class="value">${db.detainees.filter(x=>x.status==='AKTIF').length}</div><span class="status">Operational</span></div><div class="card"><div class="label">Penempatan</div><div class="value">${db.placements.length}</div><span class="status">Tracked</span></div><div class="card"><div class="label">Pergerakan</div><div class="value">${db.movements.length}</div><span class="status">Logged</span></div><div class="card"><div class="label">Izin</div><div class="value">${db.leaves.length}</div><span class="status">Workflow</span></div><div class="card"><div class="label">Audit Event</div><div class="value">${db.audit.length}</div><span class="status">Evidence</span></div></section>`}
function render(){const v=document.getElementById('appView'); if(current==='dashboard')return dashboard(v);if(current==='detainee')return detainee(v);if(current==='placement')return placement(v);if(current==='movement')return movement(v);if(current==='leave')return leave(v);if(current==='documents')return documents(v);if(current==='audit')return auditView(v)}
function shell(title,desc,body){return `<section class="hero"><h1>${title}</h1><p class="sub">${desc}</p></section>${body}`}
function dashboard(v){
  const active=db.detainees.filter(x=>x.status==='AKTIF').length;
  const placement=db.placements.length,movement=db.movements.length,leave=db.leaves.length,auditCount=db.audit.length;
  v.innerHTML=`<section class="mta-command-hero"><div class="mta-command-copy"><div class="mta-eyebrow">MTA DETENI DIGITAL · OPERATIONAL COMMAND CENTER</div><h1>Dashboard</h1><p>Ruang kendali operasional untuk memantau deteni, penempatan, pergerakan, izin, QR, dokumen, dan audit dalam satu alur kerja.</p><div class="mta-hero-actions"><button class="btn primary" onclick="show('camera-scan')">Scan QR</button><button class="btn" onclick="show('detainee')">Data Deteni</button><button class="btn" onclick="show('monitor')">Operational Monitor</button></div></div><div class="mta-hero-visual"><div class="mta-orbit mta-orbit-a"></div><div class="mta-orbit mta-orbit-b"></div><div class="mta-core-mark">M</div><span class="mta-core-pulse"></span></div></section><section class="mta-kpi-grid"><div class="mta-kpi-card accent"><span class="mta-kpi-icon">♙</span><div><small>Deteni Aktif</small><strong>${active}</strong><em>Operational</em></div></div><div class="mta-kpi-card"><span class="mta-kpi-icon">▱</span><div><small>Penempatan</small><strong>${placement}</strong><em>Tracked</em></div></div><div class="mta-kpi-card"><span class="mta-kpi-icon">→</span><div><small>Pergerakan</small><strong>${movement}</strong><em>Logged</em></div></div><div class="mta-kpi-card"><span class="mta-kpi-icon">⇥</span><div><small>Izin</small><strong>${leave}</strong><em>Workflow</em></div></div><div class="mta-kpi-card"><span class="mta-kpi-icon">◷</span><div><small>Audit Event</small><strong>${auditCount}</strong><em>Evidence</em></div></div></section><section class="mta-dashboard-grid"><article class="mta-panel mta-quick-panel"><div class="mta-panel-head"><div><span class="mta-section-kicker">OPERASIONAL</span><h2>Alur kerja cepat</h2></div><span class="mta-panel-badge">SYNTHETIC</span></div><div class="mta-action-grid"><button onclick="show('detainee')" class="mta-action-tile"><span>♙</span><b>Data Deteni</b><small>Kelola master data</small></button><button onclick="show('placement')" class="mta-action-tile"><span>▱</span><b>Penempatan</b><small>Assignment kamar</small></button><button onclick="show('movement')" class="mta-action-tile"><span>→</span><b>Pergerakan</b><small>Catat mutasi</small></button><button onclick="show('leave')" class="mta-action-tile"><span>⇥</span><b>Izin</b><small>Workflow keluar sementara</small></button><button onclick="show('documents')" class="mta-action-tile"><span>▤</span><b>Dokumen</b><small>Laporan & evidence</small></button><button onclick="show('audit')" class="mta-action-tile"><span>◷</span><b>Audit Trail</b><small>Jejak tindakan</small></button></div></article><aside class="mta-panel mta-health-panel"><div class="mta-panel-head"><div><span class="mta-section-kicker">GOVERNANCE</span><h2>Runtime status</h2></div><span class="mta-live-dot">● LIVE</span></div><div class="mta-status-list"><div><span>Authentication</span><b>AUTHENTICATED</b></div><div><span>Data mode</span><b>SYNTHETIC</b></div><div><span>AI</span><b>OFF</b></div><div><span>Database</span><b>NOT CONNECTED</b></div></div><div class="mta-governance-note"><strong>Governed runtime</strong><span>Migration Freeze · Production access locked · Synthetic data only</span></div></aside></section><section class="mta-roadmap-panel"><div class="mta-panel-head"><div><span class="mta-section-kicker">ROADMAP</span><h2>Operational journey</h2></div><span class="mta-panel-muted">Scan → Resolve → Data → Action → Audit → Monitor → Report</span></div><div class="mta-roadmap"><div class="done"><span>01</span><b>Scan</b><small>QR / Camera</small></div><i></i><div class="done"><span>02</span><b>Resolve</b><small>Context</small></div><i></i><div><span>03</span><b>Action</b><small>Mutation</small></div><i></i><div><span>04</span><b>Audit</b><small>Evidence</small></div><i></i><div><span>05</span><b>Monitor</b><small>Operational</small></div><i></i><div><span>06</span><b>Report</b><small>Daily Guard</small></div></div></section>`;
}
function detainee(v){const rows=db.detainees.map((d,i)=>`<tr><td>${i+1}</td><td><b>${esc(d.code)}</b></td><td>${esc(d.name)}</td><td>${esc(d.nationality)}</td><td><span class="detainee-status-badge ${d.status==='AKTIF'?'is-active':''}">${esc(d.status)}</span></td><td>${esc(d.placement||'-')}</td><td><button class="btn small" onclick="editDetainee('${d.id}')">Edit</button> <button class="btn small danger" onclick="archiveDetainee('${d.id}')">Arsip</button> <button class="btn small" onclick="window.p5showQR&&window.p5showQR('detainee','${d.id}')">QR</button> <button class="btn small" onclick="window.p5printDetaineeQR&&window.p5printDetaineeQR('${d.id}')">Cetak</button> <button class="btn small" onclick="window.p5downloadDetaineeQR&&window.p5downloadDetaineeQR('${d.id}')">Download</button></td></tr>`).join('');v.innerHTML=shell('Data Deteni','Master data sintetis dengan audit event. Penghapusan permanen tidak tersedia pada demo.',`<div class="toolbar detainee-toolbar"><button class="btn primary" onclick="addDetainee()">+ Tambah Deteni</button><input id="dSearch" placeholder="Cari kode/nama" oninput="filterDetainee()" style="padding:8px;border:1px solid var(--line);border-radius:9px"><div class="detainee-desktop-filters"><select id="dStatusFilter" onchange="filterDetainee()" aria-label="Filter status"><option value="">Semua Status</option><option value="AKTIF">AKTIF</option><option value="NONAKTIF">NONAKTIF</option></select><select id="dPlacementFilter" onchange="filterDetainee()" aria-label="Filter penempatan"><option value="">Semua Penempatan</option>${[...new Set(db.detainees.map(x=>x.placement).filter(Boolean))].map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select><button class="btn" onclick="filterDetainee()">Filter</button><button class="btn" onclick="render()">↻ Refresh</button></div></div><div class="tablewrap detainee-tablewrap"><table class="table detainee-table"><thead><tr><th>No</th><th>Kode</th><th>Nama</th><th>Kebangsaan</th><th>Status</th><th>Penempatan</th><th>Aksi</th></tr></thead><tbody id="dRows">${rows}</tbody></table><div class="detainee-desktop-footer"><span id="detaineeCount">Menampilkan ${db.detainees.length ? 1 : 0} - ${db.detainees.length} dari ${db.detainees.length} data</span><div class="detainee-pagination"><button class="btn small" disabled>‹</button><button class="btn small page-current">1</button><button class="btn small" disabled>›</button></div></div></div>`)}
function filterDetainee(){const q=(document.getElementById('dSearch')?.value||'').toLowerCase();const status=document.getElementById('dStatusFilter')?.value||'';const placement=document.getElementById('dPlacementFilter')?.value||'';document.querySelectorAll('#dRows tr').forEach(r=>{const text=r.textContent.toLowerCase();const cells=r.cells;const rowStatus=(cells[4]?.textContent||'').trim();const rowPlacement=(cells[5]?.textContent||'').trim();const ok=text.includes(q)&&(!status||rowStatus.includes(status))&&(!placement||rowPlacement===placement);r.style.display=ok?'':'none'});const visible=[...document.querySelectorAll('#dRows tr')].filter(r=>r.style.display!=='none').length;const count=document.getElementById('detaineeCount');if(count)count.textContent=visible?`Menampilkan 1 - ${visible} dari ${document.querySelectorAll('#dRows tr').length} data` : 'Menampilkan 0 dari '+document.querySelectorAll('#dRows tr').length+' data'}
function addDetainee(existing){
  const d=existing||{id:'',code:'',name:'',nationality:'Contoh',status:'AKTIF',placement:''};
  const roomOptions=(db.rooms||[]).filter(r=>r.status==='ACTIVE').map(r=>`<option value="${esc(r.id)}" ${d.placement===r.block+' / '+r.room?'selected':''}>${esc(r.block+' / '+r.room)} — O/${esc(r.capacity)}</option>`).join('');
  openModal(`<div class="dialoghead"><h2>${existing?'Edit':'Tambah'} Deteni</h2><button class="x" onclick="closeModal()">×</button></div>
  <form id="dForm" class="formgrid">
    <div class="field"><label>Kode</label><input name="code" required value="${esc(d.code)}" placeholder="DET-2026-003"></div>
    <div class="field"><label>Nama (synthetic)</label><input name="name" required value="${esc(d.name)}"></div>
    <div class="field"><label>Kebangsaan</label><input name="nationality" value="${esc(d.nationality)}"></div>
    <div class="field"><label>Status</label><select name="status"><option value="AKTIF" ${d.status==='AKTIF'?'selected':''}>AKTIF</option><option value="NONAKTIF" ${d.status==='NONAKTIF'?'selected':''}>NONAKTIF</option></select></div>
    <div class="field full"><label>${existing?'Penempatan Saat Ini':'Penempatan Awal'}</label>${existing?`<div class="notice">${esc(d.placement||'Belum terpetakan')}<br><span class="p6mini">Perubahan kamar dilakukan melalui modul Pergerakan → Transfer Kamar.</span></div>`:`<select name="placementId"><option value="">Pilih kamar</option>${roomOptions}</select>`}</div>
    <div class="actions full"><button type="button" class="btn" onclick="closeModal()">Batal</button><button type="submit" class="btn primary">Simpan</button></div>
  </form>`);
  const form=document.getElementById('dForm');
  form.onsubmit=e=>{
    e.preventDefault();
    try{
      const f=new FormData(form);
      const code=String(f.get('code')||'').trim();
      const name=String(f.get('name')||'').trim();
      const nationality=String(f.get('nationality')||'').trim();
      const status=String(f.get('status')||'AKTIF');
      const placementId=String(f.get('placementId')||'');
      if(!code||!name){toast('Kode dan nama wajib diisi.');return}
      if(db.detainees.some(x=>String(x.code||'').trim().toLowerCase()===code.toLowerCase()&&(!existing||x.id!==existing.id))){toast('Kode deteni sudah terdaftar.');return}
      const room=placementId?(db.rooms||[]).find(r=>r.id===placementId&&r.status==='ACTIVE'):null;
      if(placementId&&!room){toast('Penempatan tidak valid atau kamar tidak aktif.');return}
      if(!existing&&status==='AKTIF'&&!room){toast('Deteni AKTIF wajib memiliki penempatan awal.');return}
      if(!existing&&room){const guard=window.MTA_DETENI_MASTER_ROOM_GUARD?.validateDetaineeRoom?.(db,room.id,null);if(guard&&!guard.ok){toast(guard.code==='ROOM_FULL'?'Kamar sudah penuh.':'Kamar tujuan tidak valid.');return}}
      if(existing){
        Object.assign(existing,{code,name,nationality,status});
        /* Placement is immutable through Detainee Edit; room changes belong to Movement. */
        audit('DETAINEE_UPDATE','DETAINEE',existing.id);
      }else{
        const x={id:uid('DET'),code,name,nationality,status,placement:room?room.block+' / '+room.room:'',createdAt:now()};
        db.detainees.unshift(x);
        audit('DETAINEE_CREATE','DETAINEE',x.id);
        if(room){
          const command=window.mtaUnifiedAssignPlacement;
          if(typeof command!=='function'){toast('Canonical placement command belum siap.');return}
          const result=command(db,{detaineeId:x.id,roomId:room.id,since:now(),source:'MASTER_ROOM',requestKey:'PLACEMENT:'+x.id+':'+room.id});
          if(!result.ok){toast('Penempatan awal ditolak: '+result.code);return}
        }
      }
      if(!save())return;closeModal();render();toast('Data tersimpan');
    }catch(err){console.error('[MTA] detainee save failed',err);toast('Gagal menyimpan data: '+(err?.message||'ERROR'))}
  };
}
function editDetainee(id){addDetainee(db.detainees.find(x=>x.id===id))}
function archiveDetainee(id){const d=db.detainees.find(x=>x.id===id);if(!d)return;d.status='NONAKTIF';if(db.qr?.detainee?.[id])db.qr.detainee[id].status='SUSPENDED';audit('DETAINEE_ARCHIVE','DETAINEE',id);if(!save())return;render();toast('Deteni diarsipkan')}
function placement(v){const rows=db.placements.map(p=>{const d=db.detainees.find(x=>x.id===p.detaineeId);return `<tr><td>${esc(p.id)}</td><td>${esc(d?.code||p.detaineeId)}</td><td>${esc(d?.name||'-')}</td><td>${esc(p.block)}</td><td>${esc(p.room)}</td><td>${new Date(p.since).toLocaleString('id-ID')}</td></tr>`}).join('');v.innerHTML=shell('Penempatan','Riwayat penempatan sintetis dan assignment terkini.',`<div class="toolbar"><button class="btn primary" onclick="addPlacement()">+ Assign Penempatan</button></div><div class="tablewrap"><table class="table"><thead><tr><th>ID</th><th>Kode</th><th>Nama</th><th>Blok</th><th>Kamar</th><th>Mulai</th></tr></thead><tbody>${rows||'<tr><td colspan="6" class="empty">Belum ada data</td></tr>'}</tbody></table></div>`)}
function addPlacement(){const opts=db.detainees.filter(d=>d.status==='AKTIF').map(d=>`<option value="${d.id}">${esc(d.code)} — ${esc(d.name)}</option>`).join('');openModal(`<div class="dialoghead"><h2>Assign Penempatan</h2><button class="x" onclick="closeModal()">×</button></div><form id="pForm" class="formgrid"><div class="field full"><label>Deteni</label><select name="detaineeId" required>${opts}</select></div><div class="field"><label>Blok</label><input name="block" required placeholder="Blok A"></div><div class="field"><label>Kamar</label><input name="room" required placeholder="Kamar 01"></div><div class="actions full"><button type="button" class="btn" onclick="closeModal()">Batal</button><button class="btn primary">Assign</button></div></form>`);document.getElementById('pForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),id=String(f.get('detaineeId')||''),block=String(f.get('block')||''),room=String(f.get('room')||''),d=db.detainees.find(x=>x.id===id),masters=(db.rooms||[]).filter(r=>r.status==='ACTIVE'),master=masters.find(r=>r.block===block&&r.room===room);if(!d||d.status!=='AKTIF'||!master){audit('PLACEMENT_ASSIGN_BLOCKED','PLACEMENT',id||block+' / '+room,'DENIED');toast('Assignment ditolak: deteni harus aktif dan kamar harus berasal dari Master Kamar ACTIVE.');return}const occupied=db.detainees.filter(x=>x.status==='AKTIF'&&x.id!==id).filter(x=>{const p=db.placements.filter(y=>y.detaineeId===x.id).sort((a,b)=>String(b.since||'').localeCompare(String(a.since||'')))[0];return p&&(p.roomId===master.id||(p.block===master.block&&p.room===master.room))}).length;if(Number(master.capacity)>0&&occupied>=Number(master.capacity)){audit('PLACEMENT_CAPACITY_BLOCKED','PLACEMENT',master.id,'DENIED');toast('Assignment ditolak: kamar penuh.');return}const currentPlacement=db.placements.filter(x=>x.detaineeId===id).sort((a,b)=>String(b.since||'').localeCompare(String(a.since||'')))[0];if(currentPlacement?.roomId===master.id){toast('Deteni sudah berada di kamar tersebut.');return}const command=window.mtaUnifiedAssignPlacement;if(typeof command!=='function'){toast('Canonical placement command belum siap.');return}const result=command(db,{detaineeId:id,roomId:master.id,since:now(),source:'MASTER_ROOM',requestKey:'PLACEMENT:'+id+':'+master.id});if(!result.ok){toast('Assignment ditolak: '+result.code);return}save();closeModal();render();toast('Penempatan dicatat')}}
function movement(v){const rows=db.movements.map(m=>{const d=db.detainees.find(x=>x.id===m.detaineeId);return `<tr><td>${esc(m.id)}</td><td>${esc(d?.code||m.detaineeId)}</td><td>${esc(m.type)}</td><td>${esc(m.location)}</td><td>${esc(m.note)}</td><td>${new Date(m.at).toLocaleString('id-ID')}</td></tr>`}).join('');v.innerHTML=shell('Pergerakan','Pencatatan pergerakan sintetis sebagai event operasional.',`<div class="toolbar"><button class="btn primary" onclick="addMovement()">+ Catat Pergerakan</button></div><div class="tablewrap"><table class="table"><thead><tr><th>ID</th><th>Deteni</th><th>Tipe</th><th>Lokasi</th><th>Catatan</th><th>Waktu</th></tr></thead><tbody>${rows||'<tr><td colspan="6" class="empty">Belum ada pergerakan</td></tr>'}</tbody></table></div>`)}
function addMovement(){const opts=db.detainees.filter(d=>d.status==='AKTIF').map(d=>`<option value="${d.id}">${esc(d.code)} — ${esc(d.name)}</option>`).join('');openModal(`<div class="dialoghead"><h2>Catat Pergerakan</h2><button class="x" onclick="closeModal()">×</button></div><form id="mForm" class="formgrid"><div class="field full"><label>Deteni</label><select name="detaineeId">${opts}</select></div><div class="field"><label>Tipe</label><select name="type"><option>INTERNAL</option><option>ESCORT</option><option>RETURN</option></select></div><div class="field"><label>Lokasi</label><input name="location" required placeholder="Area pemeriksaan"></div><div class="field full"><label>Catatan</label><textarea name="note" rows="3"></textarea></div><div class="actions full"><button type="button" class="btn" onclick="closeModal()">Batal</button><button class="btn primary">Catat</button></div></form>`);document.getElementById('mForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),detaineeId=String(f.get('detaineeId')||''),det=db.detainees.find(x=>x.id===detaineeId);if(!det||det.status!=='AKTIF'){audit('MOVEMENT_CREATE_BLOCKED','MOVEMENT',detaineeId,'DENIED');toast('Pergerakan ditolak: deteni tidak aktif atau tidak ditemukan.');return}const requestKey='LEGACY_MOVEMENT:'+detaineeId+':'+String(f.get('type')||'INTERNAL')+':'+String(f.get('location')||'').trim()+':'+String(f.get('note')||'').trim();if(db.movements.some(x=>x.requestKey===requestKey)){toast('Pergerakan yang sama sudah diproses.');return}const m={id:uid('MOV'),detaineeId,type:String(f.get('type')||'INTERNAL'),location:String(f.get('location')||''),note:String(f.get('note')||''),at:now(),createdAt:now(),requestKey};db.movements.unshift(m);db.lastMutation={key:requestKey,action:'LEGACY_MOVEMENT_CREATE',completedAt:now()};audit('MOVEMENT_CREATE','MOVEMENT',m.id);save();closeModal();render();toast('Pergerakan dicatat')}}
function leave(v){const rows=db.leaves.map(l=>{const d=db.detainees.find(x=>x.id===l.detaineeId);return `<tr><td>${esc(l.id)}</td><td>${esc(d?.code||l.detaineeId)}</td><td>${esc(l.destination)}</td><td>${esc(l.status)}</td><td>${new Date(l.startAt).toLocaleString('id-ID')}</td><td>${leaveActions(l)}</td></tr>`}).join('');v.innerHTML=shell('Izin','Workflow demo dengan state transition yang tercatat ke audit trail.',`<div class="toolbar"><button class="btn primary" onclick="addLeave()">+ Buat Izin</button></div><div class="tablewrap"><table class="table"><thead><tr><th>ID</th><th>Deteni</th><th>Tujuan</th><th>Status</th><th>Mulai</th><th>Aksi</th></tr></thead><tbody>${rows||'<tr><td colspan="6" class="empty">Belum ada izin</td></tr>'}</tbody></table></div>`)}
function leaveActions(l){const map={DRAFT:'SUBMIT',SUBMITTED:'APPROVE',APPROVED:'DEPART',DEPARTED:'RETURN',RETURNED:'COMPLETE'};const next=map[l.status];return next?`<button class="btn small primary" onclick="advanceLeave('${l.id}')">${next}</button>`:'—'}
function addLeave(){const opts=db.detainees.filter(d=>d.status==='AKTIF').map(d=>`<option value="${d.id}">${esc(d.code)} — ${esc(d.name)}</option>`).join('');openModal(`<div class="dialoghead"><h2>Buat Izin</h2><button class="x" onclick="closeModal()">×</button></div><form id="lForm" class="formgrid"><div class="field full"><label>Deteni</label><select name="detaineeId">${opts}</select></div><div class="field"><label>Tujuan</label><input name="destination" required></div><div class="field"><label>Mulai</label><input name="startAt" type="datetime-local" required></div><div class="field full"><label>Keperluan</label><textarea name="purpose" rows="3"></textarea></div><div class="actions full"><button type="button" class="btn" onclick="closeModal()">Batal</button><button class="btn primary">Buat</button></div></form>`);document.getElementById('lForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),detaineeId=String(f.get('detaineeId')||''),startRaw=String(f.get('startAt')||'');const startDate=new Date(startRaw);if(Number.isNaN(startDate.getTime())){toast('Waktu mulai tidak valid.');return}const requestKey='LEAVE_CREATE:'+detaineeId+':'+String(f.get('destination')||'').trim()+':'+startDate.toISOString();if(db.leaves.some(x=>x.requestKey===requestKey)){toast('Izin yang sama sudah diproses.');return}const l={id:uid('LV'),detaineeId,destination:f.get('destination'),purpose:f.get('purpose'),startAt:startDate.toISOString(),status:'DRAFT',createdAt:now(),requestKey};db.leaves.unshift(l);audit('LEAVE_CREATE','LEAVE',l.id);save();closeModal();render();toast('Izin dibuat sebagai DRAFT')}}
function appendLocalAudit(state,action,type,id,result='SUCCESS',correlationId){
  state.audit=state.audit||[];
  state.audit.unshift({id:uid('AUD'),action,resourceType:type,resourceId:id||'',result,occurredAt:now(),actor:'DEMO-OPERATOR',requestId:uid('REQ'),correlationId:correlationId||uid('COR'),policyVersion:'AUTHZ-1.0'});
}
function advanceLeave(id){
  if(typeof window.mtaUnifiedAdvanceLeave==='function'){
    const result=window.mtaUnifiedAdvanceLeave(db,id);
    if(result.ok&&result.code==='LEAVE_ALREADY_PROCESSED'){toast('Transisi izin yang sama sudah diproses.');return}
    if(!result.ok){save();toast('Transisi izin ditolak: '+result.code);return}
    save();render();toast('State izin → '+result.to);return;
  }
  toast('Canonical leave command belum siap.');
}
function documentStatusBadge(status){
  const cls=String(status||'DRAFT').toLowerCase().replace(/[^a-z_]/g,'-');
  return '<span class="mta-doc-status mta-doc-status-'+cls+'">'+esc(status||'DRAFT')+'</span>';
}
function buildReportEvidence(r){
  const ids=Array.isArray(r.sourceRecordIds)?r.sourceRecordIds:[];
  const collections=[['DETAINEE',db.detainees],['MOVEMENT',db.movements],['LEAVE',db.leaves],['PLACEMENT',db.placements],['ROOM',db.rooms]];
  const sourceRecords=[];
  ids.forEach(id=>collections.forEach(([type,arr])=>{
    const x=(arr||[]).find(v=>v&&v.id===id);
    if(x)sourceRecords.push({type,id:x.id,status:x.status||null,updatedAt:x.updatedAt||x.createdAt||null});
  }));
  const auditIds=(db.audit||[]).filter(a=>ids.includes(a.resourceId)||a.resourceId===r.documentId).map(a=>a.id).slice(0,200);
  return {capturedAt:now(),sourceRecords,auditIds,sourceRecordCount:sourceRecords.length,auditEventCount:auditIds.length};
}
function validateReportEvidence(r){
  const e=r&&r.evidence;
  if(!e||!Array.isArray(e.sourceRecords)||!Array.isArray(e.auditIds))throw new Error('REPORT_EVIDENCE_REQUIRED');
  for(const s of e.sourceRecords){
    const arr={DETAINEE:db.detainees,MOVEMENT:db.movements,LEAVE:db.leaves,PLACEMENT:db.placements,ROOM:db.rooms}[s.type];
    const x=(arr||[]).find(v=>v&&v.id===s.id);
    if(!x)throw new Error('REPORT_SOURCE_MISSING:'+s.type+':'+s.id);
  }
  return true;
}
function documentById(id){return db.documents.find(x=>(x.documentId||x.id)===id)}
function documentActionLabel(status){
  const a=window.mtaDailyGuardReport.lifecycleAction(status);
  return a?.label||'';
}
function reportFilterState(){
  return {
    date:document.getElementById('d57Date')?.value||'',
    regu:document.getElementById('d57Regu')?.value||'',
    shift:document.getElementById('d57Shift')?.value||''
  };
}
function reportFilterOptions(field){
  const values=[...new Set(db.documents.map(r=>r[field]).filter(Boolean))];
  return values.sort().map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');
}
function filteredDailyReports(){
  return window.mtaDailyGuardD57.filterReports(db.documents,reportFilterState());
}
function renderDailyReportRows(){
  const body=document.getElementById('d57Rows'); if(!body)return;
  const reports=filteredDailyReports();
  body.innerHTML=reports.length?reports.map(d=>{
    const id=d.documentId||d.id, status=d.status||'DRAFT';
    const selected=d.status==='FINAL'?'':'';
    return '<tr><td><input type="checkbox" class="d57-select" value="'+esc(id)+'" '+selected+'></td><td><b>'+esc(id)+'</b><small class="mta-doc-revision">Rev '+esc(d.revision||1)+'</small></td><td>'+esc(d.documentType||d.type)+'</td><td>'+esc(d.reguId||d.regu)+'</td><td>'+esc(d.shiftId||d.shift)+'</td><td>'+esc(d.reportDate||d.date)+'</td><td>'+documentStatusBadge(status)+'</td><td><div class="mta-doc-actions"><button class="btn small" onclick="previewReport(\''+esc(id)+'\')">Preview</button><button class="btn small" onclick="showRevisionHistory(\''+esc(id)+'\')">History</button>'+documentWorkflowButtons(d)+'</div></td></tr>';
  }).join(''):'<tr><td colspan="8" class="empty">Tidak ada laporan sesuai filter</td></tr>';
  const count=document.getElementById('d57Count'); if(count)count.textContent=reports.length+' laporan';
}
function applyDailyReportFilters(){renderDailyReportRows()}
function clearDailyReportFilters(){
  ['d57Date','d57Regu','d57Shift'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
  renderDailyReportRows();
}
function selectedFinalReportIds(){
  return [...document.querySelectorAll('.d57-select:checked')].map(x=>x.value);
}
function selectAllFinalReports(checked){
  document.querySelectorAll('.d57-select').forEach(x=>{const row=db.documents.find(r=>(r.documentId||r.id)===x.value);x.checked=!!checked&&row?.status==='FINAL'});
}
function showRevisionHistory(id){
  const history=window.mtaDailyGuardD57.buildRevisionHistory(db.documents,id);
  if(!history.length){toast('Revision history tidak ditemukan');return}
  const rows=history.map(r=>'<tr><td>Rev '+esc(r.revision||1)+'</td><td>'+esc(r.documentId||r.id)+'</td><td>'+documentStatusBadge(r.status)+'</td><td>'+esc(r.createdAt||'')+'</td><td>'+esc(r.revisionOf||'—')+'</td><td><button class="btn small" onclick="closeModal();previewReport(\''+esc(r.documentId||r.id)+'\')">Preview</button></td></tr>').join('');
  openModal('<div class="dialoghead"><h2>Revision History</h2><button class="x" onclick="closeModal()">×</button></div><div class="notice">Riwayat bersifat append-only pada runtime synthetic. Revision lama tidak ditimpa.</div><div class="tablewrap" style="margin-top:12px"><table class="table"><thead><tr><th>Revision</th><th>ID</th><th>Status</th><th>Dibuat</th><th>Revision Of</th><th>Aksi</th></tr></thead><tbody>'+rows+'</tbody></table></div>');
  audit('DOCUMENT_REVISION_HISTORY_VIEW','DOCUMENT',id); save();
}
function prepareBulkDownloadManifest(){
  const ids=selectedFinalReportIds();
  try{
    const manifest=window.mtaDailyGuardD57.createBulkManifest(db.documents,ids,reportFilterState());
    manifest.generatedAt=now();
    audit('DOCUMENT_BULK_DOWNLOAD_PREPARE','DOCUMENT_BULK',manifest.items.map(x=>x.documentId).join(','));
    save();
    const blob=new Blob([JSON.stringify(manifest,null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='MTA-DETENI-Bulk-Download-Manifest.json';a.click();
    toast('Manifest bulk disiapkan: '+manifest.count+' FINAL');
  }catch(err){toast('Bulk belum dapat disiapkan: '+err.message)}
}
function documents(v){
  const body='<div class="toolbar"><button class="btn primary" onclick="generateReport()">+ Draft Laporan Harian</button><label class="field" style="min-width:145px"><span class="label">Tanggal</span><input id="d57Date" type="date" onchange="applyDailyReportFilters()"></label><label class="field" style="min-width:130px"><span class="label">Regu</span><select id="d57Regu" onchange="applyDailyReportFilters()"><option value="">Semua Regu</option>'+reportFilterOptions('reguId')+'</select></label><label class="field" style="min-width:130px"><span class="label">Shift</span><select id="d57Shift" onchange="applyDailyReportFilters()"><option value="">Semua Shift</option>'+reportFilterOptions('shiftId')+'</select></label><button class="btn" onclick="clearDailyReportFilters()">Reset</button><button class="btn" onclick="renderDailyReportRows()">↻ Refresh</button></div><div class="toolbar"><label><input type="checkbox" onchange="selectAllFinalReports(this.checked)"> Pilih semua FINAL</label><button class="btn" onclick="prepareBulkDownloadManifest()">Siapkan Bulk Download</button><span id="d57Count" class="muted"></span></div><div class="notice">D5.7: filter tanggal/regu/shift, revision history, single-report download audit, dan fondasi bulk ZIP. Bulk saat ini menghasilkan manifest JSON deterministik; pembuatan ZIP aktual menunggu adapter storage/PDF yang digovernance. Runtime tetap synthetic-only.</div><div class="tablewrap" style="margin-top:12px"><table class="table"><thead><tr><th>✓</th><th>ID</th><th>Tipe</th><th>Regu</th><th>Shift</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="d57Rows"></tbody></table></div>';
  v.innerHTML=shell('Dokumen','Workflow terkontrol dan retrieval surface D5.7 tanpa database production.',body);
  renderDailyReportRows();
}
function documentWorkflowButtons(d){
  const id=d.documentId||d.id,status=d.status||'DRAFT';
  const out=[];
  if(status==='DRAFT')out.push('<button class="btn small primary" onclick="validateReport(\''+esc(id)+'\')">Validate</button>');
  if(status==='VALIDATED')out.push('<button class="btn small primary" onclick="generateValidatedReport(\''+esc(id)+'\')">Generate</button>');
  if(status==='GENERATED')out.push('<button class="btn small primary" onclick="startReview(\''+esc(id)+'\')">Review</button>');
  if(status==='IN_REVIEW')out.push('<button class="btn small primary" onclick="approveReport(\''+esc(id)+'\')">Approve</button><button class="btn small danger" onclick="requestReportChanges(\''+esc(id)+'\')">Request Changes</button>');
  if(status==='CHANGES_REQUESTED')out.push('<button class="btn small primary" onclick="reviseReport(\''+esc(id)+'\')">Create Revision</button>');
  if(status==='APPROVED')out.push('<button class="btn small primary" onclick="finalizeReport(\''+esc(id)+'\')">Finalize</button>');
  if(status==='FINAL')out.push('<button class="btn small primary" onclick="downloadReport(\''+esc(id)+'\')">Download PDF</button>');
  return out.join(' ');
}
function generateReport(){
  openModal(`<div class="dialoghead"><h2>Draft Laporan Harian Regu Jaga</h2><button class="x" onclick="closeModal()">×</button></div><form id="rForm" class="formgrid"><div class="field"><label>Tanggal</label><input name="date" type="date" value="${new Date().toISOString().slice(0,10)}" required></div><div class="field"><label>Regu</label><select name="regu"><option>Bravo</option><option>Alpha</option><option>Charlie</option><option>Delta</option></select></div><div class="field"><label>Shift</label><select name="shift"><option>Pagi</option><option>Siang</option><option>Malam</option></select></div><div class="field"><label>Waktu Mulai</label><input name="time" value="07.00–14.00 WIB" required></div><div class="field full"><label>Catatan handover</label><textarea name="note" rows="3" required>Seluruh data pada preview ini bersifat sintetis.</textarea></div><div class="actions full"><button type="button" class="btn" onclick="closeModal()">Batal</button><button class="btn primary">Buat Draft</button></div></form>`);
  document.getElementById('rForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),documentId=uid('RPT');const r={documentId,documentType:window.mtaDailyGuardReport.TYPE,reportDate:f.get('date'),officeId:'MTA-SYNTHETIC-OFFICE',reguId:f.get('regu'),shiftId:f.get('shift'),startAt:f.get('time'),status:'DRAFT',templateVersion:window.mtaDailyGuardReport.VERSION,createdAt:now(),sourceRecordIds:[...db.detainees.map(x=>x.id),...db.movements.map(x=>x.id),...db.leaves.map(x=>x.id)],evidence:null,addressees:[{id:'SYN-ADD-01',label:'Pejabat/Pengawas Berwenang'}],handover:{incomingRegu:f.get('regu'),shift:f.get('shift'),attendanceStatus:'SYNTHETIC / VERIFIED FOR DEMO',note:f.get('note')},blockControl:[{id:'SYN-BLOCK-01'}],guardPost:[{id:'SYN-POST-01'}],detaineeActivity:[{id:'SYN-ACT-01'}],escortActivity:[{id:'SYN-ESCORT-01'}],mealDistribution:[{id:'SYN-MEAL-01'}],endHandover:{id:'SYN-END-01'},signatories:[{role:'Duty Commander',name:'SYNTHETIC OFFICER',identifier:'SYNTHETIC'}],photos:[],revision:1,sections:{cover:{},addressee:{text:'Kepada pejabat/pengawas yang berwenang sesuai matriks otorisasi.'},handover:{incomingRegu:f.get('regu'),shift:f.get('shift'),attendanceStatus:'SYNTHETIC / VERIFIED FOR DEMO',note:f.get('note')},block_control:{time:f.get('time'),headcount:db.detainees.filter(x=>x.status==='AKTIF').length,result:'Synthetic control check; does not represent operational conditions.'},guard_post:{activity:'Synthetic post/CCTV readiness verification.',result:'Synthetic only; operational condition not asserted.'},activity:{description:'Synthetic detainee activity supervision.',time:f.get('time'),location:'Synthetic location',result:'Structured activity placeholder awaiting verified source record.'},escort:{count:db.movements.filter(x=>x.type==='ESCORT').length,destination:'Synthetic destination',purpose:'Synthetic purpose',activity:'Synthetic escort activity.'},meal:{time:f.get('time'),result:'Synthetic scheduled-service check.',distributionStatus:'Synthetic only.'},end_handover:{time:f.get('time'),incomingRegu:'Next synthetic team',condition:'Synthetic handover condition.',outstandingIssues:'No operational issue asserted.'},closing:{statement:'This synthetic report is generated from controlled demo records and is not an operational report.'},closing_page:{}}};r.evidence=buildReportEvidence(r);db.documents.unshift(r);audit('DOCUMENT_DRAFT_CREATE','DOCUMENT',documentId);save();closeModal();render();previewReport(documentId);toast('Draft dibuat — lakukan Validate untuk melanjutkan')};
}
function validateReport(id){
  const r=documentById(id);if(!r)return;
  try{window.mtaDailyGuardReport.validate(r);validateReportEvidence(r);window.mtaDailyGuardReport.transitionStatus(r,'VALIDATED');r.validatedAt=now();audit('DOCUMENT_VALIDATE','DOCUMENT',id);save();render();previewReport(id);toast('Validation PASS — dokumen VALIDATED')}catch(err){audit('DOCUMENT_VALIDATE_FAILED','DOCUMENT',id,'FAILED');toast('Validation gagal: '+err.message)}
}
async function generateValidatedReport(id){
  const r=documentById(id);if(!r)return;
  try{
    if(r.status!=='VALIDATED')throw new Error('REPORT_NOT_VALIDATED');
    validateReportEvidence(r);r.evidence.generatedAt=now();r.generatedAt=now();
    window.mtaDailyGuardReport.transitionStatus(r,'GENERATED');
    const prepared=await window.mtaDailyGuardReport.prepare(r);
    Object.assign(r,prepared);
    audit('DOCUMENT_GENERATE','DOCUMENT',id);save();render();previewReport(id);toast('Dokumen generated — siap Review');
  }catch(err){
    if(r.status==='GENERATED'&&!r.integrityHash)r.status='VALIDATED';
    toast('Generate gagal: '+err.message)
  }
}
function workflowNote(title,submitLabel,callback){
  openModal(`<div class="dialoghead"><h2>${esc(title)}</h2><button class="x" onclick="closeModal()">×</button></div><form id="workflowNoteForm"><div class="field"><label>Catatan</label><textarea name="note" rows="5" required></textarea></div><div class="actions"><button type="button" class="btn" onclick="closeModal()">Batal</button><button class="btn primary">${esc(submitLabel)}</button></div></form>`);
  document.getElementById('workflowNoteForm').onsubmit=e=>{e.preventDefault();const note=new FormData(e.target).get('note');callback(String(note||'').trim())};
}
function startReview(id){
  const r=documentById(id);if(!r)return;
  workflowNote('Mulai Review','Masuk Review',note=>{try{window.mtaDailyGuardReport.transitionStatus(r,'IN_REVIEW');r.reviewStartedAt=now();r.reviewerNote=note;audit('DOCUMENT_REVIEW_START','DOCUMENT',id);save();closeModal();render();previewReport(id);toast('Dokumen masuk IN_REVIEW')}catch(err){toast('Review gagal: '+err.message)}});
}
function approveReport(id){
  const r=documentById(id);if(!r)return;
  workflowNote('Approve Laporan','Approve',note=>{try{window.mtaDailyGuardReport.transitionStatus(r,'APPROVED');r.approvedAt=now();r.approvalNote=note;audit('DOCUMENT_APPROVE','DOCUMENT',id);save();closeModal();render();previewReport(id);toast('Dokumen APPROVED — siap Finalize')}catch(err){toast('Approve gagal: '+err.message)}});
}
function requestReportChanges(id){
  const r=documentById(id);if(!r)return;
  workflowNote('Request Changes','Minta Perubahan',note=>{try{window.mtaDailyGuardReport.transitionStatus(r,'CHANGES_REQUESTED');r.changesRequestedAt=now();r.changeRequestNote=note;audit('DOCUMENT_CHANGES_REQUESTED','DOCUMENT',id);save();closeModal();render();toast('Perubahan diminta — buat revision baru')}catch(err){toast('Request Changes gagal: '+err.message)}});
}
function reviseReport(id){
  const source=documentById(id);if(!source)return;
  try{
    if(source.status!=='CHANGES_REQUESTED')throw new Error('REPORT_NOT_IN_CHANGES_REQUESTED');
    const revision=structuredClone(source);
    const newId=uid('RPT');
    revision.documentId=newId;revision.id=undefined;revision.status='DRAFT';revision.revision=Number(source.revision||1)+1;revision.revisionOf=source.documentId||source.id;revision.createdAt=now();delete revision.integrityHash;delete revision.filename;delete revision.generatedAt;delete revision.finalizedAt;delete revision.approvedAt;delete revision.approvalNote;delete revision.reviewStartedAt;delete revision.reviewerNote;revision.revisionCreatedAt=now();
    db.documents.unshift(revision);audit('DOCUMENT_REVISION_CREATE','DOCUMENT',newId);save();render();previewReport(newId);toast('Revision '+revision.revision+' dibuat sebagai DRAFT');
  }catch(err){toast('Revision gagal: '+err.message)}
}
function finalizeReport(id){
  const r=documentById(id);if(!r)return;
  try{window.mtaDailyGuardReport.transitionStatus(r,'FINAL');r.finalizedAt=now();audit('DOCUMENT_FINALIZE','DOCUMENT',id);save();render();toast('Dokumen FINAL dan immutable')}catch(err){toast('Finalize gagal: '+err.message)}
}
function downloadReport(id){
  const r=documentById(id);if(!r)return;
  if(r.status!=='FINAL'){toast('Download hanya tersedia untuk dokumen FINAL');return}
  window.mtaDailyGuardReport.ensureStyles();
  audit('DOCUMENT_DOWNLOAD','DOCUMENT',id);
  save();
  openModal(`<div class="dialoghead no-print"><h2>Download / Simpan PDF — ${esc(id)}</h2><button class="x" onclick="closeModal()">×</button></div><div class="notice no-print">Pilih <b>Cetak / Simpan PDF</b>, lalu pilih printer <b>Save as PDF</b> pada dialog browser. Filename: <b>${esc(r.filename||'Laporan_Harian_Regu_Jaga.pdf')}</b></div><div class="toolbar no-print"><button class="btn primary" onclick="window.print()">Cetak / Simpan PDF</button><button class="btn" onclick="closeModal()">Tutup</button></div>${reportHtml(r)}`);
}
function reportHtml(r){window.mtaDailyGuardReport.ensureStyles();return window.mtaDailyGuardReport.render(r)}
function previewReport(id){
  const r=documentById(id);if(!r)return;
  window.mtaDailyGuardReport.ensureStyles();
  const finalOnly=r.status==='FINAL';
  let evidenceNotice='';try{validateReportEvidence(r);evidenceNotice='<span class="notice">Evidence: '+esc(r.evidence.sourceRecordCount)+' source · '+esc(r.evidence.auditEventCount)+' audit</span>'}catch(err){evidenceNotice='<span class="notice">Evidence warning: '+esc(err.message)+'</span>'}
  audit('DOCUMENT_PREVIEW','DOCUMENT',r.documentId||r.id);save();openModal(`<div class="dialoghead no-print"><h2>Preview 11 Halaman — ${esc(r.documentId||r.id)}</h2><button class="x" onclick="closeModal()">×</button></div><div class="toolbar no-print"><span class="notice">Status: ${documentStatusBadge(r.status)}</span><span class="notice">Revision: ${esc(r.revision||1)}</span>${evidenceNotice}<button class="btn primary" onclick="window.print()">Cetak / Simpan PDF</button>${finalOnly?'<button class="btn primary" onclick="downloadReport(\''+esc(r.documentId||r.id)+'\')">Download</button>':''}</div>${reportHtml(r)}`);
}
function auditView(v){const rows=db.audit.map(a=>`<div class="event"><b>${esc(a.action)}</b> · ${esc(a.result)} · ${esc(a.resourceType)} ${esc(a.resourceId)}<small>${new Date(a.occurredAt).toLocaleString('id-ID')} · actor ${esc(a.actor)} · request ${esc(a.requestId)}</small></div>`).join('');v.innerHTML=shell('Audit Trail','Evidence lokal sintetis untuk setiap tindakan material pada demo runtime.',`<div class="toolbar"><button class="btn" onclick="verifyAudit()">Verifikasi Chain</button><button class="btn" onclick="clearDemo()">Reset Demo</button></div><div class="timeline">${rows||'<div class="empty">Belum ada event audit</div>'}</div>`)}
function verifyAudit(){toast('Audit demo valid secara event policy; hash-chain produksi menunggu kernel adapter')}
function clearDemo(){if(confirm('Reset seluruh data synthetic demo?')){db=structuredClone(seed);save();render();toast('Demo direset')}}
function show(v){current=v;document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));render()}
window.__mtaLegacyShow=show;
// Navigation is owned by the unified shell; do not register a second nav listener.
document.getElementById('backupBtn').onclick=()=>{audit('EXPORT_DOWNLOAD','BACKUP','synthetic');save();const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mta-deteni-synthetic-backup.json';a.click();toast('Backup JSON dibuat')};
document.getElementById('importBtn').onclick=()=>document.getElementById('importFile').click();
document.getElementById('importFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);validateRuntimeState(x);db=x;appendAudit(db,'BACKUP_RESTORE','BACKUP','synthetic');db.lastMutation={key:'BACKUP_RESTORE:'+now(),action:'BACKUP_RESTORE',completedAt:now()};save();render();toast('Backup dipulihkan')}catch(err){toast('Backup tidak valid: '+err.message)}};r.readAsText(f)};
if(!window.__mtaRuntimeClockTimer){window.__mtaRuntimeClockTimer=setInterval(()=>document.getElementById('clock').textContent=new Date().toLocaleString('id-ID'),1000);}
async function loadAuthenticatedRuntime(){
  if(window.__mtaRuntimeLoading)return window.__mtaRuntimeLoading;
  const scripts=[
    '/mta-state-kernel-v1.js?v=4',
    '/offline-v1.js?v=2',
    '/offline-queue-v1.js?v=2',
    '/mfe-evidence-v1.js?v=1',
    '/qr-camera-v2.js?v=4',
    '/qr-context-v1.js?v=2',
    'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js',
    '/preview-v5.js?v=13',
    '/preview-v6.js?v=9',
    '/qr-print-clean-v3.js?v=6',
    '/room-ops-v9.js?v=11',
    '/movement-v9.js?v=11',
    '/master-room-guard-v10.js?v=12',
    '/preview-v10.js?v=11',
    '/desktop-shell-v2.js?v=7',
    '/mobile-shell-v1.js?v=3',
    '/daily-guard-report-v2.js',
    '/daily-guard-report-d57.js',
    '/admin-settings-v9.js?v=4',
    '/mta-unified-shell-v2.js?v=10',
    '/mta-system-audit-v1.js?v=2'
  ];
  window.__mtaRuntimeLoading=(async()=>{
    for(const src of scripts){
      await new Promise((resolve,reject)=>{
        const existing=document.querySelector('script[data-mta-auth-runtime="'+src.split('?')[0]+'"]');
        if(existing)return resolve();
        const s=document.createElement('script');
        s.src=src;
        s.async=false;
        s.dataset.mtaAuthRuntime=src.split('?')[0];
        s.onload=()=>resolve();
        s.onerror=()=>reject(new Error('AUTH_RUNTIME_LOAD_FAILED:'+src));
        document.body.appendChild(s);
      });
    }
  })().catch(err=>{
    console.error('[MTA] authenticated runtime failed to load',err);
    const msg=document.getElementById('mtaAuthMessage');
    if(msg){msg.textContent='Runtime aplikasi gagal dimuat. Silakan refresh halaman.';msg.className='mta-auth-message error'}
    window.__mtaRuntimeLoading=null;
    throw err;
  });
  return window.__mtaRuntimeLoading;
}
async function bootMtaApp(){
  if(window.__mtaAppBooted)return;
  if(!window.__mtaAuthState?.resolved||!window.__mtaAuthState?.authenticated)return;
  if(!document.body.classList.contains('mta-auth-ready'))return;
  // Core dashboard must not wait for optional/operational enhancement scripts.
  // Render immediately after authentication; load enhancements in the background.
  try{
    db=load();
    window.__mtaAppBooted=true;
    render();
    void loadAuthenticatedRuntime().catch(err=>{
      console.warn('[MTA] optional authenticated runtime incomplete',err);
    });
  }catch(err){
    console.error('[MTA] core app boot failed',err);
    const msg=document.getElementById('mtaAuthMessage');
    if(msg){
      msg.textContent='Dashboard gagal diinisialisasi: '+(err?.message||'CORE_BOOT_FAILED');
      msg.className='mta-auth-message error';
    }
  }
}
if(!window.__mtaFullRuntimeBootListenerInstalled){
  window.__mtaFullRuntimeBootListenerInstalled=true;
  window.addEventListener('mta-auth-state',()=>{void bootMtaApp()});
  void bootMtaApp();
}