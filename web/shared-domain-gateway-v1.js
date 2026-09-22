(()=>{'use strict';
function adapter(){if(!window.MTADeteniRuntimeAdapter)throw new Error('RUNTIME_ADAPTER_UNAVAILABLE');return window.MTADeteniRuntimeAdapter}
function cloud(){return adapter().getMode()==='CLOUD'}
function requireCloud(){if(!cloud())throw Object.assign(new Error('CLOUD_RUNTIME_REQUIRED'),{code:'CLOUD_RUNTIME_REQUIRED',status:409})}
async function list(resource){requireCloud();const r=await adapter().list(resource);return Array.isArray(r?.data)?r.data:[]}
async function get(resource,id){requireCloud();return adapter().get(resource,id)}
async function create(resource,input){requireCloud();return adapter().create(resource,input)}
async function update(resource,id,input){requireCloud();return adapter().update(resource,id,input)}
async function remove(resource,id){requireCloud();return adapter().remove(resource,id)}
async function listDetainees(){return list('detainees')}
async function listScopes(){return list('scopes')}
async function listPlacements(){return list('placements')}
async function listMovements(){return list('movements')}
async function listLeaves(){return list('leaves')}
async function listDocuments(){return list('documents')}
async function listAuditEvents(){return list('audit-events')}
async function createDetainee(input){const scopeId=input?.scope_id;if(!scopeId)throw Object.assign(new Error('ACTIVE_SCOPE_REQUIRED'),{code:'ACTIVE_SCOPE_REQUIRED',status:400});return create('detainees',input)}
async function updateDetainee(id,input){return update('detainees',id,input)}
async function archiveDetainee(id){return updateDetainee(id,{status:'NONAKTIF'})}
window.MTADeteniSharedDomain=Object.freeze({cloud,list,get,create,update,remove,listDetainees,listScopes,listPlacements,listMovements,listLeaves,listDocuments,listAuditEvents,createDetainee,updateDetainee,archiveDetainee});
})();