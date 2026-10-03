(()=>{
'use strict';
if(window.MTADeteniIdentityResolutionUIV1)return;

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=v=>String(v??'').trim();

function mount({form,existing=false}={}){
  if(!form||existing)return null;
  if(form.querySelector('[data-identity-resolution]'))return null;

  const panel=document.createElement('div');
  panel.className='field full';
  panel.setAttribute('data-identity-resolution','v2');
  panel.style.display='none';
  panel.innerHTML=`
    <div class="mta-identity-resolution">
      <div class="mta-ir-head">
        <div>
          <span class="mta-ir-kicker">IDENTITY INTEGRITY GATE</span>
          <strong>Identitas serupa ditemukan</strong>
          <small>Sistem memeriksa identitas pada saat <b>Simpan</b>. Pembuatan Deteni baru dihentikan sampai operator memastikan kandidat bukan orang yang sama.</small>
        </div>
        <span class="mta-ir-badge">SAVE GATE</span>
      </div>
      <div class="mta-ir-message" data-ir-message role="status" aria-live="polite"></div>
      <div class="mta-ir-results" data-ir-results></div>
      <input type="hidden" name="identityDecision" data-ir-decision value="">
    </div>`;
  const anchor=form.querySelector('[name="passportNumber"]')?.closest('.field')||form.querySelector('[name="nationality"]')?.closest('.field')||form.querySelector('.field.full');
  anchor?.after(panel);

  const message=panel.querySelector('[data-ir-message]');
  const results=panel.querySelector('[data-ir-results]');
  const decision=panel.querySelector('[data-ir-decision]');
  const submit=form.querySelector('button[type="submit"]');

  const setMessage=(value,type='')=>{
    message.textContent=value;
    message.className='mta-ir-message'+(type?' '+type:'');
  };

  const clear=()=>{
    decision.value='';
    results.innerHTML='';
    panel.style.display='none';
    if(submit)submit.disabled=false;
    setMessage('');
  };

  const present=(result)=>{
    const ir=result?.identityResolution;
    if(!ir||ir.status!=='CANDIDATES_FOUND'){
      clear();
      return;
    }
    decision.value='';
    if(submit)submit.disabled=false;
    panel.style.display='';
    setMessage('Kandidat ditemukan. Pilih "Bukan Orang Ini" hanya setelah pemeriksaan operator.','warn');
    results.innerHTML=(ir.candidates||[]).map((c,i)=>`
      <article class="mta-ir-candidate" data-ir-candidate>
        <div class="mta-ir-candidate-title">
          <strong>${esc(c.nid||'NID belum tersedia')}</strong>
          <span class="mta-ir-confidence">${esc(c.confidence||'REVIEW')}</span>
        </div>
        <div class="mta-ir-grid">
          <span><small>Nama</small><b>${esc(c.name||'—')}</b></span>
          <span><small>Tanggal Lahir</small><b>${esc(c.dateOfBirth||'—')}</b></span>
          <span><small>No Paspor</small><b>${esc(c.passportNumber||'—')}</b></span>
          <span><small>Kebangsaan</small><b>${esc(c.nationality||'—')}</b></span>
          <span><small>Status</small><b>${esc(c.status||'—')}</b></span>
          <span><small>Evidence</small><b>${esc((c.matchBasis||[]).join(' · ')||'—')}</b></span>
        </div>
        <div class="mta-ir-candidate-actions">
          <button type="button" class="btn small" data-ir-history data-id="${esc(c.detaineeId)}">Lihat Data</button>
          <button type="button" class="btn small primary" data-ir-select>Gunakan NID Ini</button>
          <button type="button" class="btn small" data-ir-reject>Bukan Orang Ini</button>
        </div>
      </article>`).join('');

    results.querySelectorAll('[data-ir-history]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const id=btn.getAttribute('data-id');
        if(typeof window.show==='function'){closeModal();window.show('detainee-detail',id);}
      });
    });
    results.querySelectorAll('[data-ir-select]').forEach((btn,i)=>{
      btn.addEventListener('click',()=>{
        decision.value='';
        if(submit)submit.disabled=true;
        results.querySelectorAll('[data-ir-candidate]').forEach(el=>el.classList.remove('is-selected'));
        btn.closest('[data-ir-candidate]')?.classList.add('is-selected');
        setMessage('Identitas existing dipilih. Simpan sebagai Deteni baru tetap diblokir. Gunakan data existing tersebut.','error');
      });
    });
    results.querySelectorAll('[data-ir-reject]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        decision.value='NOT_SAME_PERSON';
        if(submit)submit.disabled=false;
        results.querySelectorAll('[data-ir-candidate]').forEach(el=>el.classList.remove('is-selected'));
        btn.closest('[data-ir-candidate]')?.classList.add('is-selected');
        setMessage('Operator menyatakan kandidat bukan orang ini. Tekan Simpan kembali untuk menjalankan gate server dengan keputusan tersebut.','selected');
      });
    });
  };

  return Object.freeze({present,clear,getDecision:()=>text(decision.value)});
}

window.MTADeteniIdentityResolutionUIV1=Object.freeze({mount});
})();