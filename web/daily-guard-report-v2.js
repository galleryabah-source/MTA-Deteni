(()=>{ 
  'use strict';
  const TYPE='DAILY_GUARD_REPORT';
  const VERSION='DAILY-GUARD-v1.1';
  const WORKFLOW=Object.freeze({
    DRAFT:'DRAFT',
    VALIDATED:'VALIDATED',
    GENERATED:'GENERATED',
    IN_REVIEW:'IN_REVIEW',
    CHANGES_REQUESTED:'CHANGES_REQUESTED',
    APPROVED:'APPROVED',
    FINAL:'FINAL'
  });
  const TRANSITIONS=Object.freeze({
    DRAFT:['VALIDATED'],
    VALIDATED:['GENERATED'],
    GENERATED:['IN_REVIEW'],
    IN_REVIEW:['APPROVED','CHANGES_REQUESTED'],
    CHANGES_REQUESTED:['DRAFT'],
    APPROVED:['FINAL'],
    FINAL:[]
  });
  const PAGE_DEFS=Object.freeze([
    ['cover','Cover'],['addressee','Addressee'],['handover','Team Handover'],
    ['block_control','Detainee Block Checking / Control'],['guard_post','Guard-Post Readiness'],
    ['activity','Detainee Activity Supervision'],['escort','Special Escort / Activity'],
    ['meal','Meal Distribution / Scheduled Service'],['end_handover','End-of-Shift Handover'],
    ['closing','Closing & Signatures'],['closing_page','Closing Page']
  ]);
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  function canonicalize(v){
    if(v===null||typeof v!=='object')return JSON.stringify(v);
    if(Array.isArray(v))return '['+v.map(canonicalize).join(',')+']';
    return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonicalize(v[k])).join(',')+'}';
  }
  async function sha256Hex(v){
    const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(v)));
    return Array.from(new Uint8Array(d),b=>b.toString(16).padStart(2,'0')).join('');
  }
  function required(v,code){const x=String(v??'').trim();if(!x)throw new Error(code);return x}
  function canTransition(from,to){return Array.isArray(TRANSITIONS[from])&&TRANSITIONS[from].includes(to)}
  function transitionStatus(r,to){
    const from=r.status||WORKFLOW.DRAFT;
    if(!canTransition(from,to))throw new Error('REPORT_INVALID_TRANSITION:'+from+'>'+to);
    r.status=to;
    return r;
  }
  function lifecycleAction(status){
    const map={
      DRAFT:{label:'Validate',next:WORKFLOW.VALIDATED},
      VALIDATED:{label:'Generate',next:WORKFLOW.GENERATED},
      GENERATED:{label:'Start Review',next:WORKFLOW.IN_REVIEW},
      IN_REVIEW:{label:'Approve',next:WORKFLOW.APPROVED,alternate:{label:'Request Changes',next:WORKFLOW.CHANGES_REQUESTED}},
      APPROVED:{label:'Finalize',next:WORKFLOW.FINAL},
      CHANGES_REQUESTED:{label:'Revise',next:WORKFLOW.DRAFT},
      FINAL:{label:'Final',next:null}
    };
    return map[status]||map.DRAFT;
  }
  function validate(r){
    required(r.reportDate,'REPORT_DATE_REQUIRED');required(r.officeId,'REPORT_OFFICE_REQUIRED');
    required(r.reguId,'REPORT_REGU_REQUIRED');required(r.shiftId,'REPORT_SHIFT_REQUIRED');
    required(r.startAt,'REPORT_START_REQUIRED');required(r.templateVersion,'REPORT_TEMPLATE_REQUIRED');
    if(r.documentType!==TYPE)throw new Error('REPORT_TYPE_INVALID');
    if(!Array.isArray(r.sourceRecordIds))throw new Error('REPORT_PROVENANCE_REQUIRED');
    if(!Array.isArray(r.photos))throw new Error('REPORT_PHOTO_COLLECTION_REQUIRED');
    if(!Array.isArray(r.signatories))throw new Error('REPORT_SIGNATORIES_REQUIRED');
    if(!PAGE_DEFS.every(([k])=>r.sections?.[k]))throw new Error('REPORT_SECTION_INCOMPLETE');
    return true;
  }
  function ensureStyles(){
    if(document.getElementById('mta-daily-guard-report-v2-style'))return;
    const s=document.createElement('style');s.id='mta-daily-guard-report-v2-style';s.textContent=`
      .mta-report-preview{background:#e9eef5;padding:18px;display:grid;gap:18px}
      .mta-report-page{width:1440pt;height:810pt;max-width:100%;background:#fff;position:relative;overflow:hidden;box-shadow:0 10px 34px rgba(15,23,42,.14);padding:58pt 72pt;display:flex;flex-direction:column}
      .mta-report-page:before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(11,99,206,.05),transparent 45%,rgba(15,23,42,.035));pointer-events:none}
      .mta-report-header{position:relative;display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #172033;padding-bottom:16pt;margin-bottom:28pt}
      .mta-report-kicker{font-size:13pt;letter-spacing:.08em;text-transform:uppercase;color:#526176;font-weight:700}
      .mta-report-title{font-size:31pt;line-height:1.08;margin:8pt 0 0;color:#172033;font-weight:800}
      .mta-report-meta{font-size:12pt;color:#526176;line-height:1.5;text-align:right}
      .mta-report-body{position:relative;display:grid;gap:18pt;font-size:14pt;line-height:1.5;color:#263142}
      .mta-report-lead{font-size:19pt;line-height:1.45}.mta-report-grid{display:grid;grid-template-columns:1fr 1fr;gap:14pt}
      .mta-report-card{border:1pt solid #cfd6df;border-radius:9pt;padding:14pt;background:#fbfcfe}
      .mta-report-card h4{margin:0 0 7pt;font-size:12pt;text-transform:uppercase;letter-spacing:.04em;color:#526176}
      .mta-report-card p{margin:0}.mta-report-photo-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14pt}
      .mta-report-photo{height:215pt;border:2pt dashed #aab5c3;border-radius:9pt;background:linear-gradient(135deg,#f7f9fc,#edf2f7);display:grid;place-items:center;text-align:center;color:#687385;font-size:12pt;padding:20pt}
      .mta-report-photo small{display:block;margin-top:5pt}.mta-report-signatures{display:grid;grid-template-columns:1fr 1fr;gap:28pt;margin-top:26pt}
      .mta-report-signature{border-top:1pt solid #4b5563;padding-top:10pt;min-height:85pt}
      .mta-report-footer{position:absolute;left:72pt;right:72pt;bottom:34pt;border-top:1pt solid #d7dce3;padding-top:8pt;display:flex;justify-content:space-between;color:#687385;font-size:9pt}
      .mta-report-closing{height:100%;display:grid;place-items:center;text-align:center}.mta-report-closing strong{font-size:42pt;letter-spacing:.08em;color:#172033}
      .mta-report-badge{display:inline-block;padding:7pt 12pt;border-radius:999pt;background:#edf8f0;color:#16763b;font-size:11pt;font-weight:800}
      @media(max-width:1024px){.mta-report-preview{padding:0}.mta-report-page{width:100%;height:auto;min-height:0;padding:26px 20px}.mta-report-title{font-size:25px}.mta-report-meta{font-size:10px}.mta-report-body{font-size:12px}.mta-report-lead{font-size:16px}.mta-report-photo{height:150px}.mta-report-footer{position:static;margin-top:22px}.mta-report-grid,.mta-report-photo-grid,.mta-report-signatures{grid-template-columns:1fr}}
      @media print{@page{size:20in 11.25in;margin:0}.mta-report-preview{display:block;background:#fff;padding:0}.mta-report-page{width:20in;height:11.25in;max-width:none;box-shadow:none;padding:58pt 72pt;break-after:page;page-break-after:always}.mta-report-page:last-child{break-after:auto;page-break-after:auto}}
    `;document.head.appendChild(s);
  }
  function photoSlots(photos,key){
    const p=photos.filter(x=>x.templatePlacement===key);const slots=p.length?p:[{id:'SYNTH-'+key+'-01',status:'PLACEHOLDER',templatePlacement:key}];
    return '<div class="mta-report-photo-grid">'+slots.slice(0,4).map(x=>'<div class="mta-report-photo"><div><b>'+esc(x.status||'PHOTO SLOT')+'</b><small>'+esc(x.id||'synthetic')+'</small><small>Placement: '+esc(key)+'</small></div></div>').join('')+'</div>';
  }
  function page(title,r,body,n){
    return '<section class="mta-report-page"><header class="mta-report-header"><div><div class="mta-report-kicker">MTA DETENI · '+esc(r.officeId)+'</div><div class="mta-report-title">'+esc(title)+'</div></div><div class="mta-report-meta">'+esc(r.reportDate)+'<br>Regu '+esc(r.reguId)+' · Shift '+esc(r.shiftId)+'<br>'+esc(r.startAt)+'</div></header><div class="mta-report-body">'+body+'</div><footer class="mta-report-footer"><span>'+esc(r.documentId)+' · '+esc(r.templateVersion)+'</span><span>Halaman '+n+' / 11</span></footer></section>';
  }
  function render(r){
    validate(r);const s=r.sections;
    const pages=[
      page('LAPORAN HARIAN REGU JAGA',r,'<p class="mta-report-lead">Laporan pelaksanaan tugas jaga untuk Regu <b>'+esc(r.reguId)+'</b>, Shift <b>'+esc(r.shiftId)+'</b>, tanggal <b>'+esc(r.reportDate)+'</b>.</p><div class="mta-report-grid"><div class="mta-report-card"><h4>Status Dokumen</h4><p><span class="mta-report-badge">'+esc(r.status)+'</span></p></div><div class="mta-report-card"><h4>Integrity</h4><p>SHA-256: '+esc(r.integrityHash||'PENDING')+'</p></div></div>'+photoSlots(r.photos,'cover'),1),
      page('ADDRESSEE',r,'<div class="mta-report-card"><h4>Kepada</h4><p>'+esc(s.addressee.text)+'</p></div><div class="mta-report-card"><h4>Scope</h4><p>Generated from verified structured synthetic records. Restricted operational fields are excluded.</p></div>',2),
      page('TEAM HANDOVER',r,'<div class="mta-report-grid"><div class="mta-report-card"><h4>Incoming Team</h4><p>'+esc(s.handover.incomingRegu)+' · '+esc(s.handover.shift)+'</p></div><div class="mta-report-card"><h4>Attendance</h4><p>'+esc(s.handover.attendanceStatus)+'</p></div></div><div class="mta-report-card"><h4>Handover Note</h4><p>'+esc(s.handover.note)+'</p></div>'+photoSlots(r.photos,'handover'),3),
      page('DETAINEE BLOCK CHECKING / CONTROL',r,'<div class="mta-report-grid"><div class="mta-report-card"><h4>Checking Time</h4><p>'+esc(s.block_control.time)+'</p></div><div class="mta-report-card"><h4>Headcount</h4><p>'+esc(s.block_control.headcount)+'</p></div></div><div class="mta-report-card"><h4>Result</h4><p>'+esc(s.block_control.result)+'</p></div>'+photoSlots(r.photos,'block_control'),4),
      page('GUARD-POST READINESS',r,'<div class="mta-report-grid"><div class="mta-report-card"><h4>Post / CCTV</h4><p>'+esc(s.guard_post.activity)+'</p></div><div class="mta-report-card"><h4>Result</h4><p>'+esc(s.guard_post.result)+'</p></div></div>'+photoSlots(r.photos,'guard_post'),5),
      page('DETAINEE ACTIVITY SUPERVISION',r,'<div class="mta-report-card"><h4>Activity</h4><p>'+esc(s.activity.description)+'</p></div><div class="mta-report-grid"><div class="mta-report-card"><h4>Time / Location</h4><p>'+esc(s.activity.time)+' · '+esc(s.activity.location)+'</p></div><div class="mta-report-card"><h4>Result</h4><p>'+esc(s.activity.result)+'</p></div></div>'+photoSlots(r.photos,'activity'),6),
      page('SPECIAL ESCORT / ACTIVITY',r,'<div class="mta-report-grid"><div class="mta-report-card"><h4>Count</h4><p>'+esc(s.escort.count)+'</p></div><div class="mta-report-card"><h4>Destination / Purpose</h4><p>'+esc(s.escort.destination)+' · '+esc(s.escort.purpose)+'</p></div></div><div class="mta-report-card"><h4>Activity</h4><p>'+esc(s.escort.activity)+'</p></div>'+photoSlots(r.photos,'escort'),7),
      page('MEAL DISTRIBUTION / SCHEDULED SERVICE',r,'<div class="mta-report-grid"><div class="mta-report-card"><h4>Inspection Time</h4><p>'+esc(s.meal.time)+'</p></div><div class="mta-report-card"><h4>Result</h4><p>'+esc(s.meal.result)+'</p></div></div><div class="mta-report-card"><h4>Distribution Status</h4><p>'+esc(s.meal.distributionStatus)+'</p></div>'+photoSlots(r.photos,'meal'),8),
      page('END-OF-SHIFT HANDOVER',r,'<div class="mta-report-grid"><div class="mta-report-card"><h4>Time</h4><p>'+esc(s.end_handover.time)+'</p></div><div class="mta-report-card"><h4>Incoming Team</h4><p>'+esc(s.end_handover.incomingRegu)+'</p></div></div><div class="mta-report-card"><h4>Condition / Outstanding Issues</h4><p>'+esc(s.end_handover.condition)+'<br>'+esc(s.end_handover.outstandingIssues)+'</p></div>'+photoSlots(r.photos,'end_handover'),9),
      page('CLOSING & SIGNATURES',r,'<div class="mta-report-card"><h4>Closing Statement</h4><p>'+esc(s.closing.statement)+'</p></div><div class="mta-report-signatures">'+r.signatories.map(x=>'<div class="mta-report-signature"><b>'+esc(x.role)+'</b><br>'+esc(x.name)+'<br><small>'+esc(x.identifier||'Identifier controlled by authorization policy')+'</small></div>').join('')+'</div>',10),
      page('CLOSING PAGE',r,'<div class="mta-report-closing"><div><strong>MTA DETENI</strong><p>'+esc(r.reguId)+' · '+esc(r.shiftId)+'</p><p>Dokumen sintetis terkontrol · Template '+esc(r.templateVersion)+'</p></div></div>',11)
    ];
    return '<div class="mta-report-preview">'+pages.join('')+'</div>';
  }
  async function prepare(input){
    const r=structuredClone(input);validate(r);const material=structuredClone(r);delete material.integrityHash;delete material.filename;
    r.integrityHash=await sha256Hex(canonicalize(material));
    r.filename='Laporan_Harian_Regu_Jaga_'+r.reportDate+'_'+String(r.reguId).replace(/[^A-Za-z0-9_-]/g,'_')+'_'+String(r.shiftId).replace(/[^A-Za-z0-9_-]/g,'_')+'.pdf';
    return r;
  }
  window.mtaDailyGuardReport=Object.freeze({TYPE,VERSION,WORKFLOW,TRANSITIONS,PAGE_DEFS,canonicalize,sha256Hex,validate,canTransition,transitionStatus,lifecycleAction,prepare,render,ensureStyles});
})();