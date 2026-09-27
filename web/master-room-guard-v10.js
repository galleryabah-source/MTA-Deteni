(()=>{
const K='mta-deteni-demo-v2';
const get=()=>window.MTADeteniStateKernel?window.MTADeteniStateKernel.read():JSON.parse(localStorage.getItem(K)||'{}');
const put=d=>{const kernel=window.MTADeteniStateKernel;if(!kernel)throw new Error('CANONICAL_STATE_KERNEL_REQUIRED');return kernel.write(d)};
const E=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const uid=p=>p+'-'+crypto.randomUUID().slice(0,10).toUpperCase();
const now=()=>new Date().toISOString();
const audit=(a,t,i,r='SUCCESS')=>{const d=get(),kernel=window.MTADeteniStateKernel;if(kernel?.audit){kernel.audit(d,a,t,i,r,{actor:'DEMO-ADMIN'});put(d);return}throw new Error('CANONICAL_AUDIT_KERNEL_REQUIRED')};
const activeRooms=d=>(d.rooms||[]).filter(r=>r.status==='ACTIVE');
const currentRoom=(d,id)=>{const p=(d.placements||[]).filter(x=>x.detaineeId===id).sort((a,b)=>String(b.since||'').localeCompare(String(a.since||'')))[0];return p?(d.rooms||[]).find(r=>r.id===p.roomId)||((d.rooms||[]).find(r=>r.block===p.block&&r.room===p.room)):null};
const occupancy=(d,r,exclude)=> (d.detainees||[]).filter(x=>x.status==='AKTIF'&&x.id!==exclude).filter(x=>currentRoom(d,x.id)?.id===r.id).length;
window.MTA_DETENI_MASTER_ROOM_CONTRACT='v11';
window.MTA_DETENI_MASTER_ROOM_GUARD=Object.freeze({version:'v11',principles:['ROOM_STATUS_INDEPENDENT_OF_QR_STATUS','MASTER_ROOM_ONLY','CAPACITY_ENFORCED','TRANSFER_ONLY_FOR_ROOM_CHANGE','QR_STATE_PRESERVED_ON_ROOM_EDIT'],activeRooms,currentRoom,occupancy,validateDetaineeRoom:(d,roomId,excludeId)=>{const r=(d.rooms||[]).find(x=>x.id===roomId);if(!r||r.status!=='ACTIVE')return {ok:false,code:'ROOM_INACTIVE'};const count=occupancy(d,r,excludeId);if(count>=(Number(r.capacity)||0))return {ok:false,code:'ROOM_FULL'};return {ok:true,room:r,occupancy:count}}});
/* Detainee CRUD ownership is exclusive to the core runtime. This module exposes validation/occupancy guards only. */
const patchRoomEdit=()=>{if(typeof window.p9editRoom!=='function'||window.MTA_DETENI_ROOM_EDIT_GUARD)return;const original=window.p9editRoom;window.p9editRoom=id=>{const before=get(),prior=before.qr?.room?.[id]?.status;original(id);const form=document.querySelector('#p9roomForm');form?.addEventListener('submit',()=>setTimeout(()=>{const d=get();d.qr=d.qr||{detainee:{},room:{},leave:{}};d.qr.room=d.qr.room||{};if(prior){d.qr.room[id]=d.qr.room[id]||{token:uid('RMQR'),status:prior};d.qr.room[id].status=prior;put(d)}},0),{once:true});};window.MTA_DETENI_ROOM_EDIT_GUARD='v10';};
patchRoomEdit();
// Navigation ownership belongs to the unified shell; this guard does not override window.show.
})();
