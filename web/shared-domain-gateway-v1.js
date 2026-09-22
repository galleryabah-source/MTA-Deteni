(()=>{'use strict';
function adapter(){if(!window.MTADeteniRuntimeAdapter)throw new Error('RUNTIME_ADAPTER_UNAVAILABLE');return window.MTADeteniRuntimeAdapter}
function cloud(){return adapter().getMode()==='CLOUD'}
async function listDetainees(){if(!cloud())return null;const r=await adapter().list('detainees');return Array.isArray(r?.data)?r.data:[]}
async function createDetainee(input){if(!cloud())return null;return adapter().create('detainees',input)}
async function updateDetainee(id,input){if(!cloud())return null;return adapter().update('detainees',id,input)}
async function archiveDetainee(id){if(!cloud())return null;return adapter().update('detainees',id,{status:'NONAKTIF'})}
window.MTADeteniSharedDomain=Object.freeze({cloud,listDetainees,createDetainee,updateDetainee,archiveDetainee});
})();