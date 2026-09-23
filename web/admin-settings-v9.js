(()=>{
const K='mta-deteni-demo-v2';
const get=()=>JSON.parse(localStorage.getItem(K)||'{}');
const put=d=>localStorage.setItem(K,JSON.stringify(d));
const E=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const uid=p=>p+'-'+crypto.randomUUID().slice(0,10).toUpperCase();
const now=()=>new Date().toISOString();
const audit=(a,t,i,r='SUCCESS')=>{const d=get();d.audit=d.audit||[];d.audit.unshift({id:uid('AUD'),action:a,resourceType:t,resourceId:i||'',result:r,occurredAt:now(),actor:'DEMO-ADMIN',requestId:uid('REQ'),correlationId:uid('COR'),policyVersion:'AUTHZ-1.0'});put(d)};
function ensure(){const d=get();d.adminSettings=d.adminSettings||{role:'ADMIN',facilityName:'MTA DETENI Digital',timezone:'Asia/Jakarta',qrPolicy:'OPAQUE_TOKEN',migrationFreeze:true,ai:'OFF'};d.blocks=d.blocks||[];d.rooms=d.rooms||[];d.qr=d.qr||{detainee:{},room:{},leave:{}};d.qr.room=d.qr.room||{};d.adminCatalogs=d.adminCatalogs||{};const defaults={dutyGroups:['REGU A','REGU B','REGU C','REGU D'],shifts:['PAGI','SIANG','MALAM'],movementTypes:['INTERNAL','TRANSFER_KAMAR','KLINIK','SIDANG','LAINNYA'],leaveTypes:['IZIN SEMENTARA','PEMERIKSAAN KESEHATAN','PENGAWALAN','LAINNYA'],documentTypes:['LAPORAN HARIAN','BERITA ACARA','SURAT TUGAS','SURAT PENGANTAR','LAINNYA'],classifications:['INTERNAL','TERBATAS','RAHASIA'],roomTypes:['STANDARD','ISOLATION','OBSERVATION','MEDICAL','TRANSIT'],roomCategories:['UMUM','PRIA','WANITA','KHUSUS']};for(const [k,v] of Object.entries(defaults))d.adminCatalogs[k]=Array.isArray(d.adminCatalogs[k])&&d.adminCatalogs[k].length?d.adminCatalogs[k]:v;d.rooms.forEach(r=>{if(!r.blockId){const b=d.blocks.find(b=>String(b.name).toLowerCase()===String(r.block).toLowerCase());if(b)r.blockId=b.id}if(!d.qr.room[r.id])d.qr.room[r.id]={token:uid('RMQR'),status:r.status==='ACTIVE'?'ACTIVE':'SUSPENDED'}});put(d);return d}
function nav(){const n=document.querySelector('#nav');if(!n||document.querySelector('#p9settings'))return;const b=document.createElement('button');b.id='p9settings';b.dataset.view='p9settings';b.textContent='Pengaturan';b.onclick=e=>{e.stopPropagation();settings()};n.appendChild(b)}
function settings(){
  const d=ensure();
  d.adminSettings.aiSettings=d.adminSettings.aiSettings||{enabled:false,provider:'Gemini',apiUrl:'',model:'',apiKeyConfigured:false};
  const app=document.querySelector('#appView');
  if(!app)return;
  if(d.adminSettings.role!=='ADMIN'){
    app.innerHTML=shell('Pengaturan','Akses dibatasi untuk Administrator.',
      '<div class="p6card"><div class="notice p6danger">ADMIN ONLY · Role synthetic saat ini: '+E(d.adminSettings.role||'UNSET')+'</div></div>');
    return;
  }

  const blockRows=d.blocks.map(b=>{
    const count=d.rooms.filter(r=>r.blockId===b.id||r.block===b.name).length;
    return '<tr><td><b>'+E(b.name)+'</b></td><td>'+E(b.status)+'</td><td>'+count+'</td>'+
      '<td><button class="btn small" onclick="window.p9editBlock(\''+E(b.id)+'\')">Edit</button></td></tr>';
  }).join('');

  const roomRows=d.rooms.map(r=>{
    const occupancy=roomOccupancy(d,r);
    return '<tr><td>'+E(r.block)+'</td><td><b>'+E(r.room)+'</b></td><td>'+occupancy+'/'+(Number(r.capacity)||0)+'</td>'+
      '<td>'+E(r.type||'STANDARD')+'</td><td>'+E(r.gender||'UMUM')+'</td><td>'+E(r.status||'ACTIVE')+'</td>'+
      '<td><button class="btn small" onclick="window.p9editRoom(\''+E(r.id)+'\')">Edit</button></td></tr>';
  }).join('');

  const catalogDefs=[
    ['dutyGroups','Regu Jaga'],
    ['shifts','Shift'],
    ['movementTypes','Jenis Pergerakan'],
    ['leaveTypes','Jenis Izin'],
    ['documentTypes','Jenis Dokumen'],
    ['classifications','Klasifikasi Dokumen']
  ];

  const catalogCards=catalogDefs.map(([key,label])=>{
    const rows=d.adminCatalogs[key].map((value,index)=>
      '<tr><td>'+E(value)+'</td><td><button class="btn small danger" onclick="window.p9removeCatalog(\''+
      E(key)+'\','+index+')">Nonaktifkan</button></td></tr>'
    ).join('');
    return '<div class="p6card"><div class="toolbar"><h2 style="margin-right:auto">'+E(label)+'</h2>'+
      '<button class="btn primary small" onclick="window.p9addCatalog(\''+E(key)+'\',\''+E(label)+'\')">+ Tambah</button></div>'+
      '<div class="tablewrap"><table class="table"><thead><tr><th>Nilai</th><th>Aksi</th></tr></thead><tbody>'+
      rows+'</tbody></table></div></div>';
  }).join('');

  const body=
    '<div class="p6grid">'+
      '<div class="p6card"><h2>System</h2><div class="formgrid">'+
        '<div class="field"><label>Nama fasilitas</label><input id="p9facility" value="'+E(d.adminSettings.facilityName)+'"></div>'+
        '<div class="field"><label>Zona waktu</label><select id="p9tz">'+
          '<option '+(d.adminSettings.timezone==='Asia/Jakarta'?'selected':'')+'>Asia/Jakarta</option>'+
          '<option '+(d.adminSettings.timezone==='Asia/Makassar'?'selected':'')+'>Asia/Makassar</option>'+
          '<option '+(d.adminSettings.timezone==='Asia/Jayapura'?'selected':'')+'>Asia/Jayapura</option>'+
        '</select></div>'+
        '<div class="field"><label>AI Runtime</label><input value="'+(d.adminSettings.aiSettings.enabled?'ON':'OFF')+'" disabled></div>'+
        '<div class="field"><label>Migration Freeze</label><input value="'+(d.adminSettings.migrationFreeze?'TRUE':'FALSE')+'" disabled></div>'+
      '</div><div class="actions"><button class="btn primary" onclick="window.p9saveSystem()">Simpan System</button></div></div>'+
      '<div class="p6card"><h2>Pengaturan API AI</h2>'+
        '<div class="notice">AI bersifat assistive-only. API key tidak disimpan di localStorage/browser. Untuk production gunakan secret server-side <b>AI_API_KEY</b>; field API Key di bawah hanya sebagai indikator konfigurasi dan tidak dipersist.</div>'+
        '<div class="formgrid" style="margin-top:12px">'+
          '<div class="field"><label>AI Enabled</label><select id="p9aiEnabled"><option value="false" '+(!d.adminSettings.aiSettings.enabled?'selected':'')+'>OFF</option><option value="true" '+(d.adminSettings.aiSettings.enabled?'selected':'')+'>ON</option></select></div>'+
          '<div class="field"><label>Provider</label><select id="p9aiProvider">'+
            '<option '+(d.adminSettings.aiSettings.provider==='Gemini'?'selected':'')+'>Gemini</option>'+
            '<option '+(d.adminSettings.aiSettings.provider==='OpenAI'?'selected':'')+'>OpenAI</option>'+
            '<option '+(d.adminSettings.aiSettings.provider==='Custom'?'selected':'')+'>Custom</option>'+
          '</select></div>'+
          '<div class="field"><label>API URL</label><input id="p9aiUrl" placeholder="https://provider.example/v1" value="'+E(d.adminSettings.aiSettings.apiUrl||'')+'"></div>'+
          '<div class="field"><label>Model</label><input id="p9aiModel" placeholder="Nama model" value="'+E(d.adminSettings.aiSettings.model||'')+'"></div>'+
          '<div class="field full"><label>API Key</label><input id="p9aiKey" type="password" autocomplete="new-password" placeholder="Masukkan hanya saat menyimpan/mengganti key"><small id="p9aiKeyStatus" class="p6mini">Status: <b>'+(d.adminSettings.aiSettings.apiKeyConfigured?'TERKONFIGURASI SERVER':'BELUM TERKONFIGURASI SERVER')+'</b></small></div>'+
        '</div>'+
        '<div class="actions"><button class="btn" onclick="window.p9testAiConnection()">Test Connection</button><button class="btn" onclick="window.p9testAiJob()">Test AI Job Sintetis</button><button class="btn" onclick="window.p9clearAiConfig()">Matikan AI &amp; Hapus Key</button><button class="btn primary" onclick="window.p9saveAiSettings()">Simpan Pengaturan API AI</button></div>'+
      '</div>'+
      '<div class="p6card"><h2>Security &amp; Governance</h2><div class="notice">Role synthetic: <b>'+E(d.adminSettings.role)+
        '</b><br>QR Policy: <b>'+E(d.adminSettings.qrPolicy)+'</b><br>Real data: <b>DISALLOWED IN PREVIEW</b></div>'+
        '<p class="p6mini">User, role, permission, scope, duty assignment, dan policy produksi tetap mengikuti authorization boundary; password/secret tidak disimpan di runtime preview.</p>'+
        '<div style="margin-top:14px;border-top:1px solid #edf0f4;padding-top:14px">'+
        '<div class="toolbar"><h3 style="margin-right:auto;font-size:15px">Anggota / User</h3><button class="btn small" onclick="window.p9loadUsers()">↻ Muat Ulang</button></div>'+
        '<div class="notice">Tidak ada pendaftaran mandiri. Pembuatan dan pengelolaan akun hanya melalui Administrator. Password awal hanya digunakan saat pembuatan dan tidak pernah ditampilkan kembali.</div>'+
        '<div class="formgrid" style="margin-top:10px">'+
        '<div class="field"><label>Nama</label><input id="p9userName" autocomplete="off" placeholder="Nama pengguna"></div>'+
        '<div class="field"><label>Email</label><input id="p9userEmail" type="email" autocomplete="off" placeholder="nama@instansi.go.id"></div>'+
        '<div class="field"><label>Role</label><select id="p9userRole"><option>VIEWER</option><option>REVIEWER</option><option>AUDITOR</option><option>EDITOR</option><option>ADMIN</option><option>OWNER</option></select></div>'+
        '<div class="field"><label>Password awal · min. 12 karakter</label><input id="p9userPassword" type="password" autocomplete="new-password" placeholder="Password awal"></div>'+
        '<div class="field full"><label>Konfirmasi Password</label><input id="p9userPassword2" type="password" autocomplete="new-password" placeholder="Ulangi password awal"></div>'+
        '</div>'+
        '<div class="actions"><button class="btn primary" onclick="window.p9createUser()">+ Buat Akun oleh Admin</button></div>'+
        '<div id="p9UsersTable" class="tablewrap" style="margin-top:12px"><div class="empty">Muat daftar anggota setelah autentikasi production aktif.</div></div>'+
        '</div></div>'+
    '</div>'+
    '<div class="p6card" style="margin-top:12px"><div class="toolbar"><h2 style="margin-right:auto">Master Blok</h2>'+
      '<button class="btn primary" onclick="window.p9addBlock()">+ Tambah Blok</button></div>'+
      '<div class="tablewrap"><table class="table"><thead><tr><th>Blok</th><th>Status</th><th>Jumlah Kamar</th><th>Aksi</th></tr></thead><tbody>'+
      (blockRows||'<tr><td colspan="4" class="empty">Belum ada blok.</td></tr>')+'</tbody></table></div></div>'+
    '<div class="p6card" style="margin-top:12px"><div class="toolbar"><h2 style="margin-right:auto">Master Kamar</h2>'+
      '<button class="btn primary" onclick="window.p9addRoom()">+ Tambah Kamar</button></div>'+
      '<div class="tablewrap"><table class="table"><thead><tr><th>Blok</th><th>Kamar</th><th>Occupancy</th><th>Tipe</th><th>Kategori</th><th>Status</th><th>Aksi</th></tr></thead><tbody>'+
      (roomRows||'<tr><td colspan="7" class="empty">Belum ada master kamar.</td></tr>')+'</tbody></table>'+
      '<div class="notice" style="margin-top:10px">Kamar hanya dibuat/diubah di sini. Modul Data Deteni, Penempatan, dan Pergerakan hanya memilih Room ID dari master.</div></div></div>'+
    '<div class="p6grid" style="margin-top:12px">'+catalogCards+'</div>'+
    '<div class="p6card" style="margin-top:12px"><h2>Master Room Parameter</h2><div class="notice">Tipe: '+
      d.adminCatalogs.roomTypes.map(E).join(' · ')+'<br>Kategori: '+d.adminCatalogs.roomCategories.map(E).join(' · ')+'</div></div>';

  app.innerHTML=shell(
    'Pengaturan Administrator',
    'Control plane untuk master data dan konfigurasi operasional. Runtime tetap synthetic/local.',
    body
  );
  organizeSettingsPages(app);
    if(window.MTADeteniRuntimeAdapter?.getMode?.()==='CLOUD' && window.mtaProductionApi){
    window.mtaProductionApi.get('ai-config').then(r=>{
      const a=r?.data||{}, en=document.querySelector('#p9aiEnabled'), pr=document.querySelector('#p9aiProvider'), url=document.querySelector('#p9aiUrl'), model=document.querySelector('#p9aiModel'), st=document.querySelector('#p9aiKeyStatus');
      if(en)en.value=String(!!a.enabled); if(pr&&a.provider)pr.value=a.provider; if(url)url.value=a.api_url||''; if(model)model.value=a.model||'';
      if(st)st.innerHTML='<b>'+((a.api_key_configured||a.key_configured)?'TERKONFIGURASI SERVER':'BELUM TERKONFIGURASI SERVER')+'</b>';
    }).catch(()=>{});
  }
  if(window.MTADeteniRuntimeAdapter?.getMode?.()==='CLOUD' && window.mtaProductionApi)window.p9loadUsers?.();
}

function organizeSettingsPages(app){
  if(!app||app.querySelector('#p9settingsPages'))return;
  const groups=[...app.children].filter(x=>x.classList?.contains('p6grid')||x.classList?.contains('p6card'));
  const systemGrid=groups.find(x=>x.classList.contains('p6grid')&&x.querySelector('h2')?.textContent.trim()==='System');
  const firstCards=systemGrid?[...systemGrid.children]:[];
  const system=firstCards[0],ai=firstCards[1],security=firstCards[2];
  const directCards=groups.filter(x=>x.classList.contains('p6card'));
  const block=directCards.find(x=>x.querySelector('h2')?.textContent.trim()==='Master Blok');
  const room=directCards.find(x=>x.querySelector('h2')?.textContent.trim()==='Master Kamar');
  const roomParam=directCards.find(x=>x.querySelector('h2')?.textContent.trim()==='Master Room Parameter');
  const catalogGrid=groups.find(x=>x.classList.contains('p6grid')&&x!==systemGrid&&x.querySelector('h2')?.textContent.trim()==='Regu Jaga');
  if(!system||!ai||!security||!block||!room||!catalogGrid||!roomParam)return;
  const old=[systemGrid,block,room,catalogGrid,roomParam];
  const wrap=document.createElement('div');wrap.id='p9settingsPages';wrap.className='p9settingsLayout';
  const menu=document.createElement('div');menu.className='p9settingsMenu p6card';
  menu.innerHTML='<div class="p9settingsMenuTitle">Pengaturan Administrator</div><button data-p9page="system">System</button><button data-p9page="ai">Pengaturan API AI</button><button data-p9page="security">Security &amp; Governance</button><button data-p9page="runtime-integrity">Runtime Integrity</button><button data-p9page="block">Master Blok</button><button data-p9page="room">Master Kamar</button><button data-p9page="catalog">Master Catalog</button><button data-p9page="room-parameter">Master Room Parameter</button>';
  const content=document.createElement('div');content.className='p9settingsContent';
  const runtime=document.createElement('section');runtime.className='p9settingsPage';runtime.dataset.p9page='runtime-integrity';runtime.innerHTML=runtimeIntegrityHtml();
  const defs={system:[system],ai:[ai],security:[security], 'runtime-integrity':[runtime],block:[block],room:[room],catalog:[catalogGrid], 'room-parameter':[roomParam]};
  Object.entries(defs).forEach(([key,nodes])=>{const p=document.createElement('section');p.className='p9settingsPage';p.dataset.p9page=key;nodes.forEach(n=>{n.remove();p.appendChild(n)});content.appendChild(p)});
  wrap.append(menu,content);
  const first=app.querySelector('.hero'); if(first)first.after(wrap); else app.prepend(wrap);
  groups.forEach(g=>{if(g.parentNode===app)g.remove()});
  const style=document.createElement('style');style.textContent='.p9settingsLayout{display:grid;grid-template-columns:minmax(190px,240px) 1fr;gap:12px;align-items:start}.p9runtimeRows{display:grid;gap:6px;margin-top:12px}.p9runtimeRow{display:grid;grid-template-columns:62px 180px 1fr;gap:10px;align-items:center;padding:10px 12px;border-left:3px solid rgba(80,100,130,.35);background:rgba(127,127,127,.035);border-radius:4px}.p9runtimeRow.pass{border-left-color:#1f9d55}.p9runtimeRow.fail{border-left-color:#d93025}.p9runtimeBadge{font-weight:700;font-size:12px}.p9runtimeRow.pass .p9runtimeBadge{color:#168044}.p9runtimeRow.fail .p9runtimeBadge{color:#c5221f}.p9runtimeName{font-weight:600}.p9runtimeDetail{color:#667085;font-size:13px}@media(max-width:800px){.p9runtimeRow{grid-template-columns:62px 1fr}.p9runtimeDetail{grid-column:2}}.p9settingsMenu{position:sticky;top:12px;padding:8px}.p9settingsMenuTitle{font-weight:700;padding:10px 12px 14px}.p9settingsMenu button{display:block;width:100%;text-align:left;border:0;background:transparent;padding:10px 12px;border-radius:8px;cursor:pointer}.p9settingsMenu button:hover,.p9settingsMenu button.active{background:rgba(127,127,127,.12)}.p9settingsPage{display:none}.p9settingsPage.active{display:block}@media(max-width:800px){.p9settingsLayout{grid-template-columns:1fr}.p9settingsMenu{position:static;display:grid;grid-template-columns:1fr 1fr;gap:4px}.p9settingsMenuTitle{grid-column:1/-1}}';app.appendChild(style);
  const activate=key=>{app.querySelectorAll('.p9settingsPage').forEach(p=>p.classList.toggle('active',p.dataset.p9page===key));menu.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.p9page===key));window.__p9SettingsPage=key;if(key==='runtime-integrity')setTimeout(()=>window.p9runRuntimeIntegrity?.(),0)};
  menu.querySelectorAll('button').forEach(b=>b.onclick=()=>activate(b.dataset.p9page));
  activate(window.__p9SettingsPage||'system');
}


