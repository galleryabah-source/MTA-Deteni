(()=>{
const K='mta-deteni-demo-v2';
const get=()=>JSON.parse(localStorage.getItem(K)||'{}');
const put=d=>{localStorage.setItem(K,JSON.stringify(d));window.dispatchEvent(new CustomEvent('mta:data-changed'))};
const E=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const uid=p=>p+'-'+crypto.randomUUID().slice(0,10).toUpperCase();
const now=()=>new Date().toISOString();
const audit=(a,t,i,r='SUCCESS',state=null)=>{const d=state||get();d.audit=d.audit||[];d.audit.unshift({id:uid('AUD'),action:a,resourceType:t,resourceId:i||'',result:r,occurredAt:now(),actor:'DEMO-ADMIN',requestId:uid('REQ'),correlationId:uid('COR'),policyVersion:'AUTHZ-1.0'});if(!state)put(d);};
function ensure(){const d=get();let changed=false;if(!d.adminSettings){d.adminSettings={role:'ADMIN',facilityName:'MTA DETENI Digital',timezone:'Asia/Jakarta',qrPolicy:'OPAQUE_TOKEN',migrationFreeze:true,ai:'OFF'};changed=true}if(!d.blocks){d.blocks=[];changed=true}if(!d.rooms){d.rooms=[];changed=true}if(!d.qr){d.qr={detainee:{},room:{},leave:{}};changed=true}d.qr.detainee=d.qr.detainee||{};d.qr.leave=d.qr.leave||{};if(!d.qr.room){d.qr.room={};changed=true}if(!d.adminCatalogs){d.adminCatalogs={};changed=true}const defaults={dutyGroups:['REGU A','REGU B','REGU C','REGU D'],shifts:['PAGI','SIANG','MALAM'],movementTypes:['INTERNAL','TRANSFER_KAMAR','KLINIK','SIDANG','LAINNYA'],leaveTypes:['IZIN SEMENTARA','PEMERIKSAAN KESEHATAN','PENGAWALAN','LAINNYA'],documentTypes:['LAPORAN HARIAN','BERITA ACARA','SURAT TUGAS','SURAT PENGANTAR','LAINNYA'],classifications:['INTERNAL','TERBATAS','RAHASIA'],roomTypes:['STANDARD','ISOLATION','OBSERVATION','MEDICAL','TRANSIT'],roomCategories:['UMUM','PRIA','WANITA','KHUSUS']};for(const [k,v] of Object.entries(defaults)){if(!(Array.isArray(d.adminCatalogs[k])&&d.adminCatalogs[k].length)){d.adminCatalogs[k]=v;changed=true}}d.rooms.forEach(r=>{if(!r.blockId){const b=d.blocks.find(b=>String(b.name).toLowerCase()===String(r.block).toLowerCase());if(b){r.blockId=b.id;changed=true}}if(!d.qr.room[r.id]){d.qr.room[r.id]={token:uid('RMQR'),status:r.status==='ACTIVE'?'ACTIVE':'SUSPENDED'};changed=true}});if(changed)put(d);return d}
function nav(){const n=document.querySelector('#nav');if(!n||document.querySelector('#p9settings'))return;const b=document.createElement('button');b.id='p9settings';b.dataset.view='p9settings';b.textContent='Pengaturan';b.onclick=e=>{e.stopPropagation();settings()};n.appendChild(b)}
function settings(){
  const d=ensure();
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
        '<div class="field"><label>AI Runtime</label><input value="OFF" disabled></div>'+
        '<div class="field"><label>Migration Freeze</label><input value="'+(d.adminSettings.migrationFreeze?'TRUE':'FALSE')+'" disabled></div>'+
      '</div><div class="actions"><button class="btn primary" onclick="window.p9saveSystem()">Simpan System</button></div></div>'+
      '<div class="p6card"><h2>Security &amp; Governance</h2><div class="notice">Role synthetic: <b>'+E(d.adminSettings.role)+
        '</b><br>QR Policy: <b>'+E(d.adminSettings.qrPolicy)+'</b><br>Real data: <b>DISALLOWED IN PREVIEW</b></div>'+
        '<p class="p6mini">User, role, permission, scope, duty assignment, dan policy produksi tetap mengikuti authorization boundary; password/secret tidak disimpan di runtime preview.</p></div>'+
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
}
window.p9openSettings=()=>settings();
function shell(t,desc,b){return `<section class="hero"><h1>${t}</h1><p class="sub">${desc}</p></section>${b}`}
window.p9saveSystem=()=>{const d=ensure();d.adminSettings.facilityName=(document.querySelector('#p9facility')?.value||d.adminSettings.facilityName).trim();d.adminSettings.timezone=document.querySelector('#p9tz')?.value||d.adminSettings.timezone;audit('ADMIN_SETTINGS_UPDATE','SYSTEM','ADMIN','SUCCESS',d);put(d);settings();toast('Pengaturan system tersimpan.')};
window.p9addCatalog=(key,label)=>{openModal(`<div class="dialoghead"><h2>Tambah ${E(label)}</h2><button class="x" onclick="closeModal()">×</button></div><div class="field"><label>Nilai</label><input id="p9cat" placeholder="Masukkan nilai master"></div><div class="actions"><button class="btn" onclick="closeModal()">Batal</button><button class="btn primary" onclick="window.p9saveCatalog('${E(key)}')">Simpan</button></div>`) };
window.p9saveCatalog=key=>{const d=ensure(),v=(document.querySelector('#p9cat')?.value||'').trim();if(!v){toast('Nilai wajib diisi.');return}if(d.adminCatalogs[key].some(x=>x.toLowerCase()===v.toLowerCase())){toast('Nilai sudah terdaftar.');return}d.adminCatalogs[key].push(v);audit('MASTER_CATALOG_CREATE','ADMIN_CATALOG',key,'SUCCESS',d);put(d);closeModal();settings();toast('Master tersimpan.')};
window.p9removeCatalog=(key,i)=>{const d=ensure();const v=d.adminCatalogs[key]?.[i];if(!v)return;if(!confirm('Nonaktifkan master '+v+'?'))return;d.adminCatalogs[key].splice(i,1);audit('MASTER_CATALOG_DEACTIVATE','ADMIN_CATALOG',key,'SUCCESS',d);put(d);settings();toast('Master dinonaktifkan.')};
window.p9addBlock=()=>{ensure();openModal(`<div class="dialoghead"><h2>Tambah Blok</h2><button class="x" onclick="closeModal()">×</button></div><div class="formgrid"><div class="field full"><label>Nama Blok</label><input id="p9bname" placeholder="Blok C"></div><div class="field"><label>Status</label><select id="p9bstatus"><option>ACTIVE</option><option>INACTIVE</option></select></div></div><div class="actions"><button class="btn" onclick="closeModal()">Batal</button><button class="btn primary" onclick="window.p9saveBlock()">Simpan</button></div>`)};
window.p9saveBlock=()=>{const d=ensure(),name=(document.querySelector('#p9bname')?.value||'').trim(),status=document.querySelector('#p9bstatus')?.value||'ACTIVE';if(!name){toast('Nama blok wajib diisi.');return}if(d.blocks.some(b=>b.name.toLowerCase()===name.toLowerCase())){toast('Blok sudah terdaftar.');return}const b={id:uid('BLK'),name,status,createdAt:now(),source:'ADMIN_MASTER'};d.blocks.push(b);audit('BLOCK_CREATE','BLOCK',b.id,'SUCCESS',d);put(d);closeModal();settings();toast('Blok tersimpan.')};
window.p9editBlock=id=>{const d=ensure(),b=d.blocks.find(x=>x.id===id);if(!b)return;openModal(`<div class="dialoghead"><h2>Edit Blok</h2><button class="x" onclick="closeModal()">×</button></div><div class="formgrid"><div class="field full"><label>Nama Blok</label><input id="p9bname" value="${E(b.name)}"></div><div class="field"><label>Status</label><select id="p9bstatus"><option ${b.status==='ACTIVE'?'selected':''}>ACTIVE</option><option ${b.status==='INACTIVE'?'selected':''}>INACTIVE</option></select></div></div><div class="actions"><button class="btn" onclick="closeModal()">Batal</button><button class="btn primary" onclick="window.p9saveBlockEdit('${E(id)}')">Simpan</button></div>`)};
window.p9saveBlockEdit=id=>{const d=ensure(),b=d.blocks.find(x=>x.id===id),name=(document.querySelector('#p9bname')?.value||'').trim();if(!b||!name)return;if(d.blocks.some(x=>x.id!==id&&x.name.toLowerCase()===name.toLowerCase())){toast('Nama blok duplikat.');return}b.name=name;b.status=document.querySelector('#p9bstatus')?.value||'ACTIVE';d.rooms.filter(r=>r.blockId===id).forEach(r=>r.block=name);audit('BLOCK_UPDATE','BLOCK',id,'SUCCESS',d);put(d);closeModal();settings();toast('Blok diperbarui.')};
function blockOptions(d,onlyActive=true){return d.blocks.filter(b=>!onlyActive||b.status==='ACTIVE').map(b=>`<option value="${E(b.id)}">${E(b.name)}</option>`).join('')}
window.p9addRoom=()=>{const d=ensure();if(!d.blocks.some(b=>b.status==='ACTIVE')){toast('Buat Master Blok aktif terlebih dahulu.');return}openModal(`<div class="dialoghead"><h2>Tambah Master Kamar</h2><button class="x" onclick="closeModal()">×</button></div><form id="p9roomForm" class="formgrid"><div class="field"><label>Blok</label><select name="blockId" required>${blockOptions(d)}</select></div><div class="field"><label>Nomor/Nama Kamar</label><input name="room" required placeholder="Kamar 03"></div><div class="field"><label>Kapasitas</label><input name="capacity" type="number" min="1" max="999" value="4" required></div><div class="field"><label>Tipe Kamar</label><select name="type">${d.adminCatalogs.roomTypes.map(x=>`<option>${E(x)}</option>`).join('')}</select></div><div class="field"><label>Kategori</label><select name="gender">${d.adminCatalogs.roomCategories.map(x=>`<option>${E(x)}</option>`).join('')}</select></div><div class="field"><label>Status</label><select name="status"><option>ACTIVE</option><option>INACTIVE</option><option>MAINTENANCE</option></select></div><div class="field full"><label>Catatan</label><textarea name="note" rows="3"></textarea></div><div class="actions full"><button type="button" class="btn" onclick="closeModal()">Batal</button><button class="btn primary">Simpan Kamar</button></div></form></div>`);document.querySelector('#p9roomForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),bid=f.get('blockId'),b=d.blocks.find(x=>x.id===bid),room=String(f.get('room')).trim();if(!b||!room)return;if(d.rooms.some(r=>r.blockId===bid&&r.room.toLowerCase()===room.toLowerCase())){toast('Kamar tersebut sudah terdaftar.');return}const id=uid('ROOM');d.rooms.push({id,blockId:bid,block:b.name,room,capacity:Number(f.get('capacity'))||1,type:f.get('type'),gender:f.get('gender'),status:f.get('status'),note:f.get('note')||'',createdAt:now(),source:'ADMIN_MASTER',version:1});d.qr.room[id]={token:uid('RMQR'),status:f.get('status')==='ACTIVE'?'ACTIVE':'SUSPENDED'};audit('ROOM_CREATE','ROOM',id,'SUCCESS',d);put(d);closeModal();settings();toast('Master kamar tersimpan.')}}
window.p9editRoom=id=>{const d=ensure(),r=d.rooms.find(x=>x.id===id);if(!r)return;openModal(`<div class="dialoghead"><h2>Edit Master Kamar</h2><button class="x" onclick="closeModal()">×</button></div><form id="p9roomForm" class="formgrid"><div class="field"><label>Blok</label><select name="blockId">${d.blocks.map(b=>`<option value="${E(b.id)}" ${(r.blockId===b.id||r.block===b.name)?'selected':''}>${E(b.name)}</option>`).join('')}</select></div><div class="field"><label>Nomor/Nama Kamar</label><input name="room" value="${E(r.room)}" required></div><div class="field"><label>Kapasitas</label><input name="capacity" type="number" min="1" value="${Number(r.capacity)||1}" required></div><div class="field"><label>Tipe</label><select name="type">${d.adminCatalogs.roomTypes.map(x=>`<option ${r.type===x?'selected':''}>${E(x)}</option>`).join('')}</select></div><div class="field"><label>Kategori</label><select name="gender">${d.adminCatalogs.roomCategories.map(x=>`<option ${r.gender===x?'selected':''}>${E(x)}</option>`).join('')}</select></div><div class="field"><label>Status</label><select name="status"><option ${r.status==='ACTIVE'?'selected':''}>ACTIVE</option><option ${r.status==='INACTIVE'?'selected':''}>INACTIVE</option><option ${r.status==='MAINTENANCE'?'selected':''}>MAINTENANCE</option></select></div><div class="field full"><label>Catatan</label><textarea name="note" rows="3">${E(r.note||'')}</textarea></div><div class="actions full"><button type="button" class="btn" onclick="closeModal()">Batal</button><button class="btn primary">Simpan</button></div></form></div>`);document.querySelector('#p9roomForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),b=d.blocks.find(x=>x.id===f.get('blockId')),room=String(f.get('room')).trim();if(!b||!room)return;if(d.rooms.some(x=>x.id!==id&&x.blockId===b.id&&x.room.toLowerCase()===room.toLowerCase())){toast('Kamar duplikat.');return}const oldCap=Number(r.capacity)||0,newCap=Number(f.get('capacity'))||1;const occ=(d.detainees||[]).filter(x=>{if(x.status!=='AKTIF')return false;const p=(d.placements||[]).filter(q=>q.detaineeId===x.id).sort((a,b)=>String(b.since||'').localeCompare(String(a.since||'')))[0];return p&&(p.roomId===id||(!p.roomId&&p.block===r.block&&p.room===r.room))}).length;if(newCap<occ){toast('Kapasitas baru lebih kecil dari occupancy saat ini.');return}Object.assign(r,{blockId:b.id,block:b.name,room,capacity:newCap,type:f.get('type'),gender:f.get('gender'),status:f.get('status'),note:f.get('note')||r.note||'',version:(r.version||1)+1});d.rooms.filter(x=>x.id!==id&&x.blockId===r.blockId&&x.block===r.block);if(!d.qr.room[id])d.qr.room[id]={token:uid('RMQR'),status:'ACTIVE'};d.qr.room[id].status=r.status==='ACTIVE'?'ACTIVE':'SUSPENDED';audit('ROOM_UPDATE','ROOM',id,'SUCCESS',d);put(d);closeModal();settings();toast('Master kamar diperbarui.')}};
function currentRoom(d,id){const p=(d.placements||[]).filter(x=>x.detaineeId===id).sort((a,b)=>String(b.since||'').localeCompare(String(a.since||'')))[0];return p?(d.rooms||[]).find(r=>r.id===p.roomId)||((d.rooms||[]).find(r=>r.block===p.block&&r.room===p.room)):null}
function roomOccupancy(d,r){return (d.detainees||[]).filter(x=>x.status==='AKTIF').filter(x=>currentRoom(d,x.id)?.id===r.id).length}
window.addDetainee=existing=>{const d=ensure(),rooms=d.rooms.filter(r=>r.status==='ACTIVE'&&(d.qr.room[r.id]?.status||'ACTIVE')==='ACTIVE'),cur=existing?currentRoom(d,existing.id):null;if(existing&&cur===null&&existing.placement){toast('Placement lama tidak terpetakan ke Master Kamar. Perlu rekonsiliasi Administrator.');}const opts=rooms.map(r=>{const o=roomOccupancy(d,r),cap=Number(r.capacity)||0;const selected=cur&&cur.id===r.id;return `<option value="${E(r.id)}" ${selected?'selected':''} ${cap&&o>=cap&&!selected?'disabled':''}>${E(r.block)} / ${E(r.room)} — ${o}/${cap}</option>`}).join('');openModal(`<div class="dialoghead"><h2>${existing?'Edit':'Tambah'} Deteni</h2><button class="x" onclick="closeModal()">×</button></div><form id="p9dForm" class="formgrid"><div class="field"><label>Kode</label><input name="code" required value="${E(existing?.code||'')}"></div><div class="field"><label>Nama (synthetic)</label><input name="name" required value="${E(existing?.name||'')}"></div><div class="field"><label>Kebangsaan</label><input name="nationality" value="${E(existing?.nationality||'Contoh')}"></div><div class="field"><label>Status</label><select name="status"><option ${existing?.status==='AKTIF'||!existing?'selected':''}>AKTIF</option><option ${existing?.status==='NONAKTIF'?'selected':''}>NONAKTIF</option></select></div><div class="field full"><label>${existing?'Penempatan Saat Ini':'Penempatan Awal'}</label>${existing?`<div class="notice">${E(cur?cur.block+' / '+cur.room:'Belum terpetakan')}<br><span class="p6mini">Perubahan kamar dilakukan melalui modul Pergerakan → Transfer Kamar.</span></div>`:`<select name="roomId" ${rooms.length?'required':''}><option value="">${rooms.length?'Pilih kamar':'Belum ada master kamar aktif'}</option>${opts}</select>`}</div><div class="actions full"><button type="button" class="btn" onclick="closeModal()">Batal</button><button class="btn primary">Simpan</button></div></form></div>`);document.querySelector('#p9dForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),code=String(f.get('code')).trim(),name=String(f.get('name')).trim();if(d.detainees.some(x=>x.id!==(existing?.id||'')&&String(x.code).toLowerCase()===code.toLowerCase())){toast('Kode deteni sudah terdaftar.');return}if(!code||!name)return;if(existing){existing.code=code;existing.name=name;existing.nationality=String(f.get('nationality')||'Contoh');existing.status=f.get('status')||'AKTIF';audit('DETAINEE_UPDATE','DETAINEE',existing.id,'SUCCESS',d);put(d);closeModal();if(typeof window.detainee==='function')window.detainee(document.querySelector('#appView'));else window.show('detainee');toast('Data deteni diperbarui.');return}const roomId=String(f.get('roomId')||'');if(!roomId){toast('Penempatan awal wajib memilih Master Kamar.');return}const room=d.rooms.find(r=>r.id===roomId);if(!room||room.status!=='ACTIVE'||(d.qr.room[room.id]?.status||'ACTIVE')!=='ACTIVE'){toast('Kamar tidak aktif.');return}if(roomOccupancy(d,room)>=(Number(room.capacity)||0)){toast('Kamar sudah penuh.');return}const id=uid('DET'),det={id,code,name,nationality:String(f.get('nationality')||'Contoh'),status:String(f.get('status')||'AKTIF'),placement:room.block+' / '+room.room,createdAt:now()};d.detainees.unshift(det);const p={id:uid('PLC'),detaineeId:id,roomId:room.id,blockId:room.blockId,block:room.block,room:room.room,since:now(),source:'INITIAL_ASSIGNMENT'};d.placements.unshift(p);audit('DETAINEE_CREATE','DETAINEE',id,'SUCCESS',d);audit('PLACEMENT_ASSIGN','PLACEMENT',p.id,'SUCCESS',d);put(d);closeModal();if(typeof window.detainee==='function')window.detainee(document.querySelector('#appView'));else window.show('detainee');toast('Deteni dan penempatan awal tersimpan.')}};
nav();ensure();
})();
