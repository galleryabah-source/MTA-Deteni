(()=>{
'use strict';
const KEY='mta-deteni-demo-v2';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
function printQR(kind,id){
  const d=read();
  const map=kind==='room'?'room':kind==='leave'?'leave':'detainee';
  const q=d.qr?.[map]?.[id];
  const x=kind==='room'?d.rooms?.find(v=>v.id===id):kind==='leave'?d.leaves?.find(v=>v.id===id):d.detainees?.find(v=>v.id===id);
  if(!q||!x||typeof window.qrcode!=='function'){window.toast?.('QR belum siap untuk dicetak');return false;}
  const payload=`mta://${kind}/${q.token}`;
  const qr=window.qrcode(0,'M');qr.addData(payload);qr.make();
  const svg=qr.createSvgTag(8,0);
  const primary=kind==='leave'?x.id:kind==='room'?x.block:x.code;
  const secondary=kind==='leave'?x.destination:kind==='room'?x.room:x.name;
  const heading=kind==='leave'?'QR LEAVE':kind==='room'?'QR ROOM':'QR DETENEE';
  const w=window.open('','_blank','width=520,height=720');
  if(!w){window.toast?.('Popup diblokir browser. Izinkan popup untuk mencetak QR.');return false;}
  w.document.open();
  w.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MTA DETENI - ${esc(heading)}</title><style>@page{size:A6 portrait;margin:7mm}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#111;font-family:"Segoe UI",Arial,sans-serif}body{display:flex;justify-content:center}.sheet{width:100%;max-width:105mm;min-height:135mm;display:flex;flex-direction:column;align-items:center;text-align:center;padding:3mm 2mm}.brand{font-size:12pt;font-weight:800;letter-spacing:.04em}.type{font-size:8pt;color:#555;margin-top:1.5mm;text-transform:uppercase}.qr{width:76mm;height:76mm;margin:6mm auto 5mm;display:flex;align-items:center;justify-content:center}.qr svg{width:76mm!important;height:76mm!important;display:block}.primary{font-size:15pt;font-weight:800;line-height:1.2;overflow-wrap:anywhere;max-width:94mm}.secondary{font-size:12pt;font-weight:600;line-height:1.25;margin-top:2mm;overflow-wrap:anywhere;max-width:94mm}</style></head><body><main class="sheet"><div class="brand">MTA DETENI</div><div class="type">${esc(heading)}</div><div class="qr">${svg}</div><div class="primary">${esc(primary)}</div><div class="secondary">${esc(secondary)}</div></main><script>window.onload=()=>setTimeout(()=>window.print(),200);</script></body></html>`);
  w.document.close();
  const a=d.audit||[];a.unshift({id:'AUD-'+crypto.randomUUID().slice(0,10).toUpperCase(),action:'QR_PRINT',resourceType:'QR',resourceId:id||'',result:'SUCCESS',occurredAt:new Date().toISOString(),actor:'DEMO-OPERATOR',requestId:'REQ-'+crypto.randomUUID().slice(0,10).toUpperCase(),correlationId:'COR-'+crypto.randomUUID().slice(0,10).toUpperCase(),policyVersion:'AUTHZ-1.0'});d.audit=a;localStorage.setItem(KEY,JSON.stringify(d));
  return true;
}
window.p6printQR=printQR;
window.MTA_DETENI_CLEAN_QR_PRINT='v3';
})();