window.p9loadUsers=async()=>{
  const host=document.querySelector('#p9UsersTable');if(!host||!window.mtaProductionApi)return;
  if(window.MTADeteniRuntimeAdapter?.getMode?.()!=='CLOUD'){host.innerHTML='<div class="empty">Runtime synthetic/local tidak memuat akun production.</div>';return;}
  host.innerHTML='<div class="empty">Memuat daftar anggota…</div>';
  try{
    const r=await window.mtaProductionApi.list('admin-users');
    const rows=(r?.data||[]).map(u=>'<tr><td><b>'+E(u.display_name||'-')+'</b></td><td>'+E(u.email||'-')+'</td><td>'+E(u.role)+'</td><td>'+E(u.active?'ACTIVE':'DISABLED')+'</td><td><button class="btn small" onclick="window.p9toggleUser(\''+E(u.id)+'\','+(!u.active)+')">'+(u.active?'Nonaktifkan':'Aktifkan')+'</button></td></tr>').join('');
    host.innerHTML='<table class="table"><thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Status</th><th>Aksi</th></tr></thead><tbody>'+(rows||'<tr><td colspan="5" class="empty">Belum ada anggota.</td></tr>')+'</tbody></table>';
  }catch(e){host.innerHTML='<div class="empty">Gagal memuat anggota: '+E(e?.message||'API error')+'</div>'}
};
window.p9createUser=async()=>{
  const name=document.querySelector('#p9userName')?.value.trim()||'',email=document.querySelector('#p9userEmail')?.value.trim().toLowerCase()||'',role=document.querySelector('#p9userRole')?.value||'VIEWER',p1=document.querySelector('#p9userPassword')?.value||'',p2=document.querySelector('#p9userPassword2')?.value||'';
  if(!email||!name)return toast('Nama dan email wajib diisi.');
  if(p1.length<12)return toast('Password awal minimal 12 karakter.');
  if(p1!==p2)return toast('Konfirmasi password tidak cocok.');
  if(window.MTADeteniRuntimeAdapter?.getMode?.()!=='CLOUD')return toast('Pembuatan akun hanya tersedia pada runtime production/authenticated.');
  try{
    const r=await window.mtaProductionApi.create('admin-users',{display_name:name,email,password:p1,role});
    document.querySelector('#p9userPassword').value='';document.querySelector('#p9userPassword2').value='';
    toast('Akun berhasil dibuat oleh Administrator.');await window.p9loadUsers();return r;
  }catch(e){toast(e?.data?.error||e?.message||'Gagal membuat akun.')}
};
window.p9toggleUser=async(id,active)=>{
  if(!window.mtaProductionApi||window.MTADeteniRuntimeAdapter?.getMode?.()!=='CLOUD')return;
  try{await window.mtaProductionApi.update('admin-users',id,{active});toast(active?'Akun diaktifkan.':'Akun dinonaktifkan.');await window.p9loadUsers()}catch(e){toast(e?.data?.error||e?.message||'Gagal memperbarui akun.')}
};

