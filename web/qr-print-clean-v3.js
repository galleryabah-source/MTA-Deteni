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
  const payload='mta://'+kind+'/'+id+'/'+q.token;
  const qr=window.qrcode(0,'M');qr.addData(payload);qr.make();
  const svg=qr.createSvgTag(10,0);
  const w=window.open('','_blank','width=520,height=520');
  if(!w){window.toast?.('Popup diblokir browser. Izinkan popup untuk mencetak QR.');return false;}
  w.document.open();
  w.document.write('<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QR MTA DETENI</title><style>@page{size:A6 portrait;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff}body{width:100vw;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden}.qr{width:78mm;height:78mm;display:flex;align-items:center;justify-content:center}.qr svg{width:78mm!important;height:78mm!important;display:block}</style></head><body><div class="qr">'+svg+'</div><script>window.onload=function(){setTimeout(function(){window.print()},250)};<\\/script></body></html>');
  w.document.close();
  const a=d.audit||[];a.unshift({id:'AUD-'+crypto.randomUUID().slice(0,10).toUpperCase(),action:'QR_PRINT',resourceType:'QR',resourceId:id||'',result:'SUCCESS',occurredAt:new Date().toISOString(),actor:'DEMO-OPERATOR',requestId:'REQ-'+crypto.randomUUID().slice(0,10).toUpperCase(),correlationId:'COR-'+crypto.randomUUID().slice(0,10).toUpperCase(),policyVersion:'AUTHZ-1.0'});d.audit=a;localStorage.setItem(KEY,JSON.stringify(d));
  return true;
}
window.p6printQR=printQR;
window.MTA_DETENI_CLEAN_QR_PRINT='v3';
})();
