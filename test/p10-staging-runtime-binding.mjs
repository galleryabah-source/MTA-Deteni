import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE_URL = process.env.BASE_URL || 'https://mta-deteni-staging.galleryabah.workers.dev';
const EXPECTED_COMMIT = process.env.EXPECTED_COMMIT || process.env.GITHUB_SHA || 'unknown';
const evidencePath = process.env.EVIDENCE_PATH || 'p10-staging-runtime-binding-evidence.json';

const SUPABASE_STUB = `
let session = null;
let authListener = null;
export function createClient(){
  return {
    auth: {
      async getSession(){ return { data: { session }, error: null }; },
      onAuthStateChange(cb){
        authListener = cb;
        return { data: { subscription: { unsubscribe(){ if(authListener===cb) authListener=null; } } } };
      },
      async signInWithPassword({email,password}){
        if(email !== 'synthetic@example.test' || password !== 'synthetic-password'){
          return { data: { session: null, user: null }, error: { message: 'INVALID_SYNTHETIC_CREDENTIALS' } };
        }
        session = { access_token: 'synthetic-browser-token', user: { id: 'synthetic-browser-user', email } };
        authListener?.('SIGNED_IN', session);
        return { data: { session, user: session.user }, error: null };
      },
      async signOut(){ session=null; authListener?.('SIGNED_OUT',null); return {error:null}; },
      async getUser(){ return { data: { user: session?.user || null }, error: null }; }
    }
  };
}
`;

const QR_STUB = `
window.qrcode = window.qrcode || function(){
  return { addData(){}, make(){}, createDataURL(){return '';}, createSvgTag(){return '<svg xmlns="http://www.w3.org/2000/svg"></svg>';} };
};
`;

const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});
const page = await context.newPage();
const errors = [];
const mtaApiRequests = [];
page.on('pageerror', e => errors.push('pageerror:'+e.message));
page.on('console', m => { if(m.type()==='error') errors.push('console:'+m.text()); });
page.on('request', req => {
  if(req.url().includes('/api/mta/')) mtaApiRequests.push({method:req.method(),url:req.url()});
});

try {
  await page.route('https://esm.sh/@supabase/supabase-js@2.117.1', route =>
    route.fulfill({status:200,contentType:'application/javascript',body:SUPABASE_STUB}));
  await page.route('https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js', route =>
    route.fulfill({status:200,contentType:'application/javascript',body:QR_STUB}));

  const healthResponse = await page.request.get(BASE_URL + '/api/health');
  if(!healthResponse.ok()) throw new Error('STAGING_HEALTH_HTTP_'+healthResponse.status());
  const health = await healthResponse.json();
  const healthExpected = {
    ok:true, app:'MTA DETENI', dataMode:'SYNTHETIC_ONLY',
    productionAccessAuthorized:false, livePostgresqlExecution:false,
    realDetaineeDataAllowed:false, externalTransportAllowed:false,
    durablePublicationAllowed:false, migrationFreeze:true, ai:'OFF'
  };
  for(const [k,v] of Object.entries(healthExpected)){
    if(health[k] !== v) throw new Error(`HEALTH_INVARIANT_${k}=${JSON.stringify(health[k])}`);
  }

  await page.goto(BASE_URL,{waitUntil:'domcontentloaded',timeout:30000});
  await page.locator('#mtaAuthGate.open').waitFor({state:'visible',timeout:10000});
  await page.locator('#mtaAuthEmail').fill('synthetic@example.test');
  await page.locator('#mtaAuthPassword').fill('synthetic-password');
  await page.locator('#mtaAuthSubmit').click();
  await page.locator('body.mta-auth-ready').waitFor({state:'attached',timeout:10000});
  await page.locator('.app').waitFor({state:'visible',timeout:10000});
  await page.getByRole('heading',{name:'Dashboard'}).first().waitFor({state:'visible',timeout:10000});

  const runtime = await page.evaluate(() => ({
    kernelVersion: window.MTADeteniStateKernel?.version || null,
    apiAdapterPresent: !!window.mtaProductionApi,
    contract: window.MTADeteniStateKernel?.contractTest?.() || null,
    runtimeContract: window.MTADeteniStateKernel?.getRuntimeContract?.() || null,
    sync: window.MTADeteniStateKernel?.getSyncState?.() || null,
    authReady: document.body.classList.contains('mta-auth-ready'),
    appVisible: getComputedStyle(document.querySelector('.app')).display !== 'none'
  }));

  if(runtime.kernelVersion !== '2.0.0') throw new Error('P10_KERNEL_VERSION_NOT_DEPLOYED');
  if(!runtime.apiAdapterPresent) throw new Error('P10_API_ADAPTER_MISSING');
  if(runtime.contract?.mode !== 'SYNTHETIC') throw new Error('P10_GOVERNED_MODE_NOT_SYNTHETIC');
  if(runtime.runtimeContract?.productionAccessAuthorized !== false || runtime.runtimeContract?.livePostgresqlExecution !== false){
    throw new Error('P10_GOVERNANCE_NOT_LOCKED');
  }
  if(runtime.contract?.checks?.find(x=>x.name==='REMOTE_API_ADAPTER')?.ok !== true) throw new Error('P10_ADAPTER_CONTRACT_FAILED');
  if(runtime.contract?.checks?.find(x=>x.name==='RUNTIME_GOVERNANCE')?.ok !== true) throw new Error('P10_RUNTIME_GOVERNANCE_CONTRACT_FAILED');
  if(!runtime.authReady || !runtime.appVisible) throw new Error('AUTHENTICATED_RUNTIME_NOT_READY');

  if(mtaApiRequests.length !== 0) throw new Error('GOVERNED_SYNTHETIC_RUNTIME_CALLED_OPERATIONAL_API: '+JSON.stringify(mtaApiRequests));

  const order = await page.evaluate(() => {
    const scripts=[...document.scripts].map(s=>s.getAttribute('src')||'');
    const idx = needle => scripts.findIndex(x=>x.includes(needle));
    return {
      productionApi:idx('mta-production-api.js'),
      stateKernel:idx('mta-state-kernel-v1.js'),
      authUi:idx('mta-auth-ui.js')
    };
  });
  if(!(order.productionApi >= 0 && order.stateKernel > order.productionApi && order.authUi > order.stateKernel)){
    throw new Error('P10_BOOTSTRAP_ORDER_FAILED: '+JSON.stringify(order));
  }

  const evidence = {
    certificationId:'MTA-P10-STAGING-RUNTIME-BINDING-2026-09-27-01',
    status:'PASS',
    expectedCommit:EXPECTED_COMMIT,
    baseUrl:BASE_URL,
    deploymentTarget:'mta-deteni-staging',
    health,
    runtime,
    operationalApiRequests:mtaApiRequests,
    bootstrapOrder:order,
    governance:{
      syntheticOnly:true,
      productionAccessAuthorized:false,
      livePostgresqlExecution:false,
      realDetaineeDataAllowed:false,
      migrationExecuted:false,
      aiEnabled:false,
      migrationFreeze:true
    },
    errors,
    timestamp:new Date().toISOString()
  };
  fs.writeFileSync(evidencePath,JSON.stringify(evidence,null,2));
  console.log(JSON.stringify(evidence,null,2));
} finally {
  await browser.close();
}
