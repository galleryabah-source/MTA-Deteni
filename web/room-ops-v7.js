(()=>{
const K='mta-deteni-demo-v2';
const get=()=>JSON.parse(localStorage.getItem(K)||'{}');
const put=d=>localStorage.setItem(K,JSON.stringify(d));
const E=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const uid=p=>p+'-'+crypto.randomUUID().slice(0,10).toUpperCase();
const audit=(a,t,i,r='SUCCESS')=>{const d=get();d.audit=d.audit||[];d.audit.unshift({id:uid('AUD'),action:a,resourceType:t,resourceId:i||'',result:r,occurredAt:new Date().toISOString(),actor:'DEMO-OPERATOR',requestId:uid('REQ'),correlationId:uid('COR'),policyVersion:'AUTHZ-1.0'});put(d)};
function ensure(){
 const d=get();
 d.detainees=d.detainees||[];d.placements=d.placements||[];d.rooms=d.rooms||[];d.qr=d.qr||{detainee:{},room:{},leave:{}};d.qr.room=d.qr.room||{};
 const seen=new Set(d.rooms.map(x=>`${x.block}::${x.room}`));
 d.placements.forEach(p=>{
   if(!p.block||!p.room)return;
   const key=`${p.block}::${p.room}`;
   if(seen.has(key))return;
   const id=uid('ROOM');d.rooms.push({id,block:p.block,room:p.room,capacity:4,status:'ACTIVE',createdAt:new Date().toISOString(),source:'INFERRED_FROM_SYNTHETIC_PLACEMENT'});seen.add(key);
 });
 d.rooms.forEach(x=>d.qr.room[x.id]=d.qr.room[x.id]||{token:uid('RMQR'),status:x.status||'ACTIVE'});
 put(d);return d;
}
function render(){
 const r=document.querySelector('#appView');if(!r)return;const d=ensure();
 const rows=d.rooms.map(x=>{
   const occ=d.placements.filter(p=>p.block===x.block&&p.room===x.room).length;
   const q=d.qr.room[x.id]||{status:x.status||'ACTIVE',token:''};
   const state=q.status||x.status||'ACTIVE';
   const cap=Number(x.capacity)||0;
   const occupancy=cap?`${occ}/${cap}`:`${occ}/—`;
   const warning=cap&&occ>cap?' · OVER CAPACITY':'';
   return `<tr><td><b>${E(x.block)}</b></td><td>${E(x.room)}</td><td>${occupancy}${E(warning)}</td><td><span class="p6tag">${E(state)}</span></td><td>${E(q.token)}</td><td><button class="btn small" onclick="window.p6qr('room','${E(x.id)}')">QR</button> <button class="btn small" onclick="window.p7roomState('${E(x.id)}')">State</button></td></tr>`;
 }).join('');
 r.innerHTML=`<section class="hero"><h1>Room Operations</h1><p class="sub">Kelola master kamar, occupancy, lifecycle QR permanen, dan perubahan state pada runtime synthetic lokal.</p></section><div class="toolbar"><button class="btn primary" onclick="window.p7addRoom()">+ Tambah Kamar</button><button class="btn" onclick="window.p7refreshRooms()">Refresh</button></div><div class="p6card"><div class="tablewrap"><table class="table"><thead><tr><th>Blok</th><th>Kamar</th><th>Occupancy</th><th>QR State</th><th>Token</th><th>Aksi</th></tr></thead><tbody>${rows||'<tr><td colspan="6" class="empty">Belum ada kamar. Tambahkan master kamar untuk memulai Room Ops.</td></tr>'}</tbody></table></div></div><div class="p6grid"><div class="p6card"><h2>Room Summary</h2><div class="kpis"><div><div class="label">Total Kamar</div><b>${d.rooms.length}</b></div><div><div class="label">Terisi</div><b>${d.rooms.filter(x=>d.placements.some(p=>p.block===x.block&&p.room===x.room)).length}</b></div><div><div class="label">QR Aktif</div><b>${d.rooms.filter(x=>(d.qr.room[x.id]?.status||x.status)==='ACTIVE').length}</b></div></div></div><div class="p6card"><h2>Lifecycle</h2><p class="p6mini">ACTIVE → SUSPENDED → REVOKED → ACTIVE. Perubahan menghasilkan audit event synthetic.</p></div></div>`;
}
window.p7addRoom=()=>{
 ensure();
 openModal(`<div class="dialoghead"><h2>Tambah Kamar</h2><button class="x" onclick="closeModal()">×</button></div><div class="formgrid"><div class="field"><label>Blok</label><input id="p7block" placeholder="Blok A"></div><div class="field"><label>Kamar</label><input id="p7room" placeholder="Kamar 01"></div><div class="field"><label>Kapasitas</label><input id="p7cap" type="number" min="1" max="999" value="4"></div></div><div class="actions"><button class="btn" onclick="closeModal()">Batal</button><button class="btn primary" onclick="window.p7saveRoom()">Simpan Kamar</button></div>`);
};
window.p7saveRoom=()=>{
 const d=ensure();const block=(document.querySelector('#p7block')?.value||'').trim(),room=(document.querySelector('#p7room')?.value||'').trim(),capacity=Math.max(1,Number(document.querySelector('#p7cap')?.value||0));
 if(!block||!room){toast('Blok dan kamar wajib diisi.');return}
 if(d.rooms.some(x=>x.block.toLowerCase()===block.toLowerCase()&&x.room.toLowerCase()===room.toLowerCase())){toast('Kamar tersebut sudah ada.');audit('ROOM_CREATE','ROOM','', 'DENIED');return}
 const id=uid('ROOM');d.rooms.push({id,block,room,capacity,status:'ACTIVE',createdAt:new Date().toISOString(),source:'MANUAL_SYNTHETIC'});d.qr=d.qr||{detainee:{},room:{},leave:{}};d.qr.room=d.qr.room||{};d.qr.room[id]={token:uid('RMQR'),status:'ACTIVE'};put(d);audit('ROOM_CREATE','ROOM',id);closeModal();toast('Kamar berhasil ditambahkan secara synthetic.');render();
};
window.p7roomState=id=>{const d=ensure(),x=d.rooms.find(z=>z.id===id),q=d.qr.room[id];if(!x||!q)return;const next={ACTIVE:'SUSPENDED',SUSPENDED:'REVOKED',REVOKED:'ACTIVE'}[q.status]||'ACTIVE';q.status=next;x.status=next;put(d);audit('QR_ROOM_STATE_CHANGE','ROOM_QR',id);toast('Room QR state → '+next);render()};
window.p7refreshRooms=()=>{ensure();render();toast('Room Ops diperbarui.')};
const oldShow=window.show;window.show=v=>v==='p6rooms'?render():oldShow(v);
ensure();
})();
