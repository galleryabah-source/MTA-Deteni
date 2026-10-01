(()=>{'use strict';
function reconcileLegacyPlacementProjection(state){
  if(!state||!Array.isArray(state.detainees)||!Array.isArray(state.rooms)||!Array.isArray(state.placements))return state;
  const norm=v=>String(v??'').trim().toLowerCase().replace(/\s+/g,' ');
  const existing=new Set(state.placements.map(p=>String(p?.detaineeId||'')));
  const additions=[];
  for(const d of state.detainees){
    if(d?.status!=='AKTIF'||!d?.placement||existing.has(String(d.id)))continue;
    const raw=String(d.placement).trim(), separator=raw.lastIndexOf('/');
    if(separator<=0||separator>=raw.length-1)continue;
    const blockName=norm(raw.slice(0,separator)), roomName=norm(raw.slice(separator+1));
    const room=state.rooms.find(r=>norm(r?.room)===roomName&&norm(r?.block)===blockName)
      ||state.rooms.find(r=>norm(r?.room)===roomName&&(!r?.block||!blockName));
    if(!room)continue;
    additions.push({
      id:'LEGACY-PLACEMENT-'+String(d.id),detaineeId:d.id,blockId:room.blockId||null,roomId:room.id,
      block:room.block||raw.slice(0,separator).trim(),room:room.room||raw.slice(separator+1).trim(),
      since:d.updatedAt||d.createdAt||new Date().toISOString(),until:null,movementId:null,
      correlationId:d.correlationId||null,requestKey:null,
      metadata:{legacyProjection:true,sourceField:'mta_detainees.placement',sourceValue:raw},
      createdAt:d.createdAt||null,source:'PRODUCTION_DB_LEGACY_PLACEMENT'
    });
  }
  if(!additions.length)return state;
  return {...state,placements:[...state.placements,...additions],legacyPlacementProjectionCount:(Number(state.legacyPlacementProjectionCount)||0)+additions.length};
}
window.MTALegacyPlacementProjection={reconcile:reconcileLegacyPlacementProjection};
})();