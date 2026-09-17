(()=>{
const K='mta-deteni-demo-v2';
const get=()=>JSON.parse(localStorage.getItem(K)||'{}');
const E=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const audit=(a,t,i,r='SUCCESS')=>{const d=get();d.audit=d.audit||[];d.audit.unshift({id:'AUD-'+crypto.randomUUID().slice(0,10).toUpperCase(),action:a,resourceType:t,resourceId:i||'',result:r,occurredAt:new Date().toISOString(),actor:'DEMO-OPERATOR',requestId:'REQ-'+crypto.randomUUID().slice(0,10).toUpperCase(),correlationId:'COR-'+crypto.randomUUID().slice(0,10).toUpperCase(),policyVersion:'AUTHZ-1.0'});localStorage.setItem(K,JSON.stringify(d));};
window.p6printQR=(kind,id)=>{
  const d=get();
  const map=kind==='room'?'room':kind==='leave'?'leave':'detainee';
  const q=d.qr?.[map]?.[id];
  const x=kind==='room'?d.rooms?.find(z=>z.id===id):kind==='leave'?d.leaves?.find(z=>z.id===id):d.detainees?.find(z=>z.id===id);
  if(!q||!x||!window.qrcode){if(window.toast)toast('QR belum siap untuk dicetak');return;}
  const payload=`mta://${kind}/${q.token}`;
  const label=kind==='room'?(x.block+' / '+x.room):kind==='leave'?(x.id+' · '+x.destination):(x.code+' · '+x.name);
  const type='QR '+kind.toUpperCase();
  const g=qrcode(0,'M');g.addData(payload);g.make();
  const svg=g.createSvgTag(8,0);
  const title=`MTA DETENI · ${type}`;
  const w=window.open('','_blank','width=520,height=720');
  if(!w){if(window.toast)toast('Popup diblokir browser. Izinkan popup untuk mencetak QR.');return;}
  w.document.open();
  w.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${E(title)}</title><style>@page{size:A6 portrait;margin:8mm}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#111;font-family:"Segoe UI",Arial,sans-serif}body{display:flex;justify-content:center}.sheet{width:100%;max-width:105mm;min-height:132mm;display:flex;flex-direction:column;align-items:center;text-align:center;padding:4mm 2mm}.brand{font-size:13pt;font-weight:800;letter-spacing:.04em;margin-top:2mm}.type{font-size:10pt;font-weight:700;letter-spacing:.08em;margin-top:2mm;text-transform:uppercase}.qr{width:76mm;height:76mm;margin:9mm auto 7mm;display:flex;align-items:center;justify-content:center}.qr svg{width:76mm!important;height:76mm!important;display:block}.label{font-size:15pt;font-weight:700;line-height:1.25;overflow-wrap:anywhere;max-width:94mm;margin:0}.id{font-size:13pt;font-weight:700;margin-top:2mm}.destination{font-size:12pt;font-weight:600;margin-top:2mm;max-width:94mm;overflow-wrap:anywhere}@media print{body{width:auto}.sheet{min-height:132mm}}</style></head><body><main class="sheet"><div class="brand">MTA DETENI</div><div class="type">${E(type)}</div><div class="qr">${svg}</div><div class="label">${E(kind==='leave'?x.id:kind==='room'?x.block:x.code)}</div><div class="destination">${E(kind==='leave'?x.destination:kind==='room'?x.room:x.name)}</div></main><script>window.onload=()=>setTimeout(()=>window.print(),250);</script></body></html>`);
  w.document.close();
  audit('QR_PRINT','QR',id);
};
})();
