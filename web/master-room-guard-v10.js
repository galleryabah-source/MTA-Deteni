(()=>{
const K='mta-deteni-demo-v2';
const get=()=>window.MTADeteniStateKernel?window.MTADeteniStateKernel.read():JSON.parse(localStorage.getItem(K)||'{}');
const put=d=>window.MTADeteniStateKernel?window.MTADeteniStateKernel.write(d):localStorage.setItem(K,JSON.stringify(d));
const E=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const uid=p=>p+'-'+crypto.randomUUID().slice(0,10).toUpperCase();
const now=()=>new Date().toISOString();
const audit=(a,t,i,r='SUCCESS')=>{const d=get();d.audit=d.audit||[];d.audit.unshift({id:uid('AUD'),action:a,resourceType:t,resourceId:i||'',result:r,occurredAt:now(),actor:'DEMO-ADMIN',requestId:uid('REQ'),correlationId:uid('COR'),policyVersion:'AUTHZ-1.0'});put(d)};
const activeRooms=d=>(d.rooms||[]).filter(r=>r.status==='ACTIVE');
const currentRoom=(d,id)=>{const p=(d.placements||[]).filter(x=>x.detaineeId===id).sort((a,b)=>String(b.since||'').localeCompare(String(a.since||'')))[0];return p?(d.rooms||[]).find(r=>r.id===p.roomId)||((d.rooms||[]).find(r=>r.block===p.block&&r.room===p.room)):null};
const occupancy=(d,r,exclude)=> (d.detainees||[]).filter(x=>x.status==='AKTIF'&&x.id!==exclude).filter(x=>currentRoom(d,x.id)?.id===r.id).length;
window.MTA_DETENI_MASTER_ROOM_CONTRACT='v10';
window.MTA_DETENI_MASTER_ROOM_GUARD=Object.freeze({version:'v11',principles:['ROOM_STATUS_INDEPENDENT_OF_QR_STATUS','MASTER_ROOM_ONLY','CAPACITY_ENFORCED','TRANSFER_ONLY_FOR_ROOM_CHANGE','QR_STATE_PRESERVED_ON_ROOM_EDIT'],activeRooms,currentRoom,occupancy,validateDetaineeRoom:(d,roomId,excludeId)=>{const r=(d.rooms||[]).find(x=>x.id===roomId);if(!r||r.status!=='ACTIVE')return {ok:false,code:'ROOM_INACTIVE'};const count=occupancy(d,r,excludeId);if(count>=(Number(r.capacity)||0))return {ok:false,code:'ROOM_FULL'};return {ok:true,room:r,occupancy:count}}});
const legacyAddDetainee=window.addDetainee;
if(typeof legacyAddDetainee!=='function')console.warn('[MTA] core addDetainee not available at master-room guard load');
/* CRUD ownership is intentionally left to the core runtime. This module only exposes room guards. */
/*
window.addDetainee=existing=>{
 const d=get();d.detainees=d.detainees||[];d.placements=d.placements||[];d.rooms=d.rooms||[];
 const rooms=activeRooms(d),cur=existing?currentRoom(d,existing.id):null;
 const opts=rooms.map(r=>{const o=occupancy(d,r,existing?.id),cap=Number(r.capacity)||0;const selected=cur?.id===r.id;return `<option value="${E(r.id)}" ${selected?'selected':''} ${cap&&o>=cap&&!selected?'disabled':''}>${E(r.block)} / ${E(r.room)} — ${o}/${cap}</option>`}).join('');
 openModal(`<div class="dialoghead"><h2>${existing?'Edit':'Tambah'} Deteni</h2><button class="x" onclick="closeModal()">×</button></div><form id="p10dForm" class="formgrid"><div class="field"><label>Kode</label><input name="code" required value="${E(existing?.code||'')}"></div><div class="field"><label>Nama (synthetic)</label><input name="name" required value="${E(existing?.name||'')}"></div><div class="field"><label>Kebangsaan</label><input name="nationality" value="${E(existing?.nationality||'Contoh')}"></div><div class="field"><label>Status</label><select name="status"><option ${existing?.status==='AKTIF'||!existing?'selected':''}>AKTIF</option><option ${existing?.status==='NONAKTIF'?'selected':''}>NONAKTIF</option></select></div><div class="field full"><label>${existing?'Penempatan Saat Ini':'Penempatan Awal'}</label>${existing?`<div class="notice">${E(cur?cur.block+' / '+cur.room:'Belum terpetakan')}<br><span class="p6mini">Perubahan kamar dilakukan melalui modul Pergerakan → Transfer Kamar.</span></div>`:`<select name="roomId" ${rooms.length?'required':''}><option value="">${rooms.length?'Pilih kamar':'Belum ada master kamar aktif'}</option>${opts}</select>`}</div><div class="actions full"><button type="button" class="btn" onclick="closeModal()">Batal</button><button class="btn primary">Simpan</button></div></form></div>`);
 document.querySelector('#p10dForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),code=String(f.get('code')||'').trim(),name=String(f.get('name')||'').trim();
  if(!code||!name){toast('Kode dan nama wajib diisi.');return}
  if(d.detainees.some(x=>x.id!==(existing?.id||'')&&String(x.code).toLowerCase()===code.toLowerCase())){toast('Kode deteni sudah terdaftar.');return}
  if(existing){existing.code=code;existing.name=name;existing.nationality=String(f.get('nationality')||'Contoh');existing.status=f.get('status')||'AKTIF';audit('DETAINEE_UPDATE','DETAINEE',existing.id);put(d);closeModal();if(typeof window.detainee==='function')window.detainee(document.querySelector('#appView'));else window.show('detainee');toast('Data deteni diperbarui.');return}
  const roomId=String(f.get('roomId')||''),room=d.rooms.find(r=>r.id===roomId);if(!room||room.status!=='ACTIVE'){toast('Kamar tujuan tidak aktif atau tidak terdaftar.');return}
  if(occupancy(d,room)>=(Number(room.capacity)||0)){toast('Kamar sudah penuh.');return}
  const id=uid('DET'),det={id,code,name,nationality:String(f.get('nationality')||'Contoh'),status:String(f.get('status')||'AKTIF'),placement:room.block+' / '+room.room,createdAt:now()};d.detainees.unshift(det);
  const p={id:uid('PLC'),detaineeId:id,roomId:room.id,blockId:room.blockId,block:room.block,room:room.room,since:now(),source:'INITIAL_ASSIGNMENT'};d.placements.unshift(p);audit('DETAINEE_CREATE','DETAINEE',id);audit('PLACEMENT_ASSIGN','PLACEMENT',p.id);put(d);closeModal();if(typeof window.detainee==='function')window.detainee(document.querySelector('#appView'));else window.show('detainee');toast('Deteni dan penempatan awal tersimpan.');
 };
};
*/
const patchRoomEdit=()=>{if(typeof window.p9editRoom!=='function'||window.MTA_DETENI_ROOM_EDIT_GUARD)return;const original=window.p9editRoom;window.p9editRoom=id=>{const before=get(),prior=before.qr?.room?.[id]?.status;original(id);const form=document.querySelector('#p9roomForm');form?.addEventListener('submit',()=>setTimeout(()=>{const d=get();d.qr=d.qr||{detainee:{},room:{},leave:{}};d.qr.room=d.qr.room||{};if(prior){d.qr.room[id]=d.qr.room[id]||{token:uid('RMQR'),status:prior};d.qr.room[id].status=prior;put(d)}},0),{once:true});};window.MTA_DETENI_ROOM_EDIT_GUARD='v10';};
patchRoomEdit();
const baseShow=window.show;
const repairMovement=()=>{const d=get(),sel=document.querySelector('#p9moveForm select[name="detaineeId"]'),target=document.querySelector('#p9targetRoom');if(!sel||!target)return;const id=sel.value,p=currentRoom(d,id),cr=p?((d.rooms||[]).find(r=>r.id===p.roomId)||d.rooms.find(r=>r.block===p.block&&r.room===p.room)):null;const selected=target.value;const html=(d.rooms||[]).filter(r=>r.status==='ACTIVE'&&(!cr||r.id!==cr.id)).map(r=>{const o=occupancy(d,r,id),cap=Number(r.capacity)||0;return `<option value="${E(r.id)}" ${r.id===selected?'selected':''} ${cap&&o>=cap?'disabled':''}>${E(r.block)} / ${E(r.room)} — ${o}/${cap}${cap&&o>=cap?' · FULL':''}</option>`}).join('');target.innerHTML='<option value="">Pilih kamar tujuan</option>'+html;};
window.show=v=>{if(v!=='movement')return baseShow(v);baseShow(v);repairMovement();const sel=document.querySelector('#p9moveForm select[name="detaineeId"]');sel?.addEventListener('change',()=>setTimeout(repairMovement,0),{capture:false});};
window.MTA_DETENI_MASTER_ROOM_GUARD.version='v11';
})();
