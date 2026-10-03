(()=>{
'use strict';
if(window.MTADeteniIdentityResolutionV1)return;

const text=v=>String(v??'').trim();
const norm=v=>text(v).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const normCompact=v=>norm(v).replace(/\s+/g,'');
const normPassport=v=>text(v).toUpperCase().replace(/[^A-Z0-9]/g,'');
const normName=v=>norm(v).replace(/\s+/g,' ');
const exact=(a,b)=>!!norm(a)&&norm(a)===norm(b);
function levenshtein(a,b){
  const aa=String(a||''),bb=String(b||'');
  if(aa===bb)return 0;
  if(!aa)return bb.length;
  if(!bb)return aa.length;
  let prev=Array.from({length:bb.length+1},(_,i)=>i);
  for(let i=1;i<=aa.length;i++){
    const cur=[i];
    for(let j=1;j<=bb.length;j++){
      cur[j]=Math.min(
        cur[j-1]+1,
        prev[j]+1,
        prev[j-1]+(aa[i-1]===bb[j-1]?0:1)
      );
    }
    prev=cur;
  }
  return prev[bb.length];
}
function nearName(a,b){
  const aa=normName(a),bb=normName(b);
  if(!aa||!bb||aa===bb)return false;
  const minLength=Math.min(aa.length,bb.length);
  if(minLength<8)return false;
  const maxDistance=Math.max(1,Math.floor(minLength*0.06));
  return levenshtein(aa,bb)<=maxDistance;
}

function evidence(query,d){
  const qName=normName(query.name), dName=normName(d.name);
  const qDob=norm(query.dateOfBirth), dDob=norm(d.dateOfBirth);
  const qPassport=normPassport(query.passportNumber), dPassport=normPassport(d.passportNumber);
  const qNationality=normCompact(query.nationality), dNationality=normCompact(d.nationality);
  const basis=[];
  if(qPassport&&dPassport&&qPassport===dPassport)basis.push('PASSPORT_EXACT');
  if(qDob&&dDob&&qDob===dDob)basis.push('DATE_OF_BIRTH_EXACT');
  if(qName&&dName&&qName===dName)basis.push('NAME_EXACT');
  else if(qName&&dName&&nearName(qName,dName))basis.push('NAME_NEAR');
  if(qNationality&&dNationality&&qNationality===dNationality)basis.push('NATIONALITY_EXACT');
  return basis;
}

function confidence(basis){
  const has=b=>basis.includes(b);
  if(has('PASSPORT_EXACT')&&has('DATE_OF_BIRTH_EXACT'))return 'STRONG';
  if(has('PASSPORT_EXACT')&&has('NAME_EXACT')&&has('NATIONALITY_EXACT'))return 'STRONG';
  if(has('NAME_EXACT')&&has('DATE_OF_BIRTH_EXACT')&&has('NATIONALITY_EXACT'))return 'PROBABLE';
  if(has('NAME_EXACT')&&(has('DATE_OF_BIRTH_EXACT')||has('PASSPORT_EXACT')||has('NATIONALITY_EXACT')))return 'POSSIBLE';
  if(has('NAME_EXACT'))return 'NAME_ONLY';
  if(has('NAME_NEAR')&&(has('DATE_OF_BIRTH_EXACT')||has('PASSPORT_EXACT')||has('NATIONALITY_EXACT')))return 'POSSIBLE';
  if(has('NAME_NEAR'))return 'NAME_ONLY';
  return null;
}

const rank={STRONG:4,PROBABLE:3,POSSIBLE:2,NAME_ONLY:1};

function resolve(state,query={}){
  const q={
    name:text(query.name),
    dateOfBirth:text(query.dateOfBirth),
    passportNumber:text(query.passportNumber),
    nationality:text(query.nationality)
  };
  const detainees=Array.isArray(state?.detainees)?state.detainees:[];
  const candidates=detainees.map(d=>{
    const matchBasis=evidence(q,d);
    const c=confidence(matchBasis);
    if(!c)return null;
    return {
      detaineeId:text(d.id),
      nid:text(d.nid),
      name:text(d.name),
      dateOfBirth:text(d.dateOfBirth),
      passportNumber:text(d.passportNumber),
      nationality:text(d.nationality),
      status:text(d.status),
      confidence:c,
      matchBasis
    };
  }).filter(Boolean).sort((a,b)=>{ const byConfidence=rank[b.confidence]-rank[a.confidence]; return byConfidence||a.name.localeCompare(b.name,'id'); });

  return {
    ok:true,
    status:candidates.length?'CANDIDATES_FOUND':'NO_MATCH',
    query:q,
    candidates,
    requiresHumanConfirmation:candidates.length>0,
    autoLinked:false
  };
}

function canCreateNewPerson(result){
  return !!result&&result.status==='NO_MATCH'&&result.autoLinked===false;
}

window.MTADeteniIdentityResolutionV1=Object.freeze({resolve,canCreateNewPerson,normalize:{name:normName,passport:normPassport,nationality:normCompact}});
})();
