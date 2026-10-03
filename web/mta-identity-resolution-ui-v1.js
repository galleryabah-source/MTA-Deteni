(()=>{
'use strict';
if(window.MTADeteniIdentityResolutionUIV1)return;

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=v=>String(v??'').trim();

function mount({form,existing=false,db}={}){
  if(!form||existing||!window.MTADeteniIdentityResolutionV1)return;
  if(form.querySelector('[data-identity-resolution]'))return;

  const panel=document.createElement('div');
  panel.className='field full';
  panel.setAttribute('data-identity-resolution','v1');
  panel.innerHTML=`
    <div class="mta-identity-resolution">
      <div class="mta-ir-head">
        <div>
          <span class="mta-ir-kicker">IDENTITY RESOLUTION</span>
          <strong>Cari Riwayat Deteni</strong>
          <small>Pastikan kedatangan ini belum memiliki NID sebelum membuat identitas baru.</small>
        </div>
        <span class="mta-ir-badge">READ ONLY</span>
      </div>
      <div class="mta-ir-actions">
        <button type="button" class="btn primary" data-ir-search>Cari Riwayat Deteni</button>
        <button type="button" class="btn" data-ir-clear>Reset</button>
      </div>
      <div class="mta-ir-message" data-ir-message role="status" aria-live="polite"></div>
      <div class="mta-ir-results" data-ir-results></div>
      <input type="hidden" name="resolvedNid" data-ir-selected-nid value="">
    </div>`;

  const passportField=form.querySelector('[name="passportNumber"]')?.closest('.field');
  const nationalityField=form.querySelector('[name="nationality"]')?.closest('.field');
  (passportField||nationalityField||form.querySelector('.field.full'))?.after(panel);

  const message=panel.querySelector('[data-ir-message]');
  const results=panel.querySelector('[data-ir-results]');
  const selected=panel.querySelector('[data-ir-selected-nid]');
  const submit=form.querySelector('button[type="submit"]');

  function setMessage(value,type=''){
    message.textContent=value;
    message.className='mta-ir-message'+(type?' '+type:'');
  }

  function clearSelection(){
    selected.value='';
    if(submit)submit.disabled=false;
    panel.querySelectorAll('[data-ir-selected]').forEach(el=>el.removeAttribute('data-ir-selected'));
  }

  function selectCandidate(candidate,button){
    selected.value=candidate.nid;
    panel.querySelectorAll('[data-ir-candidate]').forEach(el=>el.classList.remove('is-selected'));
    button.closest('[data-ir-candidate]')?.classList.add('is-selected');
    if(submit)submit.disabled=true;
    setMessage('NID '+candidate.nid+' dipilih. Pembuatan Episode belum diaktifkan pada boundary V1; tidak ada Deteni baru yang akan dibuat.','selected');
  }

  function render(resultsData){
    results.innerHTML='';
    if(resultsData.status==='NO_MATCH'){
      setMessage('Tidak ditemukan kandidat pada data Deteni yang tersedia. Jalur ini dapat dilanjutkan sebagai Deteni baru.','ok');
      results.innerHTML='<div class="mta-ir-empty"><strong>Tidak ada kandidat</strong><span>Identitas baru tetap menggunakan generator NID canonical saat disimpan.</span></div>';
      return;
    }
    setMessage('Kandidat ditemukan. Konfirmasi manusia diperlukan sebelum identitas dapat digunakan kembali.','warn');
    results.innerHTML=resultsData.candidates.map((c,i)=>`
      <article class="mta-ir-candidate" data-ir-candidate>
        <div class="mta-ir-candidate-main">
          <div class="mta-ir-candidate-title">
            <strong>${esc(c.nid||'NID belum tersedia')}</strong>
            <span class="mta-ir-confidence">${esc(c.confidence)}</span>
          </div>
          <div class="mta-ir-grid">
            <span><small>Nama</small><b>${esc(c.name||'—')}</b></span>
            <span><small>Tanggal Lahir</small><b>${esc(c.dateOfBirth||'—')}</b></span>
            <span><small>No Paspor</small><b>${esc(c.passportNumber||'—')}</b></span>
            <span><small>Kebangsaan</small><b>${esc(c.nationality||'—')}</b></span>
            <span><small>Status</small><b>${esc(c.status||'—')}</b></span>
            <span><small>Evidence</small><b>${esc(c.matchBasis.join(' · ')||'—')}</b></span>
          </div>
        </div>
        <div class="mta-ir-candidate-actions">
          <button type="button" class="btn small" data-ir-history data-id="${esc(c.detaineeId)}">Lihat Riwayat</button>
          <button type="button" class="btn small primary" data-ir-select>Pilih NID Ini</button>
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
      btn.addEventListener('click',()=>selectCandidate(resultsData.candidates[i],btn));
    });
    results.querySelectorAll('[data-ir-reject]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        btn.closest('[data-ir-candidate]')?.remove();
        setMessage('Kandidat ditandai bukan orang ini. Kandidat lain tetap dapat ditinjau.','ok');
      });
    });
  }

  panel.querySelector('[data-ir-search]').addEventListener('click',()=>{
    const query={
      name:text(form.querySelector('[name="name"]')?.value),
      dateOfBirth:text(form.querySelector('[name="dateOfBirth"]')?.value),
      passportNumber:text(form.querySelector('[name="passportNumber"]')?.value),
      nationality:text(form.querySelector('[name="nationality"]')?.value)
    };
    if(!query.name&&!query.dateOfBirth&&!query.passportNumber&&!query.nationality){
      setMessage('Isi minimal satu atribut identitas untuk melakukan pencarian.','error');
      return;
    }
    clearSelection();
    const result=window.MTADeteniIdentityResolutionV1.resolve(db||{},query);
    render(result);
  });

  panel.querySelector('[data-ir-clear]').addEventListener('click',()=>{
    clearSelection();
    results.innerHTML='';
    setMessage('');
  });

  form.addEventListener('submit',e=>{
    if(selected.value){
      e.preventDefault();
      setMessage('NID existing telah dipilih. Simpan sebagai Deteni baru diblokir sampai Episode Domain tersedia.','error');
    }
  },true);
}

window.MTADeteniIdentityResolutionUIV1=Object.freeze({mount});
})();