function runtimeIntegrityHtml(){
  return '<div class="p6card p9runtimeIntegrity"><div class="toolbar"><div style="margin-right:auto"><h2 style="margin:0">Runtime Integrity</h2><div class="p6mini">Pemeriksaan integritas runtime lokal/synthetic. Panel ini hanya tersedia di Pengaturan Administrator.</div></div><button class="btn" onclick="window.p9runRuntimeIntegrity()">↻ Refresh</button><button class="btn primary" onclick="window.p9runRuntimeIntegrity()">▶ Jalankan Ulang Tes</button></div><div id="p9RuntimeIntegrityRows" class="p9runtimeRows"><div class="notice">Menyiapkan pemeriksaan…</div></div></div>';
}
function runtimeIntegrityChecks(){
  const readLocal=()=>{try{return JSON.parse(localStorage.getItem('mta-deteni-demo-v2')||'null')}catch{return null}};
  const local=readLocal();
  const nav=!!document.querySelector('#nav');
  const show=typeof window.show==='function';
  const camera=typeof window.mtaQrCameraV2==='object'&&typeof window.mtaQrCameraV2?.open==='function';
  const context=typeof window.MTAQrContext==='object';
  const offline=!!('indexedDB' in window);
  const roomOps=typeof window.roomOps==='object'||typeof window.p9addRoom==='function';
  const qrPrint=typeof window.p6printQR==='function'||typeof window.printQR==='function';
  const qrResources=typeof window.qrcode==='function'||typeof window.mtaQrCameraV2==='object';
  const admin=!!document.querySelector('#p9settingsPages');
  const synthetic=!!local&&Array.isArray(local.detainees)&&Array.isArray(local.audit);
  const aiOff=ensure().adminSettings?.aiSettings?.enabled!==true;
  const dbDisconnected=window.MTADeteniRuntimeAdapter?.getMode?.()!=='CLOUD';
  const freeze=ensure().adminSettings?.migrationFreeze===true;
  return [
    ['INDEX_DATA',!!local&&Array.isArray(local.detainees),'Synthetic index tersedia'],
    ['NAV',nav,'Navigasi utama tersedia'],
    ['SHOW',show,'Router show tersedia'],
    ['QR_CAMERA',camera,'QR camera runtime tersedia'],
    ['QR_CONTEXT',context,'QR context tersedia'],
    ['OFFLINE_QUEUE',offline,'IndexedDB/offline runtime tersedia'],
    ['ROOM_OPS',roomOps,'Room operations runtime tersedia'],
    ['QR_PRINT',qrPrint,'QR print handler tersedia'],
    ['QR_RESOURCES',qrResources,'QR encoder/resource tersedia'],
    ['ADMIN_SETTINGS',admin,'Admin settings surface aktif'],
    ['SYNTHETIC_DATA',synthetic,'Data synthetic terdeteksi'],
    ['AI_OFF',aiOff,'AI runtime tidak aktif'],
    ['DB_DISCONNECTED',dbDisconnected,'Runtime tidak terhubung ke database produksi'],
    ['MIGRATION_FREEZE',freeze,'Migration freeze aktif']
  ];
}
window.p9runRuntimeIntegrity=()=>{
  const rows=document.querySelector('#p9RuntimeIntegrityRows');if(!rows)return;
  const checks=runtimeIntegrityChecks();
  rows.innerHTML=checks.map(([name,ok,detail])=>'<div class="p9runtimeRow '+(ok?'pass':'fail')+'"><span class="p9runtimeBadge">'+(ok?'PASS':'FAIL')+'</span><span class="p9runtimeName">'+E(name)+'</span><span class="p9runtimeDetail">'+E(detail)+'</span></div>').join('');
  const failed=checks.filter(x=>!x[1]).length;
  const summary=document.createElement('div');summary.className='notice '+(failed?'p6danger':'p6success');summary.style.marginTop='10px';
  summary.innerHTML=failed?'<b>'+failed+' pemeriksaan gagal.</b> Periksa resource/runtime terkait sebelum certification.':'<b>Semua pemeriksaan runtime PASS.</b> Runtime Integrity sesuai kontrak synthetic/admin.';
  rows.appendChild(summary);
};

