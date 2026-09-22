(function(){
  'use strict';
  const ACTIONS=Object.freeze({
    addDetainee:()=>window.mtaRbac?.canAction('CREATE'),
    editDetainee:()=>window.mtaRbac?.canAction('UPDATE'),
    archiveDetainee:()=>window.mtaRbac?.canAction('DELETE'),
    generateReport:()=>window.mtaRbac?.canAction('CREATE'),
    validateReport:()=>window.mtaRbac?.canAction('UPDATE'),
    generateValidatedReport:()=>window.mtaRbac?.canAction('UPDATE'),
    startReview:()=>window.mtaRbac?.canAction('UPDATE'),
    approveReport:()=>window.mtaRbac?.canAction('APPROVE'),
    requestReportChanges:()=>window.mtaRbac?.canAction('UPDATE'),
    reviseReport:()=>window.mtaRbac?.canAction('CREATE'),
    finalizeReport:()=>window.mtaRbac?.canAction('FINALIZE'),
    downloadReport:()=>window.mtaRbac?.canAction('READ'),
    prepareBulkDownloadManifest:()=>window.mtaRbac?.canAction('READ'),
    advanceLeave:()=>{const id=arguments[0];return window.mtaRbac?.canAction('UPDATE')},
    p5openMovement:()=>window.mtaRbac?.canAction('CREATE'),
    p5return:()=>window.mtaRbac?.canAction('UPDATE'),
    p6roomState:()=>window.mtaRbac?.canAction('UPDATE'),
    p6issue:()=>window.mtaRbac?.canAction('CREATE'),
    p6csv:()=>window.mtaRbac?.canAction('READ'),
    p6printReport:()=>window.mtaRbac?.canAction('READ'),
    p6printQR:()=>window.mtaRbac?.canAction('READ')
  });
  function deny(action){
    try{if(typeof window.audit==='function')window.audit('RBAC_ACTION_DENIED','AUTHZ',action,'DENIED')}catch(_){ }
    if(typeof window.toast==='function')window.toast('Aksi ditolak oleh RBAC: '+action);
    return false;
  }
  function wrap(name,check){
    const fn=window[name];
    if(typeof fn!=='function'||fn.__mtaRbacWrapped)return;
    const wrapped=function(...args){if(!check.apply(this,args))return deny(name);return fn.apply(this,args)};
    wrapped.__mtaRbacWrapped=true;wrapped.__mtaRbacOriginal=fn;window[name]=wrapped;
  }
  function install(){
    Object.entries(ACTIONS).forEach(([name,check])=>wrap(name,check));
    const form=document.getElementById('p9moveForm');
    if(form&&!form.__mtaRbacGuard){
      form.addEventListener('submit',e=>{if(!window.mtaRbac?.canAction('CREATE')){e.preventDefault();e.stopImmediatePropagation();deny('movement.CREATE')}},true);
      form.__mtaRbacGuard=true;
    }
    document.querySelectorAll('[data-view]').forEach(b=>{
      if(b.__mtaRbacGuard)return;
      b.__mtaRbacGuard=true;
      b.addEventListener('click',e=>{
        if(b.dataset.view==='audit'&&!window.mtaRbac?.canAction('AUDIT')){e.preventDefault();e.stopImmediatePropagation();deny('audit.READ')}
      },true);
    });
  }
  window.mtaRbacActionGuard=Object.freeze({install,actions:Object.keys(ACTIONS)});
  install();
  new MutationObserver(install).observe(document.documentElement,{subtree:true,childList:true});
})();
