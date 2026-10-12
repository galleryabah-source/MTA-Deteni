(()=>{'use strict';
const KEY='mta-deteni-demo-v2';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=()=>{try{const k=window.MTADeteniStateKernel;if(k?.read)return k.read();return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const A=(s,k)=>Array.isArray(s[k])?s[k]:[], norm=v=>String(v??'').trim()||'Tidak diisi';
const groups=(a,f)=>{const m={};a.forEach(x=>{const k=norm(f(x));m[k]=(m[k]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1])};
const age=d=>{let n=Number(d.age);if(Number.isFinite(n))return n;const r=d.dateOfBirth||d.birthDate||d.tanggalLahir;if(!r)return null;const x=new Date(r),t=new Date();if(Number.isNaN(x.getTime()))return null;n=t.getFullYear()-x.getFullYear();if(t.getMonth()<x.getMonth()||(t.getMonth()===x.getMonth()&&t.getDate()<x.getDate()))n--;return n};
const ageGroup=d=>{const n=age(d);if(n===null)return'Tidak diketahui';if(n<18)return'<18 tahun';if(n<25)return'18–24 tahun';if(n<35)return'25–34 tahun';if(n<45)return'35–44 tahun';if(n<55)return'45–54 tahun';return'55+ tahun'};
const pct=(n,max)=>max?Math.round(n*100/max):0;
function styles(){if(document.getElementById('mtaDetaineeStatsStyles'))return;const e=document.createElement('style');e.id='mtaDetaineeStatsStyles';e.textContent=`.ds{display:grid;gap:14px}.dshead{display:flex;justify-content:space-between;gap:10px}.dskpi{display:grid;grid-template-columns:repeat(6,1fr);gap:9px}.dsk{background:#fff;border:1px solid #d7dce3;border-radius:12px;padding:12px}.dsk small{color:#667085;font-size:10px}.dsk b{display:block;font-size:24px}.dsg{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.dsc{background:#fff;border:1px solid #d7dce3;border-radius:13px;padding:14px}.dsc h2{margin:0 0 4px;font-size:16px}.muted{color:#667085;font-size:10px}.dsrow{display:grid;grid-template-columns:120px 1fr 38px;gap:7px;align-items:center;margin:8px 0;font-size:10px}.bar{height:8px;background:#edf0f4;border-radius:9px}.bar i{display:block;height:100%;background:#0b63ce;border-radius:9px}.dst{width:100%;border-collapse:collapse}.dst th,.dst td{border-bottom:1px solid #edf0f4;padding:7px;font-size:10px;text-align:left}.detail-table{min-width:1200px}.detail-wrap{overflow:auto;border:1px solid #d7dce3;border-radius:10px}.detail-actions{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px}.dsnote{padding:10px;background:#f8fafc;border:1px solid #e4e7ec;border-radius:9px;font-size:10px;color:#526176}@media(max-width:1100px){.dskpi{grid-template-columns:repeat(3,1fr)}}@media(max-width:700px){.dsg{grid-template-columns:1fr}.dskpi{grid-template-columns:repeat(2,1fr)}}`;document.head.appendChild(e)}
function chart(title,sub,rows){const max=rows[0]?.[1]||1;return '<section class="dsc"><h2>'+esc(title)+'</h2><div class="muted">'+esc(sub)+'</div>'+(rows.length?rows.map(([k,n])=>'<div class="dsrow"><span>'+esc(k)+'</span><div class="bar"><i style="width:'+pct(n,max)+'%"></i></div><b>'+n+'</b></div>').join(''):'<p class="muted">Belum ada data.</p>')+'</section>'}
function operationalRows(s){
 const d=A(s,'detainees'),p=A(s,'placements'),m=A(s,'movements'),l=A(s,'leaves');
 const latest={};p.forEach(x=>{if(!x.detaineeId)return;const t=String(x.since||x.createdAt||'');if(!latest[x.detaineeId]||t>latest[x.detaineeId]._t)latest[x.detaineeId]={...x,_t:t}});
 const moves={};m.forEach(x=>{if(x.detaineeId)moves[x.detaineeId]=(moves[x.detaineeId]||0)+1});
 const leaves={};l.forEach(x=>{if(x.detaineeId)leaves[x.detaineeId]=(leaves[x.detaineeId]||0)+1});
 return d.map((x,i)=>({no:i+1,code:x.code,name:x.name,nationality:x.nationality,status:x.status||x.state,age:age(x)??'',gender:x.gender||x.sex||x.jenisKelamin,block:latest[x.id]?.block||latest[x.id]?.blok||'',room:latest[x.id]?.room||latest[x.id]?.kamar||'',placementDate:latest[x.id]?.since||latest[x.id]?.createdAt||'',movements:moves[x.id]||0,leaves:leaves[x.id]||0,createdAt:x.createdAt}));}
function tableHtml(rows){
 return '<table class="dst detail-table"><thead><tr><th>No</th><th>Kode</th><th>Nama Deteni</th><th>Kebangsaan</th><th>Status</th><th>Usia</th><th>Jenis Kelamin</th><th>Blok</th><th>Kamar</th><th>Pergerakan</th><th>Izin</th><th>Tanggal Tercatat</th></tr></thead><tbody>'+
 rows.map(r=>'<tr><td>'+r.no+'</td><td>'+esc(r.code)+'</td><td>'+esc(r.name)+'</td><td>'+esc(r.nationality)+'</td><td>'+esc(r.status)+'</td><td>'+esc(r.age)+'</td><td>'+esc(r.gender)+'</td><td>'+esc(r.block)+'</td><td>'+esc(r.room)+'</td><td>'+r.movements+'</td><td>'+r.leaves+'</td><td>'+esc(r.createdAt)+'</td></tr>').join('')+
 '</tbody></table>';}
function downloadTable(rows){
 const html='<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Data Statistik Deteni</title><style>@page{size:A4 landscape;margin:10mm}body{font-family:Arial,sans-serif;color:#172033}h1{text-align:center;font-size:20px}p{font-size:10px;color:#667085}.detail-table{width:100%;border-collapse:collapse}.detail-table th,.detail-table td{border:1px solid #9ca3af;padding:5px;font-size:8px;text-align:left}.detail-table th{background:#eef2f7;font-weight:700}</style></head><body><h1>DATA STATISTIK DETENI</h1><p>Data operasional Deteni — tanpa audit/log/kesisteman MTA DETENI.</p>'+tableHtml(rows)+'</body></html>';
 const blob=new Blob([html],{type:'application/msword;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Data_Statistik_Deteni.doc';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function printStatisticsReport(){
 const root=document.getElementById('appView'),report=root?.querySelector('.ds');
 if(!report)return;
 const dateText=new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});
 const printable=report.cloneNode(true);
 printable.querySelectorAll('.dshead,.no-print,.detail-actions,nav,[role="navigation"],.top,.side,.footer,.bottom-nav,.mobile-nav,.app-nav,.runtime-status,.runtime-banner,[data-mta-runtime-status]').forEach(el=>el.remove());
 printable.querySelectorAll('*').forEach(el=>{if(el.children.length===0&&/^Runtime:\s*(Production|Preview|Development)/i.test((el.textContent||'').trim()))el.remove()});
 const reportHtml=printable.outerHTML;
 const html=`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Laporan Statistik Deteni</title><style>
 @page{size:A4 portrait;margin:12mm}
 *{box-sizing:border-box;print-color-adjust:exact;-webkit-print-color-adjust:exact}
 body{font-family:Arial,Helvetica,sans-serif;color:#172033;margin:0;font-size:9pt;line-height:1.35}
 .print-head{border-bottom:2px solid #172033;padding-bottom:8px;margin-bottom:12px}
 .print-head h1{font-size:18pt;margin:0 0 4px;text-align:left}
 .print-head p{font-size:8pt;color:#526176;margin:0}
 .ds{display:block!important}.ds>*{margin:0 0 10px!important}
 .dshead{display:none!important}.dsnote{font-size:8pt;padding:8px;background:#f8fafc;border:1px solid #d7dce3;border-radius:5px}
 .dskpi{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:6px!important}
 .dsk{padding:8px!important;border:1px solid #cfd5dd!important;border-radius:5px!important;break-inside:avoid}
 .dsk small{font-size:7pt!important}.dsk b{font-size:16pt!important}
 .dsg{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
 .dsc{padding:9px!important;border:1px solid #cfd5dd!important;border-radius:5px!important;break-inside:avoid;min-width:0}
 .dsc h2{font-size:10pt!important;margin:0 0 3px!important}.muted{font-size:7pt!important;color:#526176!important}
 .dsrow{display:grid!important;grid-template-columns:minmax(0,1fr) 58px 20px!important;gap:5px!important;margin:5px 0!important;font-size:7pt!important;break-inside:avoid}
 .bar{height:6px!important;background:#edf0f4!important}.bar i{background:#0b63ce!important}
 .dst{width:100%;border-collapse:collapse}.dst th,.dst td{border:1px solid #aeb7c2;padding:5px;font-size:7pt;text-align:left;overflow-wrap:anywhere}
 .dst th{background:#eef2f7!important}.detail-actions,.no-print,button{display:none!important}
 .detail-wrap{overflow:visible!important;border:0!important}.detail-table{min-width:0!important;table-layout:auto}
 .detail-table th,.detail-table td{padding:3px!important;font-size:6pt!important}
 .detail-table thead{display:table-header-group}.detail-table tr{break-inside:avoid}
 .ds>section:last-child{break-before:page}
 .print-foot{margin-top:12px;border-top:1px solid #cfd5dd;padding-top:5px;font-size:7pt;color:#526176}
 </style></head><body><header class="print-head"><h1>LAPORAN STATISTIK DATA DETENI</h1><p>Dicetak pada ${esc(dateText)} · Sumber: data operasional Deteni</p></header>${reportHtml}<footer class="print-foot">MTA DETENI · Laporan statistik operasional · Audit trail, log, telemetry, authentication, dan event internal tidak dihitung sebagai data Deteni.</footer><script>window.addEventListener("load",()=>setTimeout(()=>window.print(),250));window.addEventListener("afterprint",()=>setTimeout(()=>window.close(),250));<\/script></body></html>`;
 const frame=document.createElement('iframe');
 frame.title='Pratinjau cetak laporan statistik';frame.setAttribute('aria-hidden','true');
 frame.style.cssText='position:fixed;width:1px;height:1px;right:0;bottom:0;border:0;opacity:.01;pointer-events:none';
 document.body.appendChild(frame);
 const w=frame.contentWindow;w.document.open();w.document.write(html);w.document.close();
 w.addEventListener('load',()=>{try{w.focus();w.print()}catch{}},{once:true});
 setTimeout(()=>{try{w.focus();w.print()}catch{}},400);
 setTimeout(()=>{if(frame.isConnected)frame.remove()},60000);
}
function printTable(rows){
 const html='<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Data Statistik Deteni</title><style>@page{size:A4 landscape;margin:10mm}body{font-family:Arial,sans-serif;color:#172033;margin:0}h1{text-align:center;font-size:20px}p{font-size:9px;color:#667085}.detail-table{width:100%;border-collapse:collapse}.detail-table th,.detail-table td{border:1px solid #9ca3af;padding:5px;font-size:8px;text-align:left}.detail-table th{background:#eef2f7;font-weight:700}</style></head><body><h1>DATA STATISTIK DETENI</h1><p>Data operasional Deteni — tanpa audit/log/kesisteman MTA DETENI.</p>'+tableHtml(rows)+'</body></html>';
 const frame=document.createElement('iframe');frame.style.cssText='position:fixed;width:1px;height:1px;right:0;bottom:0;border:0;opacity:0';frame.setAttribute('aria-hidden','true');document.body.appendChild(frame);const w=frame.contentWindow;w.document.open();w.document.write(html);w.document.close();setTimeout(()=>{w.focus();w.print();setTimeout(()=>frame.remove(),1200)},250);
}
function statistics(){styles();const s=read(),d=A(s,'detainees'),p=A(s,'placements'),m=A(s,'movements'),l=A(s,'leaves'),docs=A(s,'documents');
const latest={};p.forEach(x=>{if(!x.detaineeId)return;const t=String(x.since||x.createdAt||'');if(!latest[x.detaineeId]||t>latest[x.detaineeId]._t)latest[x.detaineeId]={...x,_t:t}});
const active=d.filter(x=>/AKTIF|ACTIVE|DITAHAN/.test(norm(x.status||x.state).toUpperCase())).length;
const deport=new Set(d.filter(x=>/DEPORT/.test(norm(x.status||'').toUpperCase())).map(x=>x.id));m.forEach(x=>{if(/DEPORT/.test(norm(x.type||x.kind).toUpperCase())&&x.detaineeId)deport.add(x.detaineeId)});
const placed=new Set(Object.keys(latest));
const gender=groups(d,x=>x.gender||x.sex||x.jenisKelamin), nat=groups(d,x=>x.nationality), stat=groups(d,x=>norm(x.status||x.state).toUpperCase()), ageg=groups(d,ageGroup);
const block=groups(Object.values(latest),x=>x.block||x.blok||'Tidak ditempatkan'), room=groups(Object.values(latest),x=>x.room||x.kamar||'Tidak ditempatkan');
const mov=groups(m,x=>x.type||x.kind||'Pergerakan'), leave=groups(l,x=>x.status||'Tidak diisi'), doct=groups(docs,x=>x.documentType||x.type||'Dokumen');
const months={};d.forEach(x=>{const z=new Date(x.createdAt);if(!Number.isNaN(z.getTime())){const k=z.toISOString().slice(0,7);months[k]=(months[k]||0)+1}});const trend=Object.entries(months).sort((a,b)=>a[0].localeCompare(b[0])).map(x=>x);
const withLeave=new Set(l.map(x=>x.detaineeId).filter(Boolean)).size,withDoc=new Set(docs.flatMap(x=>Array.isArray(x.sourceRecordIds)?x.sourceRecordIds:[])).size;
const root=document.getElementById('appView');root.innerHTML='<div class="ds"><section class="hero dshead"><div><h1>Statistik Data Deteni</h1><p class="sub">Gambaran populasi, karakteristik, penempatan, kegiatan dan perjalanan Deteni.</p></div><div class="detail-actions no-print"><button class="btn primary" id="dsPrintReport">Cetak Laporan Statistik</button><button class="btn" id="dsRefresh">↻ Refresh</button></div></section><div class="dsnote">Hanya data operasional Deteni yang dihitung. <b>Audit trail, log, telemetry, authentication, event aplikasi dan proses internal MTA DETENI tidak termasuk.</b></div><section class="dskpi"><div class="dsk"><small>Total Deteni</small><b>'+d.length+'</b></div><div class="dsk"><small>Deteni Aktif</small><b>'+active+'</b></div><div class="dsk"><small>Terdata Penempatan</small><b>'+placed.size+'</b></div><div class="dsk"><small>Pergerakan</small><b>'+m.length+'</b></div><div class="dsk"><small>Izin</small><b>'+l.length+'</b></div><div class="dsk"><small>Deteni Deportasi</small><b>'+deport.size+'</b></div></section><div class="dsg">'+chart('Status Deteni','Status operasional.',stat)+chart('Kebangsaan','Distribusi kewarganegaraan.',nat)+chart('Kelompok Usia','Usia/tanggal lahir bila tersedia.',ageg)+chart('Jenis Kelamin','Data gender bila tersedia.',gender)+chart('Penempatan — Blok','Penempatan terakhir.',block)+chart('Penempatan — Kamar','Kamar penempatan terakhir.',room)+chart('Jenis Pergerakan','Kegiatan pergerakan.',mov)+chart('Status Izin','Izin keluar sementara.',leave)+chart('Jenis Dokumen','Dokumen terkait Deteni.',doct)+chart('Tren Input Deteni','Jumlah pencatatan per bulan.',trend)+'</div><section class="dsc"><h2>Indikator Ekosistem Deteni</h2><div class="muted">Hubungan populasi dan kegiatan Deteni tanpa metrik kesisteman.</div><table class="dst"><tr><th>Indikator</th><th>Nilai</th></tr><tr><td>Deteni tanpa penempatan</td><td>'+Math.max(0,d.length-placed.size)+'</td></tr><tr><td>Rata-rata pergerakan / Deteni</td><td>'+ (d.length?(m.length/d.length).toFixed(2):'0.00')+'</td></tr><tr><td>Deteni dengan izin</td><td>'+withLeave+'</td></tr><tr><td>Deteni dengan dokumen</td><td>'+withDoc+'</td></tr></table></section><section class="dsc"><h2>Tabel Data Deteni</h2><div class="muted">Daftar operasional terstruktur untuk pelaporan dan rekap.</div><div class="detail-actions"><button class="btn" id="dsDownload">Download Tabel</button><button class="btn primary" id="dsPrint">Cetak Tabel</button></div><div class="detail-wrap">'+tableHtml(operationalRows(s))+'</div></section></div>';
const rows=operationalRows(s);document.getElementById('dsRefresh').onclick=statistics;document.getElementById('dsPrintReport').onclick=printStatisticsReport;document.getElementById('dsDownload').onclick=()=>downloadTable(rows);document.getElementById('dsPrint').onclick=()=>printTable(rows)}
let originalShow=null;function install(){if(window.__mtaDetaineeStatsInstalled)return;originalShow=window.show;window.show=function(v){if(v==='detainee-statistics'||v==='statistics')return statistics();return originalShow?.apply(this,arguments)};window.__mtaDetaineeStatsInstalled=true;if(window.__mtaUnifiedCurrentView==='detainee-statistics')statistics()}
window.MTADetaineeStatisticsView=Object.freeze({statistics,install});window.addEventListener('mta:unified-ready',install);if(window.__mtaUnifiedCurrentView||window.mtaUnifiedResolve)install();window.addEventListener('mta:data-changed',()=>{if(window.__mtaUnifiedCurrentView==='detainee-statistics')statistics()});
})();