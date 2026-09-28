(()=>{'use strict';
const ROLE_SCOPE={OWNER:'GLOBAL / FULL CONTROL',ADMIN:'ADMINISTRASI / USER & SYSTEM',EDITOR:'OPERASIONAL / WRITE',REVIEWER:'REVIEW / APPROVAL',AUDITOR:'AUDIT / READ',VIEWER:'READ ONLY'};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const api=()=>window.mtaProductionApi;
let me=null, profileOpen=false, forcedOpen=false;

function styles(){
 if(document.getElementById('mta-identity-security-style'))return;
 const s=document.createElement('style');s.id='mta-identity-security-style';s.textContent=`
 .mta-id-actions{display:flex;gap:6px;align-items:center}.mta-id-profile{min-width:220px}.mta-id-security{display:grid;gap:14px}.mta-id-security .security-card{border:1px solid #e1e7ef;border-radius:12px;padding:14px;background:#f8fafc}.mta-id-security .security-title{font-weight:750;color:#172033;font-size:13px}.mta-id-security .security-sub{margin-top:4px;color:#667085;font-size:11px;line-height:1.5}.mta-id-credential{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:16px;font-weight:800;letter-spacing:.04em;padding:12px;border:1px dashed #98a2b3;border-radius:10px;background:#fff;word-break:break-all}.mta-id-warning{padding:10px 12px;border-radius:10px;background:#fff4e5;color:#8a5a00;border:1px solid #f4d6a2;font-size:11px;line-height:1.5}.mta-id-readonly{background:#f8fafc}.mta-id-forced .dialoghead{border-bottom:1px solid #edf0f4;padding-bottom:10px}.mta-id-forced .x{display:none}`;
 document.head.appendChild(s);
}
function open(html){if(typeof window.openModal==='function')window.openModal(html);else{const m=document.getElementById('modal'),d=document.getElementById('dialog');if(m&&d){d.innerHTML=html;m.classList.add('open')}}}
function close(){if(typeof window.closeModal==='function')window.closeModal();else document.getElementById('modal')?.classList.remove('open')}
function toast(msg){window.toast?.(msg)}
async function loadMe(){
 const r=await api().get('me');me=r;return r;
}
function scope(role){return ROLE_SCOPE[String(role||'VIEWER').toUpperCase()]||'READ ONLY'}
function headerButton(){
 if(!document.querySelector('.topright')||document.getElementById('mtaIdentityProfileBtn'))return;
 const b=document.createElement('button');b.id='mtaIdentityProfileBtn';b.type='button';b.className='btn small';b.textContent='Profil & Keamanan';b.onclick=()=>showProfile(false);document.querySelector('.topright').appendChild(b);
}
function profileHtml(forced){
 const p=me?.profile||{},u=me?.user||{};
 const title=forced?'Ganti Password Wajib':'Profil & Keamanan';
 const closeBtn=forced?'':'<button class="x" onclick="window.MTAIdentitySecurity.close()">×</button>';
 return '<div class="dialoghead"><h2>'+title+'</h2>'+closeBtn+'</div>'+
 '<div class="mta-id-security">'+
 (forced?'<div class="mta-id-warning"><strong>Password perlu diganti.</strong><br>Password akun ini baru saja direset oleh administrator. Selesaikan penggantian password sebelum mengakses operasi aplikasi.</div>':'')+
 '<section class="security-card"><div class="security-title">Profil Saya</div><div class="security-sub">Identitas akun berasal dari authentication boundary dan profile canonical MTA DETENI.</div>'+
 '<div class="formgrid" style="margin-top:10px"><div class="field"><label>Email</label><div class="notice mta-id-readonly">'+esc(u.email||'-')+'</div></div>'+
 '<div class="field"><label>Role</label><div class="notice mta-id-readonly">'+esc(p.role||'-')+'</div></div>'+
 '<div class="field"><label>Nama Tampilan</label><input id="mtaIdDisplayName" maxlength="120" value="'+esc(p.display_name||'')+'" '+(forced?'disabled':'')+'></div>'+
 '<div class="field"><label>Scope Efektif</label><div class="notice mta-id-readonly">'+esc(scope(p.role))+'</div></div></div>'+
 (!forced?'<div class="actions"><button class="btn primary" id="mtaIdSaveProfile">Simpan Profil</button></div>':'')+
 '</section>'+
 '<section class="security-card"><div class="security-title">Ganti Password</div><div class="security-sub">'+(forced?'Masukkan password sementara yang diberikan administrator sebagai password saat ini.':'Gunakan password saat ini untuk mengganti password akun.')+'</div>'+
 '<form id="mtaIdPasswordForm" class="formgrid" style="margin-top:10px">'+
 '<div class="field full"><label>Password Saat Ini</label><input name="current_password" type="password" minlength="12" autocomplete="current-password" required></div>'+
 '<div class="field"><label>Password Baru</label><input name="new_password" type="password" minlength="12" autocomplete="new-password" required></div>'+
 '<div class="field"><label>Konfirmasi Password Baru</label><input name="confirm_password" type="password" minlength="12" autocomplete="new-password" required></div>'+
 '<div class="field full"><small>Password minimal 12 karakter. Password tidak disimpan oleh MTA DETENI.</small></div>'+
 '<div class="actions full"><button class="btn primary" type="submit">Ganti Password</button></div></form></section>'+
 '</div>';
}
async function showProfile(forced){
 styles();forcedOpen=!!forced;
 try{await loadMe()}catch(err){toast('Profil tidak dapat dimuat: '+(err?.data?.error||err?.message||'API_ERROR'));return}
 open(profileHtml(forced));
 const save=document.getElementById('mtaIdSaveProfile');
 if(save)save.onclick=async()=>{
  save.disabled=true;
  try{
   const display_name=document.getElementById('mtaIdDisplayName').value.trim();
   const r=await api().update('me',null,{display_name});
   me={...me,profile:{...me.profile,...r.data}};
   toast('Profil berhasil diperbarui.');
  }catch(err){toast('Gagal memperbarui profil: '+(err?.data?.error||err?.message||'API_ERROR'))}
  finally{save.disabled=false}
 };
 const form=document.getElementById('mtaIdPasswordForm');
 if(form)form.onsubmit=async e=>{
  e.preventDefault();
  const data=Object.fromEntries(new FormData(form).entries());
  if(String(data.new_password||'').length<12){toast('Password minimal 12 karakter.');return}
  if(data.new_password!==data.confirm_password){toast('Konfirmasi password tidak sama.');return}
  const submit=form.querySelector('button[type=submit]');if(submit)submit.disabled=true;
  try{
   await api().create('me',{current_password:data.current_password,new_password:data.new_password,confirm_password:data.confirm_password});
   close();
   forcedOpen=false;
   toast('Password berhasil diganti. Silakan login kembali.');
   await window.mtaAuth?.signOut();
  }catch(err){
   toast('Gagal mengganti password: '+(err?.data?.error||err?.message||'API_ERROR'));
  }finally{if(submit)submit.disabled=false}
 };
}
async function checkForced(){
 if(!window.__mtaAuthState?.authenticated||!api())return;
 try{
  await loadMe();
  if(me?.profile?.must_change_password){forcedOpen=true;showProfile(true)}
 }catch(err){
  if(err?.data?.error==='AUTH_REQUIRED'||err?.status===401)return;
 }
}
function init(){
 styles();headerButton();
 window.addEventListener('mta-auth-state',e=>{
  if(e?.detail?.authenticated){headerButton();setTimeout(checkForced,0)}
  else{me=null;forcedOpen=false}
 });
 if(window.__mtaAuthState?.authenticated)setTimeout(checkForced,0);
}
window.MTAIdentitySecurity=Object.freeze({showProfile,close,checkForced});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();