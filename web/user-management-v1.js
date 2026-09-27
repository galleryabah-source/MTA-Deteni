(()=>{'use strict';
const ROLES=['OWNER','ADMIN','EDITOR','REVIEWER','AUDITOR','VIEWER'];
const ROLE_SCOPE={OWNER:'GLOBAL / FULL CONTROL',ADMIN:'ADMINISTRASI / USER & SYSTEM',EDITOR:'OPERASIONAL / WRITE',REVIEWER:'REVIEW / APPROVAL',AUDITOR:'AUDIT / READ',VIEWER:'READ ONLY'};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const api=()=>window.mtaProductionApi;
let actor=null,rows=[];
function styles(){
 if(document.getElementById('mta-user-management-style'))return;
 const s=document.createElement('style');s.id='mta-user-management-style';s.textContent=`
 .um{display:grid;gap:14px}.umhead{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.um-actions{display:flex;gap:7px;flex-wrap:wrap}.umnote{padding:11px 13px;border:1px solid #dbe4ef;border-radius:11px;background:#f8fafc;color:#526176;font-size:11px;line-height:1.5}.umgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.umkpi{padding:13px;border:1px solid #e1e7ef;border-radius:12px;background:#fff}.umkpi small{display:block;color:#718096;font-size:10px}.umkpi b{display:block;margin-top:5px;font-size:22px;color:#172033}.umtable{overflow:auto;border:1px solid #d7dce3;border-radius:12px;background:#fff}.umtable table{width:100%;min-width:900px;border-collapse:collapse}.umtable th,.umtable td{padding:10px;border-bottom:1px solid #edf0f4;text-align:left;font-size:11px}.umtable th{background:#f8fafc;color:#526176}.umbadge{display:inline-flex;padding:4px 8px;border-radius:999px;font-size:10px;font-weight:750;background:#eef2f7;color:#526176}.umbadge.active{background:#eaf8ef;color:#16763b}.umrole{font-weight:750;color:#175cd3}.umscope{color:#667085;font-size:10px}.umempty{padding:28px;text-align:center;color:#667085;font-size:12px}.umerr{color:#b42318}.umok{color:#16763b}@media(max-width:900px){.umgrid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.umhead{flex-direction:column}.umgrid{grid-template-columns:1fr 1fr}}`;
 document.head.appendChild(s);
}
function currentRole(){return String(actor?.profile?.role||actor?.role||'').toUpperCase()}
function canManage(){return ['OWNER','ADMIN'].includes(currentRole())}
function roleOptions(selected,forCreate=true){
 const role=currentRole();
 const allowed=role==='OWNER'?ROLES:['EDITOR','REVIEWER','AUDITOR','VIEWER'];
 return allowed.map(r=>'<option value="'+r+'" '+(r===selected?'selected':'')+'>'+r+' — '+ROLE_SCOPE[r]+'</option>').join('');
}
async function loadActor(){
 try{
  const r=await api().get('me');
  actor=r;
  return r;
 }catch(err){actor=null;throw err}
}
function table(){
 if(!rows.length)return '<div class="umempty">Belum ada user yang dapat ditampilkan.</div>';
 return '<div class="umtable"><table><thead><tr><th>No</th><th>Email</th><th>Nama</th><th>Role</th><th>Scope Efektif</th><th>Status</th><th>Dibuat</th><th>Aksi</th></tr></thead><tbody>'+
 rows.map((u,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(u.email||'-')+'</td><td>'+esc(u.display_name||'-')+'</td><td><span class="umrole">'+esc(u.role||'VIEWER')+'</span></td><td><span class="umscope">'+esc(ROLE_SCOPE[u.role]||'READ ONLY')+'</span></td><td><span class="umbadge '+(u.active?'active':'')+'">'+(u.active?'AKTIF':'NONAKTIF')+'</span></td><td>'+esc(u.created_at?new Date(u.created_at).toLocaleString('id-ID'):'-')+'</td><td><button class="btn small" onclick="window.MTAUserManagementView.edit(\''+esc(u.id)+'\')">Edit</button></td></tr>').join('')+
 '</tbody></table></div>';
}
function renderBase(message='',error=false){
 styles();
 const r=currentRole(),admin=canManage(),active=rows.filter(x=>x.active).length;
 const note=message||(!api()?'Identity API belum tersedia.':!admin?'Akun ini tidak memiliki hak OWNER/ADMIN untuk mengelola user.':'Pengelolaan user production dilakukan melalui protected admin-users API. Password tidak disimpan di browser.');
 document.getElementById('appView').innerHTML='<div class="um"><section class="hero umhead"><div><h1>Manajemen User</h1><p class="sub">Kelola akun, role, status dan authorization boundary MTA DETENI.</p></div><div class="um-actions"><button class="btn" id="umRefresh">↻ Refresh</button><button class="btn primary" id="umAdd" '+(!admin?'disabled':'')+'>+ Tambah User</button></div></section><div class="umnote '+(error?'umerr':'')+'">'+esc(note)+'</div><div class="umgrid"><div class="umkpi"><small>Total User</small><b>'+rows.length+'</b></div><div class="umkpi"><small>Aktif</small><b>'+active+'</b></div><div class="umkpi"><small>Nonaktif</small><b>'+(rows.length-active)+'</b></div><div class="umkpi"><small>Role Operator</small><b>'+esc(r||'UNKNOWN')+'</b></div></div>'+table()+'</div>';
 document.getElementById('umRefresh').onclick=()=>window.MTAUserManagementView.render();
 document.getElementById('umAdd').onclick=()=>window.MTAUserManagementView.add();
}
async function render(){
 styles();renderBase('Memuat user dan profile authorization...',false);
 try{
  if(!api())throw new Error('IDENTITY_API_UNAVAILABLE');
  await loadActor();
  if(!canManage()){rows=[];renderBase('Akses ditolak: hanya OWNER/ADMIN yang dapat mengelola user.',true);return}
  const r=await api().list('admin-users');
  rows=Array.isArray(r?.data)?r.data:[];
  renderBase();
 }catch(err){
  rows=[];
  renderBase('Identity service belum dapat diakses: '+(err?.data?.error||err?.message||'API_ERROR')+'. Runtime saat ini dapat tetap synthetic, tetapi pembuatan akun production tidak dilakukan secara lokal.',true);
 }
}
function add(){
 if(!canManage())return toast('Hanya OWNER/ADMIN yang dapat menambah user.');
 openModal('<div class="dialoghead"><h2>Tambah User</h2><button class="x" onclick="closeModal()">×</button></div><form id="umForm" class="formgrid"><div class="field"><label>Email</label><input name="email" type="email" required autocomplete="off"></div><div class="field"><label>Nama Tampilan</label><input name="display_name" required maxlength="120"></div><div class="field"><label>Role</label><select name="role">'+roleOptions('VIEWER',true)+'</select></div><div class="field"><label>Scope Efektif</label><div id="umScope" class="notice">'+ROLE_SCOPE.VIEWER+'</div></div><div class="field full"><label>Password awal</label><input name="password" type="password" minlength="12" required autocomplete="new-password"><small>Password minimal 12 karakter. Password hanya dikirim ke protected API dan tidak disimpan.</small></div><div class="actions full"><button type="button" class="btn" onclick="closeModal()">Batal</button><button class="btn primary">Buat User</button></div></form>');
 const f=document.getElementById('umForm'),role=f.querySelector('[name=role]'),scope=document.getElementById('umScope');
 role.onchange=()=>scope.textContent=ROLE_SCOPE[role.value]||'READ ONLY';
 f.onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(f).entries());if(String(data.password||'').length<12){toast('Password minimal 12 karakter.');return}const b=f.querySelector('button[type=submit]');if(b)b.disabled=true;try{await api().create('admin-users',data);auditLocal('USER_CREATE','USER','API');closeModal();toast('User berhasil dibuat melalui protected admin API.');await render()}catch(err){toast('Gagal membuat user: '+(err?.data?.error||err?.message||'API_ERROR'))}finally{if(b)b.disabled=false}};
}
function edit(id){
 if(!canManage())return;
 const u=rows.find(x=>x.id===id);if(!u)return;
 const actorRole=currentRole();
 openModal('<div class="dialoghead"><h2>Edit User</h2><button class="x" onclick="closeModal()">×</button></div><form id="umEditForm" class="formgrid"><div class="field full"><label>Email</label><div class="notice">'+esc(u.email||'-')+'</div></div><div class="field"><label>Nama Tampilan</label><input name="display_name" value="'+esc(u.display_name||'')+'" maxlength="120" required></div><div class="field"><label>Role</label><select name="role">'+roleOptions(u.role||'VIEWER',false)+'</select></div><div class="field"><label>Status</label><select name="active"><option value="true" '+(u.active?'selected':'')+'>AKTIF</option><option value="false" '+(!u.active?'selected':'')+'>NONAKTIF</option></select></div><div class="field"><label>Scope Efektif</label><div id="umEditScope" class="notice">'+esc(ROLE_SCOPE[u.role]||'READ ONLY')+'</div></div><div class="actions full"><button type="button" class="btn" onclick="closeModal()">Batal</button><button class="btn primary">Simpan Perubahan</button></div></form>');
 const f=document.getElementById('umEditForm'),role=f.querySelector('[name=role]'),scope=document.getElementById('umEditScope');role.onchange=()=>scope.textContent=ROLE_SCOPE[role.value]||'READ ONLY';
 f.onsubmit=async e=>{e.preventDefault();const data={display_name:String(new FormData(f).get('display_name')||'').trim(),role:role.value,active:new FormData(f).get('active')==='true'};try{await api().update('admin-users',id,data);auditLocal('USER_UPDATE','USER',id);closeModal();toast('Profile user diperbarui.');await render()}catch(err){toast('Gagal memperbarui user: '+(err?.data?.error||err?.message||'API_ERROR'))}};
}
function auditLocal(action,type,id){try{const d=window.MTADeteniStateKernel?.read();if(!d)return;window.MTADeteniStateKernel.audit(d,action,type,id,'SUCCESS',{actor:'DEMO-ADMIN'});window.MTADeteniStateKernel.write(d)}catch{}}
function install(){
 if(window.__mtaUserManagementInstalled)return;
 window.__mtaUserManagementInstalled=true;
 const previous=window.show;
 window.show=function(v){if(v==='user-management'){window.__mtaUnifiedCurrentView=v;return render()}return previous?.apply(this,arguments)};
 const n=document.getElementById('nav');
 if(n&&!n.querySelector('[data-view="user-management"]')){const b=document.createElement('button');b.type='button';b.dataset.view='user-management';b.dataset.label='Manajemen User';b.textContent='Manajemen User';b.onclick=e=>{e.preventDefault();e.stopPropagation();window.show('user-management')};n.appendChild(b)}
 if(window.__mtaUnifiedCurrentView==='user-management')render();
}
window.MTAUserManagementView=Object.freeze({render,add,edit,install});
window.addEventListener('mta:unified-ready',install);
if(window.mtaUnifiedResolve||window.__mtaUnifiedCurrentView)install();
})();