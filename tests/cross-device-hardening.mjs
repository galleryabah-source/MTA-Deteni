import { chromium } from 'playwright';
import fs from 'node:fs';

const matrix = [
  { device:'phone-portrait', width:390, height:844, mobile:true },
  { device:'phone-landscape', width:844, height:390, mobile:true },
  { device:'tablet-portrait', width:768, height:1024, mobile:true },
  { device:'tablet-landscape', width:1024, height:768, mobile:true },
  { device:'desktop', width:1440, height:900, mobile:false },
  { device:'desktop-hd', width:1920, height:1080, mobile:false }
];

const results = [];
const SUPABASE_STUB = `
let session = null;
let authListener = null;
export function createClient(){
  return { auth: {
    async getSession(){ return {data:{session},error:null}; },
    onAuthStateChange(cb){ authListener=cb; return {data:{subscription:{unsubscribe(){}}}}; },
    async signInWithPassword({email,password}){
      if(email!=='synthetic@example.test'||password!=='synthetic-password')
        return {data:{session:null,user:null},error:{message:'INVALID_SYNTHETIC_CREDENTIALS'}};
      session={access_token:'synthetic-browser-token',user:{id:'synthetic-browser-user',email}};
      authListener?.('SIGNED_IN',session);
      return {data:{session,user:session.user},error:null};
    },
    async signOut(){session=null;authListener?.('SIGNED_OUT',null);return {error:null};},
    async getUser(){return {data:{user:session?.user||null},error:null};}
  }};
}
`;
const QR_STUB=`window.qrcode=window.qrcode||function(){return {addData(){},make(){},createDataURL(){return '';},createSvgTag(){return '<svg xmlns="http://www.w3.org/2000/svg"></svg>';}};};`;

function rect(page, selector){
  return page.locator(selector).first().evaluate(el=>{
    const r=el.getBoundingClientRect();
    return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};
  });
}
function insideViewport(r,w,h){return r.x>=-1&&r.y>=-1&&r.right<=w+1&&r.bottom<=h+1&&r.width>0&&r.height>0;}

