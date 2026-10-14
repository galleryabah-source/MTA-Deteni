(()=>{
  'use strict';
  const VERSION='PROVENANCE-SYNTHETIC-LABEL-V1';
  const PRODUCTION_HOSTS=new Set(['mta-deteni.galleryabah.workers.dev']);
  function isProduction(){return PRODUCTION_HOSTS.has(location.hostname);}
  function status(){
    const production=isProduction();
    const adapter=window.mtaProductionStateAdapter;
    const runtime=window.__mtaRuntimeStatus||{};
    if(production){
      const database=['CONNECTED','DISCONNECTED','NOT_PROBED'].includes(runtime.database)?runtime.database:'NOT_PROBED';
      return Object.freeze({version:VERSION,mode:'PRODUCTION',source:'PRODUCTION_DB',database,syntheticOnly:false});
    }
    return Object.freeze({version:VERSION,mode:'SYNTHETIC',source:'SYNTHETIC_RUNTIME',database:'DISCONNECTED',syntheticOnly:true});
  }
  function assert(){
    const p=status();
    if(p.mode==='PRODUCTION' && (p.source!=='PRODUCTION_DB'||p.syntheticOnly!==false))throw new Error('PROVENANCE_CONTRACT_VIOLATION');
    if(p.mode==='SYNTHETIC' && (p.source!=='SYNTHETIC_RUNTIME'||p.database!=='DISCONNECTED'||p.syntheticOnly!==true))throw new Error('PROVENANCE_CONTRACT_VIOLATION');
    return p;
  }
  function applyChrome(){
    const p=status();
    document.querySelectorAll('[data-mta-provenance]').forEach(el=>{
      el.textContent=p.mode+' · '+p.source+' · '+p.database;
      el.dataset.mode=p.mode;
    });
    if(p.mode==='PRODUCTION'){
      const replacements=[
        ['Runtime: SYNTHETIC','Runtime: PRODUCTION · PRODUCTION_DB'],
        ['SYNTHETIC ONLY','PRODUCTION RUNTIME'],
        ['Synthetic runtime; bukan data operasional nyata.','Sumber data runtime produksi; status koneksi diperiksa terpisah.'],
        ['Provenance: synthetic-operational-runtime','Provenance: production-runtime'],
        ['Generated from verified structured synthetic records. Restricted operational fields are excluded.','Data berasal dari runtime produksi; verifikasi sumber dan scope akses sebelum tindakan operasional.'],
        ['ADMIN ONLY · Role synthetic saat ini:','ADMIN ONLY · Role saat ini:'],
        ['Role synthetic:','Role:'],
        ['Runtime tetap synthetic/local.',p.database==='CONNECTED'?'Runtime production terhubung ke database.':p.database==='DISCONNECTED'?'Runtime production; koneksi database gagal.':'Runtime production; status database belum diverifikasi.']
      ];
      const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
      const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
      for(const node of nodes){let value=node.nodeValue||'';for(const [from,to] of replacements)if(value.includes(from))value=value.split(from).join(to);if(value!==node.nodeValue)node.nodeValue=value;}
    }
    window.dispatchEvent(new CustomEvent('mta-provenance-status',{detail:p}));
  }
  const observeProductionLabels=()=>{
    if(!isProduction()||!document.body)return;
    const observer=new MutationObserver(()=>{if(status().mode==='PRODUCTION')applyChrome();});
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    window.__mtaProvenanceObserver=observer;
  };
  window.MTAProvenance=Object.freeze({VERSION,isProduction,status,assert,applyChrome,observeProductionLabels});
  try{assert();}catch(error){console.error('[MTA] provenance contract failed',error);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{applyChrome();observeProductionLabels();},{once:true});else {applyChrome();observeProductionLabels();}
  let last='';
  const reconcile=()=>{const p=status();const key=[p.mode,p.source,p.database,p.syntheticOnly].join('|');if(key!==last){last=key;try{assert();}catch(error){console.error('[MTA] provenance contract failed',error);}applyChrome();}};
  window.addEventListener('mta-runtime-status',reconcile);
  const timer=setInterval(()=>{reconcile();if(window.__mtaRuntimeStatus?.database==='CONNECTED'||!isProduction())clearInterval(timer);},250);
})();
