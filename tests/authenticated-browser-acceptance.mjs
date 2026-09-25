import { chromium } from 'playwright';
import fs from 'node:fs';

const width = Number(process.env.WIDTH || 1440);
const height = Number(process.env.HEIGHT || 900);
const device = process.env.DEVICE || 'desktop';

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
        session = {
          access_token: 'synthetic-browser-token',
          user: { id: 'synthetic-browser-user', email }
        };
        authListener?.('SIGNED_IN', session);
        return { data: { session, user: session.user }, error: null };
      },
      async signOut(){
        session = null;
        authListener?.('SIGNED_OUT', null);
        return { error: null };
      },
      async getUser(){
        return { data: { user: session?.user || null }, error: null };
      }
    }
  };
}
`;

const QR_STUB = `
window.qrcode = window.qrcode || function(){
  return {
    addData(){},
    make(){},
    createDataURL(){ return ''; },
    createSvgTag(){ return '<svg xmlns="http://www.w3.org/2000/svg"></svg>'; }
  };
};
`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width, height } });
const errors = [];
let stage = 'init';
page.on('pageerror', error => errors.push(error.message));

try {
  await page.route('https://esm.sh/@supabase/supabase-js@2', route =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: SUPABASE_STUB })
  );
  await page.route('https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js', route =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: QR_STUB })
  );

  stage = 'goto';
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  stage = 'login-gate';
  await page.locator('#mtaAuthGate.open').waitFor({ state: 'visible', timeout: 10000 });

  const locked = await page.evaluate(() => ({
    bodyLocked: document.body.classList.contains('mta-auth-locked'),
    appHidden: getComputedStyle(document.querySelector('.app')).display === 'none',
    form: !!document.querySelector('#mtaAuthForm')
  }));
  if (!locked.bodyLocked || !locked.appHidden || !locked.form) {
    throw new Error(`unauthenticated boundary contract failed: ${JSON.stringify(locked)}`);
  }

  stage = 'login-submit';
  await page.locator('#mtaAuthEmail').fill('synthetic@example.test');
  await page.locator('#mtaAuthPassword').fill('synthetic-password');
  await page.locator('#mtaAuthSubmit').click();

  stage = 'core-dashboard';
  await page.locator('body.mta-auth-ready').waitFor({ state: 'attached', timeout: 10000 });
  await page.locator('.app').waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('heading', { name: 'Dashboard' }).first().waitFor({ state: 'visible', timeout: 10000 });

  stage = 'operational-nav';
  await page.waitForFunction(() =>
    document.querySelectorAll('#nav button[data-view="monitor"], #mtaMobileBottomNav button[data-view="monitor"]').length > 0,
    null,
    { timeout: 60000 }
  );

  const views = await page.locator('#nav button[data-view], #mtaMobileBottomNav button[data-view]').evaluateAll(buttons =>
    [...new Set(buttons.map(button => button.dataset.view).filter(Boolean))]
  );
  if (!views.includes('monitor')) throw new Error(`monitor menu missing after authenticated runtime boot: ${views.join(',')}`);

  stage = 'menu-journey';
  for (const view of views) {
    const clicked = await page.evaluate((targetView) => {
      const buttons = [...document.querySelectorAll('#nav button[data-view], #mtaMobileBottomNav button[data-view]')];
      const button = buttons.find(node => node.dataset.view === targetView);
      if (!button) return false;
      button.click();
      return true;
    }, view);
    if (!clicked) throw new Error(`menu click target missing: ${view}`);

    await page.waitForTimeout(100);
    await page.waitForFunction(() => {
      const host = document.getElementById('appView');
      return !!host && host.textContent.trim().length > 0;
    }, null, { timeout: 5000 });

    const state = await page.evaluate(() => ({
      text: document.getElementById('appView')?.textContent?.trim().slice(0, 240) || '',
      view: document.getElementById('appView')?.dataset?.view || null
    }));
    if (!state.text) throw new Error(`empty app view after menu ${view}`);
    console.log(`AUTH_MENU_PASS ${device} ${view} ${JSON.stringify(state)}`);
  }

  stage = 'monitor';
  await page.evaluate(() => {
    const monitor = [...document.querySelectorAll('#nav button[data-view="monitor"], #mtaMobileBottomNav button[data-view="monitor"]')][0];
    monitor?.click();
  });
  await page.waitForFunction(() => /Monitor|Operational/i.test(document.getElementById('appView')?.textContent || ''), null, { timeout: 5000 });
  await page.evaluate(() => document.body.getBoundingClientRect().width);
  console.log(`AUTH_MONITOR_PASS ${device}`);
  // Functional journey: QR Scan → Resolve → Data/Action → Audit.
  stage = 'qr-functional-journey';
  await page.evaluate(() => window.show('camera-scan'));
  await page.waitForFunction(() => /Scanner Kamera/i.test(document.getElementById('appView')?.textContent || ''), null, { timeout: 5000 });
  const qrSeed = await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('mta-deteni-demo-v2') || '{}');
    d.detainees = d.detainees || [{ id: 'DET-BROWSER-001', code: 'DET-BROWSER-001', name: 'SYNTHETIC BROWSER', nationality: 'Contoh', status: 'AKTIF', placement: 'Blok A / Kamar 01' }];
    const x = d.detainees.find(v => v.status === 'AKTIF');
    d.qr = d.qr || { detainee: {}, room: {}, leave: {} };
    d.qr.detainee = d.qr.detainee || {};
    const q = d.qr.detainee[x.id] || {
      token: 'SYNTH-BROWSER-QR-' + x.id,
      status: 'ACTIVE',
      issuedAt: x.createdAt || new Date().toISOString(),
      expiresAt: null
    };
    d.qr.detainee[x.id] = q;
    localStorage.setItem('mta-deteni-demo-v2', JSON.stringify(d));
    return { id: x.id, payload: 'mta://detainee/' + x.id + '/' + q.token };
  });
  if (!qrSeed) throw new Error('synthetic QR seed unavailable');
  await page.locator('#mtaUnifiedQrInput').fill(qrSeed.payload);
  await page.getByRole('button', { name: 'Resolve' }).click();
  await page.waitForFunction(() => /ACCEPTED/i.test(document.getElementById('mtaUnifiedScanResult')?.textContent || ''), null, { timeout: 5000 });
  const qrResult = await page.locator('#mtaUnifiedScanResult').innerText();
  if (!/Lanjutkan Action/i.test(qrResult)) throw new Error('QR accepted result missing operational action');
  await page.getByRole('button', { name: /Lanjutkan Action/i }).click();
  await page.waitForFunction(() => /Operational Action/i.test(document.getElementById('mtaUnifiedScanResult')?.textContent || ''), null, { timeout: 5000 });
  const auditCount = await page.evaluate(() => (JSON.parse(localStorage.getItem('mta-deteni-demo-v2') || '{}').audit || []).filter(x => /QR_(RESOLVE|ACTION)/.test(x.action)).length);
  if (auditCount < 2) throw new Error('QR resolve/action audit evidence missing');
  console.log(`AUTH_QR_JOURNEY_PASS ${device} ${qrSeed.id} audit=${auditCount}`);

  // Core operational surfaces must expose an actionable control, not just a non-empty shell.
  const surfaceContracts = {
    dashboard: /Dashboard/i,
    detainee: /Tambah Deteni/i,
    placement: /Penempatan/i,
    movement: /Catat Pergerakan/i,
    leave: /Buat Izin/i,
    documents: /Draft Laporan Harian/i,
    audit: /Verifikasi Chain/i,
    monitor: /Operational Monitor/i,
    'ops-queue': /Operational Queue/i,
    'qr-center': /QR Center/i,
    'camera-scan': /Scanner Kamera/i,
    reports: /Laporan/i
  };
  for (const [surface, pattern] of Object.entries(surfaceContracts)) {
    await page.evaluate(view => window.show(view), surface);
    await page.waitForFunction(([p]) => new RegExp(p, 'i').test(document.getElementById('appView')?.textContent || ''), [pattern.source], { timeout: 5000 });
  }
  console.log(`AUTH_FUNCTIONAL_SURFACES_PASS ${device}`);

  stage = 'logout';
  await page.locator('#mtaAuthUi button').getByText('Logout').evaluate(button => button.click());
  await page.locator('body.mta-auth-locked').waitFor({ state: 'attached', timeout: 5000 });
  await page.locator('#mtaAuthGate.open').waitFor({ state: 'attached', timeout: 5000 });

  const logoutState = await page.evaluate(() => ({
    locked: document.body.classList.contains('mta-auth-locked'),
    appDisplay: getComputedStyle(document.querySelector('.app')).display,
    gateOpen: document.getElementById('mtaAuthGate')?.classList.contains('open')
  }));
  if (!logoutState.locked || logoutState.appDisplay !== 'none' || !logoutState.gateOpen) {
    throw new Error(`logout boundary contract failed: ${JSON.stringify(logoutState)}`);
  }

  if (errors.length) throw new Error(`page errors: ${errors.join('; ')}`);
  console.log(`AUTH_BROWSER_ACCEPTANCE_PASS ${JSON.stringify({device,width,height,views})}`);
} catch (error) {
  const snapshot = await page.evaluate(() => ({
    bodyClass: document.body.className,
    authMessage: document.getElementById('mtaAuthMessage')?.textContent || '',
    navViews: [...document.querySelectorAll('#nav button[data-view], #mtaMobileBottomNav button[data-view]')].map(b => b.dataset.view).filter(Boolean),
    appText: document.getElementById('appView')?.textContent?.trim().slice(0, 1200) || '',
    runtimeLoaded: !!window.__mtaAppRuntimeLoaded,
    fullRuntimeBooted: !!window.__mtaAppBooted,
    fullRuntimeLoading: !!window.__mtaRuntimeLoading
  }));
  fs.writeFileSync(`/tmp/mta-auth-acceptance-${device}.json`, JSON.stringify({device,width,height,stage,error:String(error?.stack||error),errors,snapshot},null,2));
  throw error;
} finally {
  if (!fs.existsSync(`/tmp/mta-auth-acceptance-${device}.json`)) {
    const snapshot = await page.evaluate(() => ({bodyClass:document.body.className,navViews:[...document.querySelectorAll('#nav button[data-view], #mtaMobileBottomNav button[data-view]')].map(b=>b.dataset.view).filter(Boolean),runtimeLoaded:!!window.__mtaAppRuntimeLoaded,fullRuntimeBooted:!!window.__mtaAppBooted}));
    fs.writeFileSync(`/tmp/mta-auth-acceptance-${device}.json`, JSON.stringify({device,width,height,stage,errors,snapshot},null,2));
  }
  await browser.close();
}