function shell(t,desc,b){return `<section class="hero"><h1>${t}</h1><p class="sub">${desc}</p></section>${b}`}
window.p9saveSystem=()=>{const d=ensure();d.adminSettings.facilityName=(document.querySelector('#p9facility')?.value||d.adminSettings.facilityName).trim();d.adminSettings.timezone=document.querySelector('#p9tz')?.value||d.adminSettings.timezone;audit('ADMIN_SETTINGS_UPDATE','SYSTEM','ADMIN');put(d);settings();toast('Pengaturan system tersimpan.')};
window.p9saveAiSettings=async()=>{const d=ensure(),enabled=document.querySelector('#p9aiEnabled')?.value==='true',provider=document.querySelector('#p9aiProvider')?.value||'Gemini',apiUrl=(document.querySelector('#p9aiUrl')?.value||'').trim(),model=(document.querySelector('#p9aiModel')?.value||'').trim(),key=(document.querySelector('#p9aiKey')?.value||'').trim();if(enabled&&(!provider||!apiUrl||!model)){toast('AI ON memerlukan Provider, API URL, dan Model.');return}try{if(window.MTADeteniRuntimeAdapter?.getMode?.()==='CLOUD'&&window.mtaProductionApi){const r=await window.mtaProductionApi.update('ai-config',null,{enabled,provider,api_url:apiUrl,model,...(key?{api_key:key}:{})});d.adminSettings.aiSettings={...d.adminSettings.aiSettings,enabled,provider,apiUrl,model,apiKeyConfigured:!!r?.data?.api_key_configured};toast('Pengaturan API AI tersimpan aman di server/Vault.');settings();return}d.adminSettings.aiSettings={...d.adminSettings.aiSettings,enabled,provider,apiUrl,model};audit('AI_SETTINGS_UPDATE','AI_CONFIGURATION',provider);put(d);settings();toast('Pengaturan AI tersimpan pada runtime synthetic.')}catch(e){toast('Gagal menyimpan pengaturan AI: '+(e?.message||'API error'))}};
window.p9clearAiConfig=async()=>{try{if(window.MTADeteniRuntimeAdapter?.getMode?.()==='CLOUD'&&window.mtaProductionApi){await window.mtaProductionApi.update('ai-config',null,{enabled:false,clear_api_key:true});toast('AI dimatikan dan API key dihapus dari Vault.');settings();return}}catch(e){toast('Gagal mematikan AI: '+(e?.message||'API error'));return}const d=ensure();d.adminSettings.aiSettings={...d.adminSettings.aiSettings,enabled:false};audit('AI_SETTINGS_DISABLE','AI_CONFIGURATION',d.adminSettings.aiSettings.provider||'AI');put(d);settings();toast('AI dimatikan.')};
window.p9testAiConnection=async()=>{try{if(window.MTADeteniRuntimeAdapter?.getMode?.()==='CLOUD'&&window.mtaProductionApi){const r=await window.mtaProductionApi.create('ai-health',{});toast(r?.data?.message||((r?.ok)?'AI connection PASS':'AI connection FAILED'));return}toast('Health check tersedia pada CLOUD runtime setelah API key dikonfigurasi.')}catch(e){toast('AI health check gagal: '+(e?.message||'API error'))}};

