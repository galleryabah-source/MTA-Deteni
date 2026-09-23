(function(){
  'use strict';
  function el(tag,props,text){
    const x=document.createElement(tag);
    Object.entries(props||{}).forEach(([k,v])=>x[k]=v);
    if(text!==undefined)x.textContent=text;
    return x;
  }
  function render(){
    const host=document.querySelector('.topright');
    if(!host||document.getElementById('mtaAuthUi'))return;
    const box=el('span',{id:'mtaAuthUi',style:'display:inline-flex;gap:5px;align-items:center'});
    const state=el('span',{id:'mtaAuthUiState',className:'pill'},'Guest');
    const login=el('button',{className:'btn small'},'Login');
    const logout=el('button',{className:'btn small'},'Logout');
    logout.style.display='none';
    box.append(state,login,logout);
    host.prepend(box);
    login.onclick=()=>show();
    logout.onclick=async()=>{await window.mtaAuth.signOut();};
    window.addEventListener('mta-auth-state',update);
  }
  function show(){
    if(typeof openModal!=='function')return;
    const wrap=document.createElement('div');
    const title=el('h2',{},'Masuk ke MTA DETENI');
    const head=el('div',{className:'dialoghead'}); head.append(title);
    const close=el('button',{className:'x'},'×'); close.onclick=()=>closeModal(); head.append(close);
    const notice=el('div',{className:'notice'},'Tidak ada pendaftaran mandiri. Akun pengguna hanya dapat dibuat oleh Administrator. Gunakan akun yang telah diberikan Administrator.');
    const grid=el('div',{className:'formgrid',style:'margin-top:12px'});
    const email=el('input',{type:'email',autocomplete:'email'});
    const pass=el('input',{type:'password',autocomplete:'current-password'});
    const ef=el('div',{className:'field'}); ef.append(el('label',{},'Email'),email);
    const pf=el('div',{className:'field'}); pf.append(el('label',{},'Password'),pass);
    grid.append(ef,pf);
    const actions=el('div',{className:'actions'});
    const cancel=el('button',{className:'btn'},'Batal'); cancel.onclick=()=>closeModal();
    const go=el('button',{className:'btn primary'},'Masuk');
    go.onclick=async()=>{
      try{
        const r=await window.mtaAuth.signIn(email.value.trim(),pass.value);
        if(r.error)throw r.error;
        closeModal();
        toast('Login berhasil.');
      }catch(e){toast(e.message||'Auth gagal');}
    };
    actions.append(cancel,go);
    wrap.append(head,notice,grid,actions);
    openModal(wrap.outerHTML);
  }
  async function update(event){
    const state=document.getElementById('mtaAuthUiState');
    if(!state)return;
    const box=document.getElementById('mtaAuthUi');
    const buttons=box.querySelectorAll('button');
    if(event.detail.authenticated){
      try{
        const me=await window.mtaProductionApi.get('me');
        state.textContent=me.role||'AUTH';
      }catch(_){state.textContent='AUTH';}
      buttons[0].style.display='none'; buttons[1].style.display='inline-flex';
    }else{
      state.textContent='Guest';
      buttons[0].style.display='inline-flex'; buttons[1].style.display='none';
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();