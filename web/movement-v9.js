const CANONICAL_DATA_EVENT='mta:data-changed';
(()=>{
const detaineeIdentity=d=>String(d?.nid||d?.code||d?.id||'');
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=p=>p+'-'+crypto.randomUUID().slice(0,10).toUpperCase();
const get=()=>window.MTADeteniStateKernel?window.MTADeteniStateKernel.read():{};
const put=d=>{const kernel=window.MTADeteniStateKernel;if(!kernel)throw new Error('CANONICAL_STATE_KERNEL_REQUIRED');return kernel.write(d)};
const appendAudit=(d,a,t,i,r='SUCCESS',correlationId)=>{const kernel=window.MTADeteniStateKernel;if(kernel?.audit)return kernel.audit(d,a,t,i,r,{actor:'DEMO-OPERATOR',correlationId});throw new Error('CANONICAL_AUDIT_KERNEL_REQUIRED')};
const audit=(a,t,i,r='SUCCESS')=>{const d=get(),kernel=window.MTADeteniStateKernel;if(kernel?.audit){kernel.audit(d,a,t,i,r,{actor:'DEMO-OPERATOR'});put(d);return}throw new Error('CANONICAL_AUDIT_KERNEL_REQUIRED')};
function ensure(){const d=structuredClone(get());d.detainees=d.detainees||[];d.rooms=d.rooms||[];d.blocks=d.blocks||[];d.placements=d.placements||[];d.movements=d.movements||[];d.qr=d.qr||{detainee:{},room:{},leave:{}};return d}
function current(d,id){return d.placements.filter(p=>p.detaineeId===id).sort((a,b)=>String(b.since||'').localeCompare(String(a.since||'')))[0]||null}
function room(d,p){return p?.roomId?d.rooms.find(r=>r.id===p.roomId):d.rooms.find(r=>r.block===p?.block&&r.room===p?.room)}
function occ(d,r,exclude){return d.detainees.filter(x=>x.status==='AKTIF'&&x.id!==exclude).filter(x=>room(d,current(d,x.id))?.id===r.id).length}
function render(){
  const r=document.querySelector('#appView');
  if(!r)return;
  const d=ensure();
  const active=d.detainees.filter(x=>x.status==='AKTIF');
  const rooms=d.rooms.filter(x=>x.status==='ACTIVE'&&(d.qr.room?.[x.id]?.status||'ACTIVE')==='ACTIVE');
  const types=d.adminCatalogs?.movementTypes||['TRANSFER_KAMAR','INTERNAL','KLINIK','SIDANG','LAINNYA'];
  const rows=d.movements.slice(0,30).map(m=>{
    const det=d.detainees.find(x=>x.id===m.detaineeId);
    return '<tr><td>'+E(m.id)+'</td><td>'+E(detaineeIdentity(det)||m.detaineeId)+'</td><td>'+E(m.type||m.kind||'MOVEMENT')+'</td><td>'+E(m.fromRoom||m.from||'—')+'</td><td>'+E(m.toRoom||m.to||'—')+'</td><td>'+E(m.occurredAt||m.createdAt||'')+'</td></tr>';
  }).join('');
  const activeOptions=active.map(x=>'<option value="'+E(x.id)+'">'+E(detaineeIdentity(x))+' — '+E(x.name)+'</option>').join('');
  const typeOptions=types.map(x=>'<option '+(x==='TRANSFER_KAMAR'?'selected':'')+'>'+E(x)+'</option>').join('');
  r.innerHTML='<section class="hero"><h1>Pergerakan</h1><p class="sub">Perpindahan kamar menggunakan Master Kamar Administrator. Kamar tujuan tidak dapat diinput bebas.</p></section>'+
    '<div class="p6grid"><div class="p6card"><h2>Transfer Kamar</h2><form id="p9moveForm" class="formgrid">'+
    '<div class="field full"><label>Deteni</label><select name="detaineeId" required><option value="">Pilih deteni</option>'+activeOptions+'</select></div>'+
    '<div class="field full"><label>Kamar Saat Ini</label><div id="p9currentRoom" class="notice">Pilih deteni terlebih dahulu.</div></div>'+
    '<div class="field full"><label>Kamar Tujuan</label><select name="roomId" id="p9targetRoom" required><option value="">Pilih deteni terlebih dahulu</option></select></div>'+
    '<div class="field"><label>Jenis Pergerakan</label><select name="type">'+typeOptions+'</select></div>'+
    '<div class="field"><label>Tanggal/Waktu</label><input name="occurredAt" type="datetime-local" value="'+new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16)+'" required></div>'+
    '<div class="field full"><label>Catatan</label><textarea name="note" rows="3" placeholder="Alasan/perintah perpindahan"></textarea></div>'+
    '<div class="actions full"><button class="btn primary">Simpan Perpindahan</button></div></form></div>'+
    '<div class="p6card"><h2>Aturan</h2><ul><li>Kamar tujuan harus berasal dari Master Kamar.</li><li>Hanya kamar ACTIVE yang dapat dipilih.</li><li>Kapasitas tidak boleh terlampaui.</li><li>Kamar saat ini tidak dapat dipilih sebagai tujuan.</li><li>Perpindahan membuat movement + placement baru dan audit event.</li></ul></div></div>'+
    '<div class="p6card" style="margin-top:12px"><h2>Riwayat Pergerakan</h2><div class="tablewrap"><table class="table"><thead><tr><th>ID</th><th>Deteni</th><th>Jenis</th><th>Dari</th><th>Ke</th><th>Waktu</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan="6" class="empty">Belum ada pergerakan.</td></tr>')+
    '</tbody></table></div></div>';
  const ds=document.querySelector('#p9moveForm');
  const sel=ds?.elements.detaineeId;
  const target=document.querySelector('#p9targetRoom');
  const cur=document.querySelector('#p9currentRoom');
  const refresh=()=>{
    const id=sel?.value||'';
    const p=current(d,id);
    const cr=room(d,p);
    cur.innerHTML=cr?'<b>'+E(cr.block)+' / '+E(cr.room)+'</b> · '+E(String(cr.capacity||0))+' kapasitas':'Belum terpetakan';
    target.innerHTML='<option value="">Pilih kamar tujuan</option>'+
      rooms.filter(x=>!cr||x.id!==cr.id).map(x=>{
        const o=occ(d,x,id);
        const cap=Number(x.capacity)||0;
        return '<option value="'+E(x.id)+'" '+(cap&&o>=cap?'disabled':'')+'>'+E(x.block)+' / '+E(x.room)+' — '+o+'/'+cap+(cap&&o>=cap?' · FULL':'')+'</option>';
      }).join('');
  };
  sel?.addEventListener('change',refresh);
  ds?.addEventListener('submit',async e=>{
    e.preventDefault();
    const form=new FormData(ds);
    const id=String(form.get('detaineeId'));
    const rid=String(form.get('roomId'));
    const occurred=String(form.get('occurredAt')||'');
    if(!id||!rid){toast('Deteni dan kamar tujuan wajib dipilih.');return}
    const button=ds.querySelector('button[type="submit"]');
    if(button)button.disabled=true;
    try{
      if(window.mtaProductionStateAdapter?.isProduction?.()){
        const requestKey='MOVE_DETAINEE:'+id+':'+rid+':'+occurred;
        const correlationId=uid('COR');
        const result=await window.mtaProductionStateAdapter.executeMovement({detaineeId:id,targetRoomId:rid,movementType:'TRANSFER',purpose:String(form.get('note')||''),occurredAt:new Date(occurred).toISOString(),idempotencyKey:requestKey,correlationId});
        const proof=result?.data||{};
        if(!proof.movementId||!proof.placementId||!proof.auditEventId)throw new Error('TRANSACTION_EVIDENCE_INCOMPLETE');
        toast(result.replayed?'Perpindahan sudah tersimpan sebelumnya. Data produksi dimuat ulang.':'Perpindahan berhasil disimpan ke database produksi. Audit dan placement terverifikasi.');
        render();
        return;
      }
      if(typeof window.mtaUnifiedCreateMovement!=='function'||typeof window.mtaUnifiedAssignPlacement!=='function'){toast('Canonical movement/placement command belum siap.');return}
      const d=ensure();
      const correlationId=uid('COR');
      const result=await window.mtaUnifiedCreateMovement(d,{detaineeId:id,roomId:rid,occurredAt:occurred,type:String(form.get('type')||'TRANSFER_KAMAR'),note:String(form.get('note')||''),correlationId,requestKey:'ROOM_TRANSFER:'+id+':'+rid+':'+occurred});
      if(!result.ok){appendAudit(d,'MOVEMENT_CREATE_BLOCKED','MOVEMENT',id,'DENIED',result.correlationId||correlationId);put(d);toast('Perpindahan ditolak: '+result.code);return}
      put(d);
      if(!d.lastMutation?.key){toast('Mutation evidence belum tersedia.');return}
      toast('Perpindahan kamar tersimpan.');
      render();
    }catch(error){
      const code=String(error?.message||error?.data?.error||'TRANSACTIONAL_MOVEMENT_REJECTED');
      const labels={PRODUCTION_AUTH_REQUIRED:'Sesi autentikasi produksi tidak tersedia.',RBAC_WRITE_DENIED:'Akun tidak memiliki hak untuk memindahkan deteni.',DETAINEE_NOT_FOUND:'Deteni tidak ditemukan pada database produksi.',DETAINEE_NOT_ACTIVE:'Deteni tidak berstatus aktif.',ROOM_NOT_FOUND:'Kamar tujuan tidak ditemukan.',ROOM_NOT_ACTIVE:'Kamar tujuan tidak aktif.',ROOM_SCOPE_MISMATCH:'Kamar tujuan berada di scope yang berbeda.',DETAINEE_SCOPE_DENIED:'Akses scope deteni ditolak.',SAME_ROOM:'Deteni sudah berada di kamar tersebut.',ROOM_CAPACITY_EXCEEDED:'Kapasitas kamar tujuan sudah penuh.',IDEMPOTENCY_CONFLICT:'Permintaan yang sama menggunakan kunci transaksi berbeda.',TRANSACTION_EVIDENCE_INCOMPLETE:'Bukti transaksi tidak lengkap; perubahan tidak diterima oleh UI.',TRANSACTIONAL_MOVEMENT_REJECTED:'Transaksi perpindahan ditolak oleh server.'};
      toast(labels[code]||('Perpindahan ditolak: '+code));
    }finally{
      if(button)button.disabled=false;
    }
  });
}
window.MTAMovementView=Object.freeze({render,ensure});ensure();
})();
