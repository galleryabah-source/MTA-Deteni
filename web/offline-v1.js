(()=>{
'use strict';
const VERSION='mta-deteni-offline-v2';
const QR_SRC='https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js';
const state=()=>navigator.serviceWorker?.controller?'OFFLINE-READY':'ONLINE-BOOTSTRAP';
function loadQR(){if(typeof window.qrcode==='function'||document.querySelector('script[data-mta-qr]'))return;const s=document.createElement('script');s.src=QR_SRC;s.async=false;s.dataset.mtaQr='1';s.onload=()=>document.documentElement.dataset.qrRuntime='local-cache';s.onerror=()=>document.documentElement.dataset.qrRuntime='unavailable';document.head.appendChild(s)}
function register(){if(!('serviceWorker' in navigator))return;loadQR();navigator.serviceWorker.register('/sw.js',{scope:'/'}).then(()=>{document.documentElement.dataset.offlineRuntime='ready';document.documentElement.dataset.offlineQueue='indexeddb';window.dispatchEvent(new CustomEvent('mta:offline-ready',{detail:{version:VERSION,state:state(),queue:'INDEXED_DB'}}))}).catch(()=>{})}
function boot(){register();window.addEventListener('online',()=>{loadQR();window.dispatchEvent(new CustomEvent('mta:connectivity',{detail:{online:true}}))});window.addEventListener('offline',()=>window.dispatchEvent(new CustomEvent('mta:connectivity',{detail:{online:false}})))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
