(()=>{
'use strict';
const VERSION='mta-deteni-offline-v1';
const state=()=>navigator.serviceWorker?.controller?'OFFLINE-READY':'ONLINE-BOOTSTRAP';
function register(){
  if(!('serviceWorker' in navigator))return;
  navigator.serviceWorker.register('/sw.js',{scope:'/'}).then(()=>{
    document.documentElement.dataset.offlineRuntime='ready';
    window.dispatchEvent(new CustomEvent('mta:offline-ready',{detail:{version:VERSION,state:state()}}));
  }).catch(()=>{});
}
function boot(){register();window.addEventListener('online',()=>window.dispatchEvent(new CustomEvent('mta:connectivity',{detail:{online:true}})));window.addEventListener('offline',()=>window.dispatchEvent(new CustomEvent('mta:connectivity',{detail:{online:false}})));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
