(()=>{
'use strict';
const KEY='mta-deteni-demo-v2';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let qrReady=null;
function ensureQrEngine(){if(typeof window.qrcode==='function')return Promise.resolve(true);if(qrReady)return qrReady;qrReady=new Promise(resolve=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';s.async=true;s.onload=()=>resolve(typeof window.qrcode==='function');s.onerror=()=>resolve(false);document.head.appendChild(s)});return qrReady}
function audit(id){const d=read(),a=d.audit||[];a.unshift({id:'AUD-'+crypto.randomUUID().slice(0,10).toUpperCase(),action:'QR_PRINT',resourceType:'QR',resourceId:id||'',result:'SUCCESS',occurredAt:new Date().toISOString(),actor:'DEMO-OPERATOR',requestId:'REQ-'+crypto.randomUUID().slice(0,10).toUpperCase(),correlationId:'COR-'+crypto.randomUUID().slice(0,10).toUpperCase(),policyVersion:'AUTHZ-1.0'});d.audit=a;localStorage.setItem(KEY,JSON.stringify(d));window.dispatchEvent(new CustomEvent('mta:data-changed',{detail:{source:'qr-print',action:'QR_PRINT',id}}))}
async function printPayload(kind,id,payload,label){
  if(!await ensureQrEngine()){window.toast?.('Mesin QR belum tersedia. Periksa koneksi lalu coba lagi.');return false}
  const qr=window.qrcode(0,'M');qr.addData(payload);qr.make();
  const svg=qr.createSvgTag(10,0),title=kind==='room'?'QR Permanen Kamar':kind==='leave'?'QR Izin':'QR Individu Deteni';
  const w=window.open('','_blank','width=560,height=760');
  if(!w){window.toast?.('Popup diblokir browser. Izinkan popup untuk mencetak QR.');return false}
  w.document.open();
  w.document.write('<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+'</title><style>@page{size:A6 portrait;margin:7mm}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#111;font-family:"Segoe UI",Arial,sans-serif}body{display:flex;justify-content:center}.sheet{width:100%;max-width:105mm;min-height:135mm;display:flex;flex-direction:column;align-items:center;text-align:center;padding:3mm 2mm}.brand{font-size:12pt;font-weight:800;letter-spacing:.04em}.type{font-size:8pt;color:#555;margin-top:1.5mm;text-transform:uppercase}.qr{width:76mm;height:76mm;margin:6mm auto 5mm;display:flex;align-items:center;justify-content:center}.qr svg{width:76mm!important;height:76mm!important;display:block}.primary{font-size:14pt;font-weight:800;line-height:1.2;overflow-wrap:anywhere;max-width:94mm}.payload{font-size:7pt;color:#667085;margin-top:2mm;overflow-wrap:anywhere;max-width:94mm}</style></head><body><main class="sheet"><div class="brand">MTA DETENI</div><div class="type">'+esc(title)+'</div><div class="qr">'+svg+'</div><div class="primary">'+esc(label||id)+'</div><div class="payload">'+esc(payload)+'</div></main><script>window.onload=function(){setTimeout(function(){window.print()},300)};<\/script></body></html>');
  w.document.close();audit(id);return true
}
async function printQR(kind,id){
 const d=read(),map=kind==='room'?'room':kind==='leave'?'leave':'detainee',q=d.qr?.[map]?.[id];
 const x=kind==='room'?d.rooms?.find(v=>v.id===id):kind==='leave'?d.leaves?.find(v=>v.id===id):d.detainees?.find(v=>v.id===id);
 if(!q||!x){window.toast?.('QR belum siap untuk dicetak');return false}
 const payload='mta://'+kind+'/'+id+'/'+String(q.token||'').replace(/[^A-Za-z0-9._-]+$/g,'');
 const label=kind==='room'?((x.block||'')+' / '+(x.room||x.name||id)):kind==='leave'?(x.destination||id):((x.code||id)+' · '+(x.name||''));
 return printPayload(kind,id,payload,label)
}
function interceptQrPrintButtons(){
 document.addEventListener('click',e=>{
  const b=e.target.closest?.('button,a');if(!b)return;
  const txt=String(b.textContent||'').trim();
  if(!/^(Cetak\s*\/\s*PDF|Cetak QR)$/i.test(txt))return;
  const root=b.closest('.modal,.dialog,[role="dialog"]')||document;
  const raw=String(root.textContent||'').match(/mta:\/\/(detainee|room|leave)\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+?)(?=Cetak|\s|$)/i);
  if(!raw)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  const kind=raw[1].toLowerCase(),id=raw[2],payload='mta://'+kind+'/'+id+'/'+raw[3];
  let label=id;
  const text=String(root.textContent||'');
  if(kind==='room'){const m=text.match(/Blok\s*[^\n]+\/\s*Kamar\s*\d+/i);if(m)label=m[0].trim()}
  else if(kind==='detainee'){const m=text.match(/DET-\d{4}-\d+\s*[·-]\s*[^\n]+/i);if(m)label=m[0].trim()}
  printPayload(kind,id,payload,label)
 },true)
}
window.p6printQR=printQR;
window.MTA_DETENI_CLEAN_QR_PRINT='v4';
window.MTA_DETENI_QR_PRINT_ENGINE=()=>typeof window.qrcode==='function';
interceptQrPrintButtons();
})();