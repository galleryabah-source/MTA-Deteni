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
      return Object.freeze({version:VERSION,mode:'PRODUCTION',source:'PRODUCTION_DB',database:runtime.database==='CONNECTED'?'CONNECTED':'DISCONNECTED',syntheticOnly:false});
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
    window.dispatchEvent(new CustomEvent('mta-provenance-status',{detail:p}));
  }
  window.MTAProvenance=Object.freeze({VERSION,isProduction,status,assert,applyChrome});
  try{assert();}catch(error){console.error('[MTA] provenance contract failed',error);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyChrome,{once:true});else applyChrome();
  let last='';
  const reconcile=()=>{const p=status();const key=[p.mode,p.source,p.database,p.syntheticOnly].join('|');if(key!==last){last=key;try{assert();}catch(error){console.error('[MTA] provenance contract failed',error);}applyChrome();}};
  window.addEventListener('mta-runtime-status',reconcile);
  const timer=setInterval(()=>{reconcile();if(window.__mtaRuntimeStatus?.database==='CONNECTED'||!isProduction())clearInterval(timer);},250);
})();
