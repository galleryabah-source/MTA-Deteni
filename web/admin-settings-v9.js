(()=>{
const K='mta-deteni-demo-v2';
const BRANDING_KEY='mta-deteni-branding-v1';
const get=()=>{
  const production=window.mtaProductionStateAdapter;
  if(production?.isProduction?.()){
    const live=production.get?.();
    if(live&&typeof live==='object')return structuredClone(live);
  }
  const d=window.MTADeteniStateKernel?window.MTADeteniStateKernel.read():JSON.parse(localStorage.getItem(K)||'{}');
  try{
    const b=JSON.parse(localStorage.getItem(BRANDING_KEY)||'null');
    if(b)d.adminSettings=d.adminSettings||{},d.adminSettings.branding=b;
  }catch{}
  return d;
};
const put=d=>{const kernel=window.MTADeteniStateKernel;if(!kernel)throw new Error('CANONICAL_STATE_KERNEL_REQUIRED');const result=kernel.write(d);window.dispatchEvent(new CustomEvent('mta:data-changed',{detail:{source:'admin-settings-v9'}}));return result};
const E=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const uid=p=>p+'-'+crypto.randomUUID().slice(0,10).toUpperCase();
const now=()=>new Date().toISOString();
const audit=(a,t,i,r='SUCCESS',state=null)=>{const d=state||get();const kernel=window.MTADeteniStateKernel;if(kernel?.audit){kernel.audit(d,a,t,i,r,{actor:'DEMO-ADMIN'});if(!state)put(d);return}throw new Error('CANONICAL_AUDIT_KERNEL_REQUIRED')};
function ensure(){const source=get();const d=structuredClone(source);d.adminSettings=d.adminSettings&&typeof d.adminSettings==='object'?d.adminSettings:{role:'ADMIN',facilityName:'MTA DETENI Digital',timezone:'Asia/Jakarta',qrPolicy:'OPAQUE_TOKEN',migrationFreeze:true,ai:'OFF'};const aiSecret=d.adminSettings.aiSettings;if(aiSecret&&Object.prototype.hasOwnProperty.call(aiSecret,'apiKey')){aiSecret.secretConfigured=!!String(aiSecret.apiKey||'').trim();delete aiSecret.apiKey}d.blocks=Array.isArray(d.blocks)?d.blocks:[];d.rooms=Array.isArray(d.rooms)?d.rooms:[];d.qr=d.qr&&typeof d.qr==='object'?d.qr:{detainee:{},room:{},leave:{}};d.qr.detainee=d.qr.detainee||{};d.qr.leave=d.qr.leave||{};d.qr.room=d.qr.room||{};d.adminCatalogs=d.adminCatalogs&&typeof d.adminCatalogs==='object'?d.adminCatalogs:{};const defaults={dutyGroups:['REGU A','REGU B','REGU C','REGU D'],shifts:['PAGI','SIANG','MALAM'],movementTypes:['INTERNAL','TRANSFER_KAMAR','KLINIK','SIDANG','LAINNYA'],leaveTypes:['IZIN SEMENTARA','PEMERIKSAAN KESEHATAN','PENGAWALAN','LAINNYA'],documentTypes:['LAPORAN HARIAN','BERITA ACARA','SURAT TUGAS','SURAT PENGANTAR','LAINNYA'],classifications:['INTERNAL','TERBATAS','RAHASIA'],roomTypes:['STANDARD','ISOLATION','OBSERVATION','MEDICAL','TRANSIT'],roomCategories:['UMUM','PRIA','WANITA','KHUSUS']};for(const [k,v] of Object.entries(defaults))if(!(Array.isArray(d.adminCatalogs[k])&&d.adminCatalogs[k].length))d.adminCatalogs[k]=[...v];d.rooms.forEach(r=>{if(!r.blockId){const b=d.blocks.find(b=>String(b.name).toLowerCase()===String(r.block).toLowerCase());if(b)r.blockId=b.id}if(!d.qr.room[r.id])d.qr.room[r.id]={token:uid('RMQR'),status:r.status==='ACTIVE'?'ACTIVE':'SUSPENDED'}});return d}
function nav(){const n=document.querySelector('#nav');if(!n||document.querySelector('#p9settings'))return;const b=document.createElement('button');b.id='p9settings';b.dataset.view='p9settings';b.textContent='Pengaturan';b.onclick=e=>{e.stopPropagation();settings()};n.appendChild(b)}
function installSettingsStyle(){
  if(document.getElementById('mta-admin-settings-style'))return;
  const s=document.createElement('style');s.id='mta-admin-settings-style';
  s.textContent=`
  .mta-admin-tabs{display:flex;gap:7px;overflow-x:auto;padding:6px;margin:14px 0 12px;background:#f7f9fc;border:1px solid #e2e8f0;border-radius:12px;scrollbar-width:none}
  .mta-admin-tabs::-webkit-scrollbar{display:none}
  .mta-admin-tab{flex:0 0 auto;border:1px solid transparent;background:transparent;color:#526176;padding:9px 13px;border-radius:9px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap}
  .mta-admin-tab:hover{background:#fff;border-color:#dbe4ef;color:#175cd3}
  .mta-admin-tab.active{background:#0b63ce;color:#fff;border-color:#0b63ce;box-shadow:0 2px 7px rgba(11,99,206,.18)}
  .mta-admin-panel{display:none}.mta-admin-panel.active{display:block}
  .mta-brand-preview{display:flex;align-items:center;gap:12px;padding:14px;border:1px dashed #cbd5e1;border-radius:12px;background:#f8fafc;margin-top:10px}
  .mta-brand-preview img{width:42px;height:42px;object-fit:contain;border-radius:9px;border:1px solid #dbe4ef;background:#fff}
  .mta-brand-preview .title{font-weight:800;color:#172033}.mta-brand-preview .sub{font-size:10px;color:#667085}
  .mta-upload-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
  @media(max-width:900px){.mta-upload-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(s);
}
function applyWebBranding(){
  const d=ensure(),b=d.adminSettings?.branding||{};
  const brand=document.querySelector('.brand');
  if(brand){
    const logo=brand.querySelector('.logo');
    if(logo){if(b.logoData){logo.textContent='';logo.style.backgroundImage='url("'+b.logoData+'")';logo.style.backgroundSize='contain';logo.style.backgroundPosition='center';logo.style.backgroundRepeat='no-repeat'}else{logo.textContent='M';logo.style.backgroundImage='none'}}
    const strong=brand.querySelector('strong');if(strong&&b.title)strong.textContent=b.title;
    const small=brand.querySelector('small');if(small&&b.subtitle)small.textContent=b.subtitle;
  }
  const title=b.title||'MTA DETENI Digital';document.title=title;
  let favicon=document.querySelector('link[data-mta-brand-favicon]');
  if(!favicon){favicon=document.createElement('link');favicon.rel='icon';favicon.dataset.mtaBrandFavicon='1';document.head.appendChild(favicon)}
  favicon.href=b.iconData||'/favicon.ico';
  const top=document.querySelector('.top');
  if(top){
    if(b.headerData){
      top.style.backgroundImage='linear-gradient(90deg,rgba(255,255,255,.97) 0%,rgba(255,255,255,.92) 55%,rgba(255,255,255,.70) 100%),url("'+b.headerData+'")';
      top.style.backgroundSize='cover';
      top.style.backgroundPosition='right center';
    }else{
      top.style.backgroundImage='';
      top.style.backgroundSize='';
      top.style.backgroundPosition='';
    }
  }
}
function readImage(file,cb){
  if(!file){return}
  if(!/^image\/(png|jpeg|jpg|webp|svg\+xml)$/.test(file.type)){toast('Gunakan PNG, JPG, WEBP, atau SVG.');return}
  if(file.size>2*1024*1024){toast('Ukuran gambar maksimal 2 MB.');return}
  const fr=new FileReader();fr.onload=()=>cb(String(fr.result||''));fr.readAsDataURL(file);
}
function settingsTab(id){
  document.querySelectorAll('.mta-admin-tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));
  document.querySelectorAll('.mta-admin-panel').forEach(x=>x.classList.toggle('active',x.dataset.panel===id));
  try{sessionStorage.setItem('mta-admin-settings-tab',id)}catch{}
}
function settings(){
  const d=ensure();
  installSettingsStyle();
  const app=document.querySelector('#appView');
  if(!app)return;
  if(!['OWNER','ADMIN'].includes(String(d.adminSettings.role||'').toUpperCase())){
    app.innerHTML=shell('Pengaturan','Akses dibatasi untuk Administrator.',
      '<div class="p6card"><div class="notice p6danger">ADMIN ONLY · Role saat ini: '+E(d.adminSettings.role||'UNSET')+'</div></div>');
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

  const b=d.adminSettings.branding||{};
  const ai=d.adminSettings.aiSettings||{provider:'Gemini',endpoint:'',model:'',apiKey:'',enabled:false};
  const tabs=[
    ['system','System'],['security','Security & Governance'],['blocks','Master Blok'],['rooms','Master Kamar'],
    ['catalog','Master Data'],['roomparams','Room Parameter'],['ai','API AI'],['design','Desain Web']
  ];
  const tabHtml='<div class="mta-admin-tabs" role="tablist">'+tabs.map((x,i)=>'<button type="button" class="mta-admin-tab '+(i===0?'active':'')+'" data-tab="'+x[0]+'" onclick="window.p9settingsTab(\''+x[0]+'\')">'+x[1]+'</button>').join('')+'</div>';

  const body=
    tabHtml+
    '<div class="mta-admin-panel active" data-panel="system"><div class="p6card"><h2>System</h2><div class="formgrid">'+
      '<div class="field"><label>Nama fasilitas</label><input id="p9facility" value="'+E(d.adminSettings.facilityName)+'"></div>'+
      '<div class="field"><label>Zona waktu</label><select id="p9tz"><option '+(d.adminSettings.timezone==='Asia/Jakarta'?'selected':'')+'>Asia/Jakarta</option><option '+(d.adminSettings.timezone==='Asia/Makassar'?'selected':'')+'>Asia/Makassar</option><option '+(d.adminSettings.timezone==='Asia/Jayapura'?'selected':'')+'>Asia/Jayapura</option></select></div>'+
      '<div class="field"><label>AI Runtime</label><input value="'+E(d.adminSettings.ai||'OFF')+'" disabled></div>'+
      '<div class="field"><label>Migration Freeze</label><input value="'+(d.adminSettings.migrationFreeze?'TRUE':'FALSE')+'" disabled></div>'+
    '</div><div class="actions"><button class="btn primary" onclick="window.p9saveSystem()">Simpan System</button></div></div></div>'+

    '<div class="mta-admin-panel" data-panel="security"><div class="p6card"><h2>Security &amp; Governance</h2><div class="notice">Role: <b>'+E(d.adminSettings.role)+
      '</b><br>QR Policy: <b>'+E(d.adminSettings.qrPolicy)+'</b><br>Real data: <b>DISALLOWED IN PREVIEW</b></div><p class="p6mini">User, role, permission, scope, duty assignment, dan policy produksi tetap mengikuti authorization boundary; password/secret produksi tidak disimpan di runtime preview.</p></div></div>'+

    '<div class="mta-admin-panel" data-panel="blocks"><div class="p6card"><div class="toolbar"><h2 style="margin-right:auto">Master Blok</h2><button class="btn primary" onclick="window.p9addBlock()">+ Tambah Blok</button></div><div class="tablewrap"><table class="table"><thead><tr><th>Blok</th><th>Status</th><th>Jumlah Kamar</th><th>Aksi</th></tr></thead><tbody>'+
      (blockRows||'<tr><td colspan="4" class="empty">Belum ada blok.</td></tr>')+'</tbody></table></div></div></div>'+

    '<div class="mta-admin-panel" data-panel="rooms"><div class="p6card"><div class="toolbar"><h2 style="margin-right:auto">Master Kamar</h2><button class="btn primary" onclick="window.p9addRoom()">+ Tambah Kamar</button></div><div class="tablewrap"><table class="table"><thead><tr><th>Blok</th><th>Kamar</th><th>Occupancy</th><th>Tipe</th><th>Kategori</th><th>Status</th><th>Aksi</th></tr></thead><tbody>'+
      (roomRows||'<tr><td colspan="7" class="empty">Belum ada master kamar.</td></tr>')+'</tbody></table><div class="notice" style="margin-top:10px">Kamar hanya dibuat/diubah di sini. Modul Data Deteni, Penempatan, dan Pergerakan hanya memilih Room ID dari master.</div></div></div></div>'+

    '<div class="mta-admin-panel" data-panel="catalog"><div class="p6grid">'+catalogCards+'</div></div>'+

    '<div class="mta-admin-panel" data-panel="roomparams"><div class="p6card"><h2>Master Room Parameter</h2><div class="notice">Tipe: '+d.adminCatalogs.roomTypes.map(E).join(' · ')+'<br>Kategori: '+d.adminCatalogs.roomCategories.map(E).join(' · ')+'</div></div></div>'+

    '<div class="mta-admin-panel" data-panel="ai"><div class="p6card"><h2>Pengaturan API AI</h2><p class="p6mini">Konfigurasi disiapkan pada control plane. Runtime AI tetap <b>OFF</b> sampai integrasi AI resmi diaktifkan. Jangan menaruh API key produksi pada browser/localStorage.</p><div class="formgrid">'+
      '<div class="field"><label>Provider</label><select id="p9aiProvider"><option '+(ai.provider==='Gemini'?'selected':'')+'>Gemini</option><option '+(ai.provider==='OpenAI'?'selected':'')+'>OpenAI</option><option '+(ai.provider==='Anthropic'?'selected':'')+'>Anthropic</option><option '+(ai.provider==='Custom'?'selected':'')+'>Custom</option></select></div>'+
      '<div class="field"><label>Model</label><input id="p9aiModel" value="'+E(ai.model||'')+'" placeholder="Nama model"></div>'+
      '<div class="field full"><label>Endpoint API</label><input id="p9aiEndpoint" value="'+E(ai.endpoint||'')+'" placeholder="https://..."></div>'+
      '<div class="field full"><label>API Key (tidak disimpan di browser)</label><input id="p9aiKey" type="password" value="" autocomplete="new-password" placeholder="Masukkan hanya untuk integrasi server-side"></div>'+
      '<div class="field"><label>Status konfigurasi</label><select id="p9aiEnabled"><option value="false" '+(!ai.enabled?'selected':'')+'>OFF</option><option value="true" '+(ai.enabled?'selected':'')+'>ON (config only)</option></select></div>'+
    '</div><div class="actions"><button class="btn primary" onclick="window.p9saveAI()">Simpan API AI</button></div></div></div>'+

    '<div class="mta-admin-panel" data-panel="design"><div class="p6card"><h2>Pengaturan Desain Web</h2><p class="p6mini">Upload aset branding untuk header aplikasi. Format PNG/JPG/WEBP/SVG, maksimal 2 MB per file. Perubahan hanya branding; tidak mengubah locked design system.</p><div class="mta-upload-grid">'+
      '<div class="field"><label>Icon / Favicon</label><input id="p9iconFile" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"><button class="btn" type="button" onclick="window.p9uploadAsset(\'icon\')">Upload Icon</button></div>'+
      '<div class="field"><label>Logo Header</label><input id="p9logoFile" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"><button class="btn" type="button" onclick="window.p9uploadAsset(\'logo\')">Upload Logo</button></div>'+
      '<div class="field"><label>Gambar Header / Judul</label><input id="p9headerFile" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"><button class="btn" type="button" onclick="window.p9uploadAsset(\'header\')">Upload Gambar</button></div>'+
    '</div><div class="formgrid" style="margin-top:12px"><div class="field"><label>Judul Header</label><input id="p9brandTitle" value="'+E(b.title||'MTA DETENI Digital')+'"></div><div class="field"><label>Subjudul Header</label><input id="p9brandSubtitle" value="'+E(b.subtitle||'Manajemen Terpadu Administrasi Deteni')+'"></div></div>'+
    '<div class="actions"><button class="btn primary" onclick="window.p9saveDesign()">Simpan Desain</button></div>'+
    '<div class="mta-brand-preview"><img id="p9brandPreview" src="'+E(b.headerData||b.logoData||'')+'" onerror="this.style.display=\'none\'"><div><div class="title">'+E(b.title||'MTA DETENI Digital')+'</div><div class="sub">'+E(b.subtitle||'Manajemen Terpadu Administrasi Deteni')+'</div></div></div>'+
    '</div></div>';

  app.innerHTML=shell(
    'Pengaturan Administrator',
    'Control plane untuk master data dan konfigurasi operasional. Runtime production terhubung ke database.',
    body
  );
}
window.p9openSettings=()=>settings();
window.p9settingsTab=settingsTab;
window.p9saveAI=async()=>{const d=ensure(),entered=(document.querySelector('#p9aiKey')?.value||'').trim(),result=await window.MTADeteniDomainCommandsV2?.updateAi(d,{provider:document.querySelector('#p9aiProvider')?.value||'Gemini',model:(document.querySelector('#p9aiModel')?.value||'').trim(),endpoint:(document.querySelector('#p9aiEndpoint')?.value||'').trim(),apiKey:entered});if(!result?.ok){toast('Konfigurasi AI ditolak: '+(result?.code||'CANONICAL_COMMAND_UNAVAILABLE'));return}if(!window.mtaProductionStateAdapter?.isProduction?.())put(d);document.querySelector('#p9aiKey').value='';toast(entered?'Konfigurasi tersimpan; API key tidak disimpan di browser.':'Konfigurasi tersimpan tanpa API key.')};
window.p9saveDesign=async()=>{const d=ensure(),result=await window.MTADeteniDomainCommandsV2?.updateBranding(d,{title:(document.querySelector('#p9brandTitle')?.value||'MTA DETENI Digital').trim(),subtitle:(document.querySelector('#p9brandSubtitle')?.value||'Manajemen Terpadu Administrasi Deteni').trim()});if(!result?.ok){toast('Branding ditolak: '+(result?.code||'CANONICAL_COMMAND_UNAVAILABLE'));return}if(!window.mtaProductionStateAdapter?.isProduction?.())put(d);applyWebBranding();settings();toast('Pengaturan desain web tersimpan.')};
window.p9uploadAsset=kind=>{const map={icon:'p9iconFile',logo:'p9logoFile',header:'p9headerFile'},file=document.querySelector('#'+map[kind])?.files?.[0];if(!file)return toast('Pilih file terlebih dahulu.');readImage(file,async data=>{const d=ensure(),result=await window.MTADeteniDomainCommandsV2?.uploadBranding(d,{kind,data});if(!result?.ok){toast('Aset ditolak: '+(result?.code||'CANONICAL_COMMAND_UNAVAILABLE'));return}if(window.mtaProductionStateAdapter?.isProduction?.()){if(result.state)d.adminSettings=result.state.adminSettings||d.adminSettings;applyWebBranding();settings();toast('Aset '+kind+' tersimpan ke database.')}else{if(!window.mtaProductionStateAdapter?.isProduction?.())put(d);applyWebBranding();settings();toast('Aset '+kind+' berhasil diunggah.')}})};
function shell(t,desc,b){return `<section class="hero"><h1>${t}</h1><p class="sub">${desc}</p></section>${b}`}
window.p9saveSystem=async()=>{const d=ensure(),result=await window.MTADeteniDomainCommandsV2?.updateSystem(d,{facilityName:(document.querySelector('#p9facility')?.value||d.adminSettings.facilityName).trim(),timezone:document.querySelector('#p9tz')?.value||d.adminSettings.timezone});if(!result?.ok){toast('Pengaturan system ditolak: '+(result?.code||'CANONICAL_COMMAND_UNAVAILABLE'));return}if(window.mtaProductionStateAdapter?.isProduction?.()){if(result.state){window.__mtaProductionState=result.state;applyWebBranding()}settings();toast('Pengaturan system tersimpan ke production.');return}if(!window.mtaProductionStateAdapter?.isProduction?.())put(d);settings();toast('Pengaturan system tersimpan.')};
window.p9addCatalog=(key,label)=>{openModal(`<div class="dialoghead"><h2>Tambah ${E(label)}</h2><button class="x" onclick="closeModal()">×</button></div><div class="field"><label>Nilai</label><input id="p9cat" placeholder="Masukkan nilai master"></div><div class="actions"><button class="btn" onclick="closeModal()">Batal</button><button class="btn primary" onclick="window.p9saveCatalog('${E(key)}')">Simpan</button></div>`)};
window.p9saveCatalog=async key=>{const d=ensure(),v=(document.querySelector('#p9cat')?.value||'').trim(),result=await window.MTADeteniDomainCommandsV2?.catalogCreate(d,key,v);if(!result?.ok){toast('Master ditolak: '+(result?.code||'CANONICAL_COMMAND_UNAVAILABLE'));return}if(!window.mtaProductionStateAdapter?.isProduction?.())put(d);closeModal();settings();toast('Master tersimpan.')};
window.p9removeCatalog=async (key,i)=>{const d=ensure(),v=d.adminCatalogs[key]?.[i];if(!v)return;if(!confirm('Nonaktifkan master '+v+'?'))return;const result=await window.MTADeteniDomainCommandsV2?.catalogRemove(d,key,i);if(!result?.ok){toast('Master ditolak: '+(result?.code||'CANONICAL_COMMAND_UNAVAILABLE'));return}if(!window.mtaProductionStateAdapter?.isProduction?.())put(d);settings();toast('Master dinonaktifkan.')};
window.p9addBlock=()=>{ensure();openModal(`<div class="dialoghead"><h2>Tambah Blok</h2><button class="x" onclick="closeModal()">×</button></div><div class="formgrid"><div class="field"><label>Kode Blok</label><input id="p9bcode" placeholder="BLK-A" required></div><div class="field"><label>Status</label><select id="p9bstatus"><option>ACTIVE</option><option>INACTIVE</option></select></div><div class="field full"><label>Nama Blok</label><input id="p9bname" placeholder="Blok A" required></div></div><div class="actions"><button class="btn" onclick="closeModal()">Batal</button><button class="btn primary" onclick="window.p9saveBlock()">Simpan</button></div>`)};
window.p9saveBlock=async()=>{const d=ensure(),code=(document.querySelector('#p9bcode')?.value||'').trim(),name=(document.querySelector('#p9bname')?.value||'').trim(),status=document.querySelector('#p9bstatus')?.value||'ACTIVE';if(!code||!name){toast('Kode dan nama blok wajib diisi.');return}const result=await window.MTADeteniDomainCommandsV2?.createBlock(d,{code,name,status});if(!result?.ok){toast('Blok ditolak: '+(result?.code||'CANONICAL_COMMAND_UNAVAILABLE'));return}if(!window.mtaProductionStateAdapter?.isProduction?.())put(d);closeModal();settings();toast('Blok tersimpan.')};
window.p9editBlock=id=>{const d=ensure(),b=d.blocks.find(x=>x.id===id);if(!b)return;openModal(`<div class="dialoghead"><h2>Edit Blok</h2><button class="x" onclick="closeModal()">×</button></div><div class="formgrid"><div class="field full"><label>Nama Blok</label><input id="p9bname" value="${E(b.name)}"></div><div class="field"><label>Status</label><select id="p9bstatus"><option ${b.status==='ACTIVE'?'selected':''}>ACTIVE</option><option ${b.status==='INACTIVE'?'selected':''}>INACTIVE</option></select></div></div><div class="actions"><button class="btn" onclick="closeModal()">Batal</button><button class="btn primary" onclick="window.p9saveBlockEdit('${E(id)}')">Simpan</button></div>`)};
window.p9saveBlockEdit=async id=>{const d=ensure(),result=await window.MTADeteniDomainCommandsV2?.updateBlock(d,id,{name:(document.querySelector('#p9bname')?.value||'').trim(),status:document.querySelector('#p9bstatus')?.value||'ACTIVE'});if(!result?.ok){toast('Blok ditolak: '+(result?.code||'CANONICAL_COMMAND_UNAVAILABLE'));return}if(!window.mtaProductionStateAdapter?.isProduction?.())put(d);closeModal();settings();toast('Blok diperbarui.')};
function blockOptions(d,onlyActive=true){return d.blocks.filter(b=>!onlyActive||b.status==='ACTIVE').map(b=>`<option value="${E(b.id)}">${E(b.name)}</option>`).join('')}
window.p9addRoom=()=>{const d=ensure();if(!d.blocks.some(b=>b.status==='ACTIVE')){toast('Buat Master Blok aktif terlebih dahulu.');return}openModal(`<div class="dialoghead"><h2>Tambah Master Kamar</h2><button class="x" onclick="closeModal()">×</button></div><form id="p9roomForm" class="formgrid"><div class="field"><label>Blok</label><select name="blockId" required>${blockOptions(d)}</select></div><div class="field"><label>Nomor/Nama Kamar</label><input name="room" required placeholder="Kamar 03"></div><div class="field"><label>Kapasitas</label><input name="capacity" type="number" min="1" max="999" value="4" required></div><div class="field"><label>Tipe Kamar</label><select name="type">${d.adminCatalogs.roomTypes.map(x=>`<option>${E(x)}</option>`).join('')}</select></div><div class="field"><label>Kategori</label><select name="gender">${d.adminCatalogs.roomCategories.map(x=>`<option>${E(x)}</option>`).join('')}</select></div><div class="field"><label>Status</label><select name="status"><option>ACTIVE</option><option>INACTIVE</option><option>MAINTENANCE</option></select></div><div class="field full"><label>Catatan</label><textarea name="note" rows="3"></textarea></div><div class="actions full"><button type="button" class="btn" onclick="closeModal()">Batal</button><button class="btn primary">Simpan Kamar</button></div></form>`);document.querySelector('#p9roomForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),d=ensure(),result=await window.MTADeteniDomainCommandsV2?.createRoom(d,{blockId:String(f.get('blockId')||''),code:String(f.get('room')||'').trim(),name:String(f.get('room')||'').trim(),capacity:Number(f.get('capacity'))||1,type:String(f.get('type')||'STANDARD'),gender:String(f.get('gender')||'UMUM'),status:String(f.get('status')||'ACTIVE'),note:String(f.get('note')||'')});if(!result?.ok){toast('Master kamar ditolak: '+(result?.code||'CANONICAL_COMMAND_UNAVAILABLE'));return}if(!window.mtaProductionStateAdapter?.isProduction?.())put(d);closeModal();settings();toast('Master kamar tersimpan.')};};
window.p9editRoom=id=>{const d=ensure(),r=d.rooms.find(x=>x.id===id);if(!r)return;openModal(`<div class="dialoghead"><h2>Edit Master Kamar</h2><button class="x" onclick="closeModal()">×</button></div><form id="p9roomForm" class="formgrid"><div class="field"><label>Blok</label><select name="blockId">${d.blocks.map(b=>`<option value="${E(b.id)}" ${(r.blockId===b.id||r.block===b.name)?'selected':''}>${E(b.name)}</option>`).join('')}</select></div><div class="field"><label>Nomor/Nama Kamar</label><input name="room" value="${E(r.room)}" required></div><div class="field"><label>Kapasitas</label><input name="capacity" type="number" min="1" value="${Number(r.capacity)||1}" required></div><div class="field"><label>Tipe</label><select name="type">${d.adminCatalogs.roomTypes.map(x=>`<option ${r.type===x?'selected':''}>${E(x)}</option>`).join('')}</select></div><div class="field"><label>Kategori</label><select name="gender">${d.adminCatalogs.roomCategories.map(x=>`<option ${r.gender===x?'selected':''}>${E(x)}</option>`).join('')}</select></div><div class="field"><label>Status</label><select name="status"><option ${r.status==='ACTIVE'?'selected':''}>ACTIVE</option><option ${r.status==='INACTIVE'?'selected':''}>INACTIVE</option><option ${r.status==='MAINTENANCE'?'selected':''}>MAINTENANCE</option></select></div><div class="field full"><label>Catatan</label><textarea name="note" rows="3">${E(r.note||'')}</textarea></div><div class="actions full"><button type="button" class="btn" onclick="closeModal()">Batal</button><button class="btn primary">Simpan</button></div></form>`);document.querySelector('#p9roomForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),d=ensure(),result=await window.MTADeteniDomainCommandsV2?.updateRoom(d,id,{blockId:String(f.get('blockId')||''),room:String(f.get('room')||''),capacity:Number(f.get('capacity'))||1,type:String(f.get('type')||r.type),gender:String(f.get('gender')||r.gender),status:String(f.get('status')||r.status),note:String(f.get('note')||'')});if(!result?.ok){toast('Master kamar ditolak: '+(result?.code||'CANONICAL_COMMAND_UNAVAILABLE'));return}if(!window.mtaProductionStateAdapter?.isProduction?.())put(d);closeModal();settings();toast('Master kamar diperbarui.')};};
function currentRoom(d,id){const p=(d.placements||[]).filter(x=>x.detaineeId===id).sort((a,b)=>String(b.since||'').localeCompare(String(a.since||'')))[0];return p?(d.rooms||[]).find(r=>r.id===p.roomId)||((d.rooms||[]).find(r=>r.block===p.block&&r.room===p.room)):null}
function roomOccupancy(d,r){return (d.detainees||[]).filter(x=>x.status==='AKTIF').filter(x=>currentRoom(d,x.id)?.id===r.id).length}
/* Detainee CRUD ownership belongs exclusively to the core runtime. Master Room is a guard/service only. */
window.MTA_ADMIN_SETTINGS_OWNER='ADMIN_SETTINGS_V2';
function bootAdminSettings(){
  nav();
  ensure();
  applyWebBranding();
}
if(window.__mtaAuthState?.resolved){
  if(window.__mtaAuthState.authenticated)bootAdminSettings();
}else{
  window.addEventListener('mta-auth-state',e=>{
    if(e?.detail?.authenticated)bootAdminSettings();
  },{once:true});
}
})();