window.p9testAiJob=async()=>{try{if(window.MTADeteniRuntimeAdapter?.getMode?.()==='CLOUD'&&window.mtaProductionApi){const r=await window.mtaProductionApi.create('ai-job',{job_type:'SYNTHETIC_TEST',input_ref:'F5-AI-SYNTHETIC-TEST'});toast(r?.data?.message||((r?.ok)?'AI synthetic job PASS':'AI synthetic job FAILED'));return}toast('Synthetic AI job tersedia pada CLOUD runtime setelah API key dikonfigurasi.')}catch(e){toast('AI synthetic job gagal: '+(e?.message||'API error'))}};window.p9addCatalog=(key,label)=>{openModal(`<div class="dialoghead"><h2>Tambah ${E(label)}</h2><button class="x" onclick="closeModal()">×</button></div><div class="field"><label>Nilai</label><input id="p9cat" placeholder="Masukkan nilai master"></div><div class="actions"><button class="btn" onclick="closeModal()">Batal</button><button class="btn primary" onclick="window.p9saveCatalog('${E(key)}')">Simpan</button></div>`) };
window.p9saveCatalog=key=>{const d=ensure(),v=(document.querySelector('#p9cat')?.value||'').trim();if(!v){toast('Nilai wajib diisi.');return}if(d.adminCatalogs[key].some(x=>x.toLowerCase()===v.toLowerCase())){toast('Nilai sudah terdaftar.');return}d.adminCatalogs[key].push(v);audit('MASTER_CATALOG_CREATE','ADMIN_CATALOG',key);put(d);closeModal();settings();toast('Master tersimpan.')};
window.p9removeCatalog=(key,i)=>{const d=ensure();const v=d.adminCatalogs[key]?.[i];if(!v)return;if(!confirm('Nonaktifkan master '+v+'?'))return;d.adminCatalogs[key].splice(i,1);audit('MASTER_CATALOG_DEACTIVATE','ADMIN_CATALOG',key);put(d);settings();toast('Master dinonaktifkan.')};
window.p9addBlock=()=>{ensure();openModal(`<div class="dialoghead"><h2>Tambah Blok</h2><button class="x" onclick="closeModal()">×</button></div><div class="formgrid"><div class="field full"><label>Nama Blok</label><input id="p9bname" placeholder="Blok C"></div><div class="field"><label>Status</label><select id="p9bstatus"><option>ACTIVE</option><option>INACTIVE</option></select></div></div><div class="actions"><button class="btn" onclick="closeModal()">Batal</button><button class="btn primary" onclick="window.p9saveBlock()">Simpan</button></div>`)};
window.p9saveBlock=()=>{const d=ensure(),name=(document.querySelector('#p9bname')?.value||'').trim(),status=document.querySelector('#p9bstatus')?.value||'ACTIVE';if(!name){toast('Nama blok wajib diisi.');return}if(d.blocks.some(b=>b.name.toLowerCase()===name.toLowerCase())){toast('Blok sudah terdaftar.');return}const b={id:uid('BLK'),name,status,createdAt:now(),source:'ADMIN_MASTER'};d.blocks.push(b);audit('BLOCK_CREATE','BLOCK',b.id);put(d);closeModal();settings();toast('Blok tersimpan.')};
window.p9editBlock=id=>{const d=ensure(),b=d.blocks.find(x=>x.id===id);if(!b)return;openModal(`<div class="dialoghead"><h2>Edit Blok</h2><button class="x" onclick="closeModal()">×</button></div><div class="formgrid"><div class="field full"><label>Nama Blok</label><input id="p9bname" value="${E(b.name)}"></div><div class="field"><label>Status</label><select id="p9bstatus"><option ${b.status==='ACTIVE'?'selected':''}>ACTIVE</option><option ${b.status==='INACTIVE'?'selected':''}>INACTIVE</option></select></div></div><div class="actions"><button class="btn" onclick="closeModal()">Batal</button><button class="btn primary" onclick="window.p9saveBlockEdit('${E(id)}')">Simpan</button></div>`)};
window.p9saveBlockEdit=id=>{const d=ensure(),b=d.blocks.find(x=>x.id===id),name=(document.querySelector('#p9bname')?.value||'').trim();if(!b||!name)return;if(d.blocks.some(x=>x.id!==id&&x.name.toLowerCase()===name.toLowerCase())){toast('Nama blok duplikat.');return}b.name=name;b.status=document.querySelector('#p9bstatus')?.value||'ACTIVE';d.rooms.filter(r=>r.blockId===id).forEach(r=>r.block=name);audit('BLOCK_UPDATE','BLOCK',id);put(d);closeModal();settings();toast('Blok diperbarui.')};
function blockOptions(d,onlyActive=true){return d.blocks.filter(b=>!onlyActive||b.status==='ACTIVE').map(b=>`<option value="${E(b.id)}">${E(b.name)}</option>`).join('')}
window.p9addRoom=()=>{const d=ensure();if(!d.blocks.some(b=>b.status==='ACTIVE')){toast('Buat Master Blok aktif terlebih dahulu.');return}openModal(`<div class="dialoghead"><h2>Tambah Master Kamar</h2><button class="x" onclick="closeModal()">×</button></div><form id="p9roomForm" class="formgrid"><div class="field"><label>Blok</label><select name="blockId" required>${blockOptions(d)}</select></div><div class="field"><label>Nomor/Nama Kamar</label><input name="room" required placeholder="Kamar 03"></div><div class="field"><label>Kapasitas</label><input name="capacity" type="number" min="1" max="999" value="4" required></div><div class="field"><label>Tipe Kamar</label><select name="type">${d.adminCatalogs.roomTypes.map(x=>`<option>${E(x)}</option>`).join('')}</select></div><div class="field"><label>Kategori</label><select name="gender">${d.adminCatalogs.roomCategories.map(x=>`<option>${E(x)}</option>`).join('')}</select></div><div class="field"><label>Status</label><select name="status"><option>ACTIVE</option><option>INACTIVE</option><option>MAINTENANCE</option></select></div><div class="field full"><label>Catatan</label><textarea name="note" rows="3"></textarea></div><div class="actions full"><button type="button" class="btn" onclick="closeModal()">Batal</button><button class="btn primary">Simpan Kamar</button></div></form></div>`);document.querySelector('#p9roomForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),bid=f.get('blockId'),b=d.blocks.find(x=>x.id===bid),room=String(f.get('room')).trim();if(!b||!room)return;if(d.rooms.some(r=>r.blockId===bid&&r.room.toLowerCase()===room.toLowerCase())){toast('Kamar tersebut sudah terdaftar.');return}const id=uid('ROOM');d.rooms.push({id,blockId:bid,block:b.name,room,capacity:Number(f.get('capacity'))||1,type:f.get('type'),gender:f.get('gender'),status:f.get('status'),note:f.get('note')||'',createdAt:now(),source:'ADMIN_MASTER',version:1});d.qr.room[id]={token:uid('RMQR'),status:f.get('status')==='ACTIVE'?'ACTIVE':'SUSPENDED'};audit('ROOM_CREATE','ROOM',id);put(d);closeModal();settings();toast('Master kamar tersimpan.')}}
window.p9editRoom=id=>{const d=ensure(),r=d.rooms.find(x=>x.id===id);if(!r)return;openModal(`<div class="dialoghead"><h2>Edit Master Kamar</h2><button class="x" onclick="closeModal()">×</button></div><form id="p9roomForm" class="formgrid"><div class="field"><label>Blok</label><select name="blockId">${d.blocks.map(b=>`<option value="${E(b.id)}" ${(r.blockId===b.id||r.block===b.name)?'selected':''}>${E(b.name)}</option>`).join('')}</select></div><div class="field"><label>Nomor/Nama Kamar</label><input name="room" value="${E(r.room)}" required></div><div class="field"><label>Kapasitas</label><input name="capacity" type="number" min="1" value="${Number(r.capacity)||1}" required></div><div class="field"><label>Tipe</label><select name="type">${d.adminCatalogs.roomTypes.map(x=>`<option ${r.type===x?'selected':''}>${E(x)}</option>`).join('')}</select></div><div class="field"><label>Kategori</label><select name="gender">${d.adminCatalogs.roomCategories.map(x=>`<option ${r.gender===x?'selected':''}>${E(x)}</option>`).join('')}</select></div><div class="field"><label>Status</label><select name="status"><option ${r.status==='ACTIVE'?'selected':''}>ACTIVE</option><option ${r.status==='INACTIVE'?'selected':''}>INACTIVE</option><option ${r.status==='MAINTENANCE'?'selected':''}>MAINTENANCE</option></select></div><div class="field full"><label>Catatan</label><textarea name="note" rows="3">${E(r.note||'')}</textarea></div><div class="actions full"><button type="button" class="btn" onclick="closeModal()">Batal</button><button class="btn primary">Simpan</button></div></form></div>`);document.querySelector('#p9roomForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),b=d.blocks.find(x=>x.id===f.get('blockId')),room=String(f.get('room')).trim();if(!b||!room)return;if(d.rooms.some(x=>x.id!==id&&x.blockId===b.id&&x.room.toLowerCase()===room.toLowerCase())){toast('Kamar duplikat.');return}const oldCap=Number(r.capacity)||0,newCap=Number(f.get('capacity'))||1;const occ=(d.detainees||[]).filter(x=>{if(x.status!=='AKTIF')return false;const p=(d.placements||[]).filter(q=>q.detaineeId===x.id).sort((a,b)=>String(b.since||'').localeCompare(String(a.since||'')))[0];return p&&(p.roomId===id||(!p.roomId&&p.block===r.block&&p.room===r.room))}).length;if(newCap<occ){toast('Kapasitas baru lebih kecil dari occupancy saat ini.');return}Object.assign(r,{blockId:b.id,block:b.name,room,capacity:newCap,type:f.get('type'),gender:f.get('gender'),status:f.get('status'),note:f.get('note')||r.note||'',version:(r.version||1)+1});d.rooms.filter(x=>x.id!==id&&x.blockId===r.blockId&&x.block===r.block);if(!d.qr.room[id])d.qr.room[id]={token:uid('RMQR'),status:'ACTIVE'};d.qr.room[id].status=r.status==='ACTIVE'?'ACTIVE':'SUSPENDED';audit('ROOM_UPDATE','ROOM',id);put(d);closeModal();settings();toast('Master kamar diperbarui.')}};
function currentRoom(d,id){const p=(d.placements||[]).filter(x=>x.detaineeId===id).sort((a,b)=>String(b.since||'').localeCompare(String(a.since||'')))[0];return p?(d.rooms||[]).find(r=>r.id===p.roomId)||((d.rooms||[]).find(r=>r.block===p.block&&r.room===p.room)):null}
function roomOccupancy(d,r){return (d.detainees||[]).filter(x=>x.status==='AKTIF').filter(x=>currentRoom(d,x.id)?.id===r.id).length}
window.addDetainee=existing=>{const d=ensure(),rooms=d.rooms.filter(r=>r.status==='ACTIVE'&&(d.qr.room[r.id]?.status||'ACTIVE')==='ACTIVE'),cur=existing?currentRoom(d,existing.id):null;if(existing&&cur===null&&existing.placement){toast('Placement lama tidak terpetakan ke Master Kamar. Perlu rekonsiliasi Administrator.');}const opts=rooms.map(r=>{const o=roomOccupancy(d,r),cap=Number(r.capacity)||0;const selected=cur&&cur.id===r.id;return `<option value="${E(r.id)}" ${selected?'selected':''} ${cap&&o>=cap&&!selected?'disabled':''}>${E(r.block)} / ${E(r.room)} — ${o}/${cap}</option>`}).join('');openModal(`<div class="dialoghead"><h2>${existing?'Edit':'Tambah'} Deteni</h2><button class="x" onclick="closeModal()">×</button></div><form id="p9dForm" class="formgrid"><div class="field"><label>Kode</label><input name="code" required value="${E(existing?.code||'')}"></div><div class="field"><label>Nama (synthetic)</label><input name="name" required value="${E(existing?.name||'')}"></div><div class="field"><label>Kebangsaan</label><input name="nationality" value="${E(existing?.nationality||'Contoh')}"></div><div class="field"><label>Status</label><select name="status"><option ${existing?.status==='AKTIF'||!existing?'selected':''}>AKTIF</option><option ${existing?.status==='NONAKTIF'?'selected':''}>NONAKTIF</option></select></div><div class="field full"><label>${existing?'Penempatan Saat Ini':'Penempatan Awal'}</label>${existing?`<div class="notice">${E(cur?cur.block+' / '+cur.room:'Belum terpetakan')}<br><span class="p6mini">Perubahan kamar dilakukan melalui modul Pergerakan → Transfer Kamar.</span></div>`:`<select name="roomId" ${rooms.length?'required':''}><option value="">${rooms.length?'Pilih kamar':'Belum ada master kamar aktif'}</option>${opts}</select>`}</div><div class="actions full"><button type="button" class="btn" onclick="closeModal()">Batal</button><button class="btn primary">Simpan</button></div></form></div>`);document.querySelector('#p9dForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),code=String(f.get('code')).trim(),name=String(f.get('name')).trim();if(d.detainees.some(x=>x.id!==(existing?.id||'')&&String(x.code).toLowerCase()===code.toLowerCase())){toast('Kode deteni sudah terdaftar.');return}if(!code||!name)return;if(existing){existing.code=code;existing.name=name;existing.nationality=String(f.get('nationality')||'Contoh');existing.status=f.get('status')||'AKTIF';audit('DETAINEE_UPDATE','DETAINEE',existing.id);put(d);closeModal();if(typeof window.detainee==='function')window.detainee(document.querySelector('#appView'));else window.show('detainee');toast('Data deteni diperbarui.');return}const roomId=String(f.get('roomId')||'');if(!roomId){toast('Penempatan awal wajib memilih Master Kamar.');return}const room=d.rooms.find(r=>r.id===roomId);if(!room||room.status!=='ACTIVE'||(d.qr.room[room.id]?.status||'ACTIVE')!=='ACTIVE'){toast('Kamar tidak aktif.');return}if(roomOccupancy(d,room)>=(Number(room.capacity)||0)){toast('Kamar sudah penuh.');return}const id=uid('DET'),det={id,code,name,nationality:String(f.get('nationality')||'Contoh'),status:String(f.get('status')||'AKTIF'),placement:room.block+' / '+room.room,createdAt:now()};d.detainees.unshift(det);const p={id:uid('PLC'),detaineeId:id,roomId:room.id,blockId:room.blockId,block:room.block,room:room.room,since:now(),source:'INITIAL_ASSIGNMENT'};d.placements.unshift(p);audit('DETAINEE_CREATE','DETAINEE',id);audit('PLACEMENT_ASSIGN','PLACEMENT',p.id);put(d);closeModal();if(typeof window.detainee==='function')window.detainee(document.querySelector('#appView'));else window.show('detainee');toast('Deteni dan penempatan awal tersimpan.')}};
nav();ensure();
})();
