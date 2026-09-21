/**
 * MTA DETENI — D5.7 Regu/Shift Download & Revision History
 * Synthetic-only, local runtime contract. No production DB/storage access.
 */
(function(global){
  'use strict';

  const STATUS_ORDER = Object.freeze({
    DRAFT:0, VALIDATED:1, GENERATED:2, IN_REVIEW:3,
    CHANGES_REQUESTED:4, APPROVED:5, FINAL:6
  });

  function norm(v){ return String(v ?? '').trim().toLowerCase(); }

  function filterReports(reports, filters={}){
    const list=Array.isArray(reports)?reports:[];
    const date=String(filters.date||'').trim();
    const regu=norm(filters.regu);
    const shift=norm(filters.shift);
    return list.filter(r=>{
      if(date && String(r.reportDate||r.date||'')!==date) return false;
      if(regu && norm(r.reguId||r.regu)!==regu) return false;
      if(shift && norm(r.shiftId||r.shift)!==shift) return false;
      return true;
    }).sort((a,b)=>{
      const ad=String(a.reportDate||a.date||''), bd=String(b.reportDate||b.date||'');
      if(ad!==bd) return bd.localeCompare(ad);
      const ar=Number(a.revision||1), br=Number(b.revision||1);
      if(ar!==br) return br-ar;
      return String(b.createdAt||'').localeCompare(String(a.createdAt||''));
    });
  }

  function rootRevisionId(r){
    return r.revisionOf ? rootRevisionId(r.revisionOfRecord||r._revisionSource||{}) : (r.documentId||r.id);
  }

  function buildRevisionHistory(reports, id){
    const all=Array.isArray(reports)?reports:[];
    const target=all.find(r=>(r.documentId||r.id)===id);
    if(!target) return [];
    const rootId=target.revisionOf||target.documentId||target.id;
    const chain=[];
    let currentRoot=rootId;
    const byId=new Map(all.map(r=>[r.documentId||r.id,r]));
    if(!target.revisionOf) currentRoot=target.documentId||target.id;
    for(const r of all){
      const rid=r.documentId||r.id;
      if(rid===currentRoot || r.revisionOf===currentRoot) chain.push(r);
    }
    const expanded=new Set(chain.map(r=>r.documentId||r.id));
    let changed=true;
    while(changed){
      changed=false;
      for(const r of all){
        const rid=r.documentId||r.id;
        if(expanded.has(rid)) continue;
        if(r.revisionOf && expanded.has(r.revisionOf)){
          chain.push(r); expanded.add(rid); changed=true;
        }
      }
    }
    return chain.sort((a,b)=>Number(a.revision||1)-Number(b.revision||1));
  }

  function latestRevisionMap(reports){
    const map=new Map();
    for(const r of (Array.isArray(reports)?reports:[])){
      const root=r.revisionOf ? r.revisionOf : (r.documentId||r.id);
      const prev=map.get(root);
      if(!prev || Number(r.revision||1)>Number(prev.revision||1)) map.set(root,r);
    }
    return map;
  }

  function createBulkManifest(reports, ids, filters={}){
    const selected=new Set((Array.isArray(ids)?ids:[]).map(String));
    const candidates=filterReports(reports,filters).filter(r=>selected.has(String(r.documentId||r.id)));
    if(!candidates.length) throw new Error('BULK_SELECTION_EMPTY');
    if(candidates.some(r=>r.status!=='FINAL')) throw new Error('BULK_FINAL_ONLY');
    const items=candidates.map(r=>({
      documentId:r.documentId||r.id,
      filename:r.filename||null,
      reportDate:r.reportDate||r.date||null,
      reguId:r.reguId||r.regu||null,
      shiftId:r.shiftId||r.shift||null,
      revision:Number(r.revision||1),
      status:r.status,
      integrityHash:r.integrityHash||null
    })).sort((a,b)=>a.filename?.localeCompare(b.filename||'')||a.documentId.localeCompare(b.documentId));
    return {
      contract:'D5.7-BULK-DOWNLOAD-MANIFEST-v1',
      generatedAt:null,
      filters:{date:filters.date||'',regu:filters.regu||'',shift:filters.shift||''},
      count:items.length,
      items
    };
  }

  global.mtaDailyGuardD57=Object.freeze({
    STATUS_ORDER, filterReports, buildRevisionHistory, latestRevisionMap, createBulkManifest
  });
})(window);