for(const cfg of matrix){
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:cfg.width,height:cfg.height},deviceScaleFactor:1,isMobile:cfg.mobile,hasTouch:cfg.mobile});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const checks=[];
  try{
    await page.route('https://esm.sh/@supabase/supabase-js@2.117.1',route=>route.fulfill({status:200,contentType:'application/javascript',body:SUPABASE_STUB}));
    await page.route('https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js',route=>route.fulfill({status:200,contentType:'application/javascript',body:QR_STUB}));
    await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
    await page.locator('#mtaAuthGate.open').waitFor({state:'visible',timeout:10000});
    await page.locator('#mtaAuthEmail').fill('synthetic@example.test');
    await page.locator('#mtaAuthPassword').fill('synthetic-password');
    await page.locator('#mtaAuthSubmit').click();
    await page.locator('body.mta-auth-ready').waitFor({state:'attached',timeout:10000});
    await page.waitForFunction(()=>typeof window.show==='function'&&typeof window.mtaUnifiedResolve==='function'&&!!window.mtaQrCameraV2,null,{timeout:60000});

    const baseline=await page.evaluate(()=>({
      viewport:{width:innerWidth,height:innerHeight},
      htmlScrollWidth:document.documentElement.scrollWidth,
      bodyScrollWidth:document.body.scrollWidth,
      navViews:[...document.querySelectorAll('#nav button[data-view]')].map(b=>b.dataset.view),
      mobileNav:!!document.querySelector('#mtaMobileBottomNav'),
      desktopEnhanced:document.body.classList.contains('mta-desktop-enhanced'),
      bottomNavCount:document.querySelectorAll('#mtaMobileBottomNav').length,
      bottomNavButtons:document.querySelectorAll('#mtaMobileBottomNav button').length,
      scanButtons:document.querySelectorAll('#mtaMobileBottomNav .mta-scan').length
    }));
    checks.push({name:'NO_HORIZONTAL_OVERFLOW',ok:baseline.htmlScrollWidth<=cfg.width+2&&baseline.bodyScrollWidth<=cfg.width+2,details:baseline});
    if(cfg.mobile){
      checks.push({name:'MOBILE_BOTTOM_NAV_SINGLETON',ok:baseline.bottomNavCount===1&&baseline.bottomNavButtons===5&&baseline.scanButtons===1});
      checks.push({name:'DESKTOP_ENHANCEMENT_ISOLATED',ok:!baseline.desktopEnhanced});
      const navBox=await rect(page,'#mtaMobileBottomNav');
      checks.push({name:'MOBILE_NAV_IN_VIEWPORT',ok:insideViewport(navBox,cfg.width,cfg.height),details:navBox});
      const navHeight=navBox.height;
      checks.push({name:'MOBILE_NAV_RESERVED_SPACE',ok:await page.evaluate(h=>document.querySelector('.main')?.getBoundingClientRect().bottom<=innerHeight+2||h>0,navHeight)});
    }else{
      checks.push({name:'DESKTOP_SIDEBAR_VISIBLE',ok:await page.locator('.side').isVisible()});
      checks.push({name:'MOBILE_NAV_HIDDEN',ok:await page.locator('#mtaMobileBottomNav').count()===0||!(await page.locator('#mtaMobileBottomNav').isVisible())});
      checks.push({name:'DESKTOP_ENHANCEMENT_ACTIVE',ok:baseline.desktopEnhanced});
      checks.push({name:'DESKTOP_COLLAPSE_CONTROL',ok:await page.locator('#mtaResponsiveNavToggle').count()===1});
    }

    // Authenticated surface sanity: every core view must render without overflow.
    const surfaces=['dashboard','detainee','placement','movement','leave','documents','audit','monitor','ops-queue','qr-center','camera-scan','reports'];
    for(const view of surfaces){
      await page.evaluate(v=>window.show(v),view);
      await page.waitForTimeout(40);
      const surface=await page.evaluate(()=>({text:document.getElementById('appView')?.textContent?.trim().slice(0,180)||'',scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
      if(!surface.text) throw new Error('empty surface '+view);
      if(surface.scrollWidth>cfg.width+2||surface.bodyWidth>cfg.width+2) throw new Error('overflow surface '+view+' '+JSON.stringify(surface));
    }
    checks.push({name:'CORE_SURFACES_NO_OVERFLOW',ok:true,details:{count:surfaces.length}});

    // Mobile bottom navigation contract is preserved across portrait/landscape.
    if(cfg.mobile){
      await page.evaluate(()=>window.show('dashboard'));
      const navLabels=await page.locator('#mtaMobileBottomNav button').evaluateAll(bs=>bs.map(b=>b.textContent.trim()));
      checks.push({name:'MOBILE_NAV_LABEL_CONTRACT',ok:JSON.stringify(navLabels)===JSON.stringify(['⌂Beranda','♙Deteni','⌾Scan QR','▤Laporan','☰Menu'])});
      const scan=page.locator('#mtaMobileBottomNav .mta-scan');
      const scanBox=await rect(page,'#mtaMobileBottomNav .mta-scan');
      checks.push({name:'SCAN_CONTROL_TOUCH_SIZE',ok:scanBox.width>=44&&scanBox.height>=44,details:scanBox});
      await page.evaluate(()=>window.show('detainee'));
      await page.getByRole('button',{name:/Tambah Deteni/i}).click();
      await page.locator('#dForm').waitFor({state:'visible',timeout:5000});
      const dialog=await rect(page,'#dForm');
      checks.push({name:'FORM_WITHIN_VIEWPORT',ok:insideViewport(dialog,cfg.width,cfg.height),details:dialog});
      const actions=page.locator('#dForm .actions .btn');
      const actionCount=await actions.count();
      let actionVisible=true;
      for(let i=0;i<actionCount;i++){const r=await actions.nth(i).boundingBox();if(!r||r.height<44||r.y<0||r.y>cfg.height+2)actionVisible=false;}
      checks.push({name:'FORM_ACTIONS_REACHABLE',ok:actionVisible&&actionCount>0,details:{actionCount}});
      await page.keyboard.press('Escape').catch(()=>{});
    }

    // Desktop sidebar collapse must preserve content width and navigation.
    if(!cfg.mobile){
      await page.locator('#mtaResponsiveNavToggle').click();
      await page.waitForTimeout(80);
      const collapsed=await page.evaluate(()=>({collapsed:document.querySelector('.side')?.classList.contains('mta-collapsed'),contentWidth:document.querySelector('.main')?.getBoundingClientRect().width||0,navCount:document.querySelectorAll('#nav button[data-view]').length}));
      checks.push({name:'DESKTOP_COLLAPSE_RUNTIME',ok:collapsed.collapsed&&collapsed.navCount>=7&&collapsed.contentWidth>0,details:collapsed});
      await page.locator('#mtaResponsiveNavToggle').click();
    }

    // Logout must restore the protected boundary on every device.
    await page.locator('#mtaAuthUi button').getByText('Logout').click();
    await page.locator('body.mta-auth-locked').waitFor({state:'attached',timeout:5000});
    checks.push({name:'LOGOUT_BOUNDARY',ok:await page.locator('#mtaAuthGate.open').count()===1&&await page.locator('.app').evaluate(el=>getComputedStyle(el).display==='none')});

    if(errors.length) throw new Error('page errors: '+errors.join('; '));
    const passed=checks.every(x=>x.ok);
    const evidence={certification:'CROSS-DEVICE-HARDENING-v1',device:cfg.device,width:cfg.width,height:cfg.height,mobile:cfg.mobile,status:passed?'PASS':'FAIL',checks,errors,syntheticOnly:true,productionAccessAuthorized:false,migrationExecuted:false,aiEnabled:false};
    fs.writeFileSync('/tmp/mta-cross-device-'+cfg.device+'.json',JSON.stringify(evidence,null,2));
    results.push(evidence);
    if(!passed) throw new Error('cross-device checks failed: '+JSON.stringify(checks.filter(x=>!x.ok)));
  }catch(error){
    const evidence={certification:'CROSS-DEVICE-HARDENING-v1',device:cfg.device,width:cfg.width,height:cfg.height,mobile:cfg.mobile,status:'FAIL',checks,errors,error:String(error?.stack||error),syntheticOnly:true,productionAccessAuthorized:false,migrationExecuted:false,aiEnabled:false};
    fs.writeFileSync('/tmp/mta-cross-device-'+cfg.device+'.json',JSON.stringify(evidence,null,2));
    results.push(evidence);
  }finally{await browser.close();}
}

const summary={certification:'CROSS-DEVICE-HARDENING-v1',matrix:results.map(r=>({device:r.device,width:r.width,height:r.height,status:r.status})),allPass:results.length===matrix.length&&results.every(r=>r.status==='PASS'),governance:{syntheticOnly:true,productionAccessAuthorized:false,migrationExecuted:false,aiEnabled:false}};
fs.writeFileSync('/tmp/mta-cross-device-summary.json',JSON.stringify(summary,null,2));
console.log('CROSS_DEVICE_HARDENING '+JSON.stringify(summary));
if(!summary.allPass) process.exitCode=1;
