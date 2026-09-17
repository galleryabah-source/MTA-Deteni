(()=>{'use strict';
const DB='mta-deteni-offline-v1',STORE='mutations';
function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:'idempotencyKey'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function put(m){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(m);tx.oncomplete=()=>{db.close();resolve(m)};tx.onerror=()=>{db.close();reject(tx.error)}})}
async function all(){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const r=tx.objectStore(STORE).getAll();r.onsuccess=()=>{db.close();resolve(r.result)};r.onerror=()=>{db.close();reject(r.error)}})}
async function remove(key){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(key);tx.oncomplete=()=>{db.close();resolve(true)};tx.onerror=()=>{db.close();reject(tx.error)}})}
window.MTADeteniOfflineQueue=Object.freeze({put,all,remove,storage:'INDEXED_DB',crashSafe:'TRANSACTIONAL',syntheticOnly:true});
})();
