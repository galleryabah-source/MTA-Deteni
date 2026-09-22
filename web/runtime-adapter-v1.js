(()=>{'use strict';
const MODE_KEY='mta-deteni-runtime-mode';
const MODES=Object.freeze({LOCAL:'LOCAL',CLOUD:'CLOUD',LAN:'LAN'});
function getMode(){const v=String(localStorage.getItem(MODE_KEY)||'LOCAL').toUpperCase();return MODES[v]||MODES.LOCAL}
function setMode(mode){if(!MODES[mode])throw new Error('Unsupported runtime mode: '+mode);localStorage.setItem(MODE_KEY,mode);window.dispatchEvent(new CustomEvent('mta:runtime-mode',{detail:{mode}}));return mode}
async function session(){if(!window.mtaAuth?.session)return null;const r=await window.mtaAuth.session();return r?.data?.session||null}
async function api(){const s=await session();if(!s)throw Object.assign(new Error('AUTH_REQUIRED'),{code:'AUTH_REQUIRED',status:401});if(!window.mtaProductionApi)throw new Error('PRODUCTION_API_UNAVAILABLE');return window.mtaProductionApi}
async function request(method,resource,id,body){if(getMode()!=='CLOUD')return null;const a=await api();return method==='GET'?(id?a.get(resource,id):a.list(resource)):method==='POST'?a.create(resource,body):method==='PATCH'?a.update(resource,id,body):a.remove(resource,id)}
window.MTADeteniRuntimeAdapter=Object.freeze({MODES,getMode,setMode,session,list:(r)=>request('GET',r),get:(r,id)=>request('GET',r,id),create:(r,b)=>request('POST',r,null,b),update:(r,id,b)=>request('PATCH',r,id,b),remove:(r,id)=>request('DELETE',r,id)});
})();