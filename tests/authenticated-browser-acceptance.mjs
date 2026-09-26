import { chromium } from 'playwright';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const width = Number(process.env.WIDTH || 1440);
const height = Number(process.env.HEIGHT || 900);
const device = process.env.DEVICE || 'desktop';
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173/';
const EVIDENCE_DIR = path.join(os.tmpdir(), 'mta-deteni-evidence');
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
const evidencePath = name => path.join(EVIDENCE_DIR, name);

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
  await page.route('https://esm.sh/@supabase/supabase-js@2.117.1', route =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: SUPABASE_STUB })
  );
  await page.route('https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js', route =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: QR_STUB })
  );

  stage = 'goto';
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
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
    typeof window.mtaUnifiedResolve === 'function' &&
    typeof window.mtaUnifiedAction === 'function' &&
    !!window.mtaQrCameraV2 &&
    !!window.mtaDailyGuardReport,
    null,
    { timeout: 60000 }
  );
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
    d.detainees = Array.isArray(d.detainees) ? d.detainees : [];
    if (!d.detainees.some(v => v && v.status === 'AKTIF')) d.detainees.push({ id: 'DET-BROWSER-001', code: 'DET-BROWSER-001', name: 'SYNTHETIC BROWSER', nationality: 'Contoh', status: 'AKTIF', placement: 'Blok A / Kamar 01' });
    d.placements = Array.isArray(d.placements) ? d.placements : [];
    d.movements = d.movements || [];
    d.leaves = d.leaves || [];
    d.documents = d.documents || [];
    d.audit = d.audit || [];
    d.rooms = Array.isArray(d.rooms) ? d.rooms : [];
    if (!d.rooms.some(r => r.id === 'ROOM-BROWSER-001')) d.rooms.push({ id: 'ROOM-BROWSER-001', block: 'Blok A', room: 'Kamar 01', capacity: 8, status: 'ACTIVE' });
    if (!d.rooms.some(r => r.id === 'ROOM-BROWSER-002')) d.rooms.push({ id: 'ROOM-B', block: 'Blok A', room: 'Kamar 02', capacity: 8, status: 'ACTIVE' });
    d.blocks = Array.isArray(d.blocks) ? d.blocks : [];
    if (!d.blocks.some(b => b.id === 'BLOCK-BROWSER-001')) d.blocks.push({ id: 'BLOCK-BROWSER-001', name: 'Blok A', status: 'ACTIVE' });
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

  // Real UI Detainee CRUD certification: add -> persist -> edit -> archive.
  stage = 'browser-detainee-crud';
  await page.evaluate(() => window.show('detainee'));
  await page.getByRole('button', { name: /Tambah Deteni/i }).click();
  await page.locator('#dForm').waitFor({ state: 'visible', timeout: 5000 });
  const crudCode = 'DET-BROWSER-' + Date.now();
  await page.locator('#dForm [name="code"]').fill(crudCode);
  await page.locator('#dForm [name="name"]').fill('SYNTHETIC CRUD TEST');
  await page.locator('#dForm [name="nationality"]').fill('Contoh');
  const placementSelect = page.locator('#dForm [name="placementId"]');
  if (await placementSelect.count()) {
    const options = await placementSelect.locator('option').evaluateAll(nodes => nodes.map(n => ({value:n.value,text:n.textContent||''})).filter(x=>x.value));
    if (!options.length) throw new Error('detainee create form has no active master room options');
    await placementSelect.selectOption(options[0].value);
  }
  await page.locator('#dForm').evaluate(form => form.requestSubmit());
  await page.waitForFunction(code => {
    const d = JSON.parse(localStorage.getItem('mta-deteni-demo-v2') || '{}');
    return (d.detainees || []).some(x => x.code === code);
  }, crudCode, { timeout: 5000 });
  let crudState = await page.evaluate(code => {
    const d = JSON.parse(localStorage.getItem('mta-deteni-demo-v2') || '{}');
    const x = (d.detainees || []).find(v => v.code === code);
    return { id:x?.id, name:x?.name, placement:x?.placement, audits:(d.audit||[]).filter(a=>a.resourceId===x?.id).map(a=>a.action) };
  }, crudCode);
  if (!crudState.id || crudState.name !== 'SYNTHETIC CRUD TEST' || !crudState.placement || !crudState.audits.includes('DETAINEE_CREATE')) {
    throw new Error('browser detainee create persistence/audit failed: '+JSON.stringify(crudState));
  }
  await page.evaluate(id => window.editDetainee(id), crudState.id);
  await page.locator('#dForm').waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('#dForm [name="name"]').fill('SYNTHETIC CRUD EDITED');
  await page.locator('#dForm').evaluate(form => form.requestSubmit());
  await page.waitForFunction(({id}) => {
    const d = JSON.parse(localStorage.getItem('mta-deteni-demo-v2') || '{}');
    return (d.detainees || []).some(x => x.id === id && x.name === 'SYNTHETIC CRUD EDITED');
  }, { id: crudState.id }, { timeout: 5000 });
  await page.evaluate(id => window.archiveDetainee(id), crudState.id);
  await page.waitForFunction(({id}) => {
    const d = JSON.parse(localStorage.getItem('mta-deteni-demo-v2') || '{}');
    return (d.detainees || []).some(x => x.id === id && x.status === 'NONAKTIF');
  }, { id: crudState.id }, { timeout: 5000 });
  crudState = await page.evaluate(id => {
    const d = JSON.parse(localStorage.getItem('mta-deteni-demo-v2') || '{}');
    return { status:d.detainees.find(x=>x.id===id)?.status, audits:(d.audit||[]).filter(a=>a.resourceId===id).map(a=>a.action) };
  }, crudState.id);
  if (crudState.status !== 'NONAKTIF' || !crudState.audits.includes('DETAINEE_UPDATE') || !crudState.audits.includes('DETAINEE_ARCHIVE')) {
    throw new Error('browser detainee edit/archive evidence failed: '+JSON.stringify(crudState));
  }
  console.log(`AUTH_DETAINEE_CRUD_PASS ${device} detainee=${crudState.status}`);

  // Browser Mutation Journey Certification:
  // UI mutation → shared synthetic state → audit → monitor → document evidence.
  stage = 'browser-mutation-journey';
  const mutationBaseline = await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('mta-deteni-demo-v2') || '{}');
    const active = (d.detainees || []).find(x => x.status === 'AKTIF');
    if (!active) throw new Error('active synthetic detainee missing');
    if (!Array.isArray(d.placements)) d.placements = [];
    if (!d.placements.some(p => p.detaineeId === active.id)) {
      d.placements.unshift({ id: 'PLC-BROWSER-001', detaineeId: active.id, roomId: 'ROOM-BROWSER-001', block: 'Blok A', room: 'Kamar 01', since: new Date().toISOString(), source: 'BROWSER_SEED' });
      active.placement = 'Blok A / Kamar 01';
    }
    localStorage.setItem('mta-deteni-demo-v2', JSON.stringify(d));
    return { detaineeId: active.id, beforeMovements: (d.movements || []).length, beforeLeaves: (d.leaves || []).length, beforeAudit: (d.audit || []).length };
  });

  await page.evaluate(() => { window.show('movement'); window.MTAMovementView?.render?.(); });
  await page.locator('#p9moveForm').waitFor({ state: 'visible', timeout: 5000 });
  const movementMutation = await page.evaluate(() => {
    const form = document.getElementById('p9moveForm');
    if (!form) throw new Error('movement form missing');
    const detainee = form.elements.detaineeId;
    const room = form.elements.roomId;
    if (!detainee?.options?.length || !room?.options?.length) throw new Error('movement selectors missing');
    detainee.value = detainee.options[1]?.value || '';
    detainee.dispatchEvent(new Event('change', { bubbles: true }));
    const target = [...room.options].find(o => o.value && !o.disabled);
    if (!target) throw new Error('no valid target room available');
    room.value = target.value;
    form.elements.type.value = 'TRANSFER_KAMAR';
    form.elements.occurredAt.value = new Date(Date.now() - 60000).toISOString().slice(0,16);
    form.elements.note.value = 'Synthetic browser mutation certification';
    form.requestSubmit();
    return { targetRoomId: target.value };
  });
  await page.waitForFunction(({id}) => {
    const d = JSON.parse(localStorage.getItem('mta-deteni-demo-v2') || '{}');
    return (d.movements || []).some(m => m.source === 'ROOM_TRANSFER' && m.detaineeId === id);
  }, { id: mutationBaseline.detaineeId }, { timeout: 5000 });
  const movementState = await page.evaluate(({id}) => {
    const d = JSON.parse(localStorage.getItem('mta-deteni-demo-v2') || '{}');
    const m = (d.movements || []).find(x => x.detaineeId === id && x.source === 'ROOM_TRANSFER');
    const p = (d.placements || []).find(x => x.movementId === m?.id);
    const audits = (d.audit || []).filter(x => x.resourceId === m?.id || x.resourceId === p?.id);
    return { movementId: m?.id, placementId: p?.id, movementCorrelationId: m?.correlationId, placementCorrelationId: p?.correlationId, auditCorrelations: [...new Set(audits.map(x => x.correlationId).filter(Boolean))], movementCount: d.movements.length, auditCount: d.audit.length, audits: audits.map(x => x.action), toRoomId: m?.toRoomId };
  }, { id: mutationBaseline.detaineeId });
  if (!movementState.movementId || !movementState.placementId || !movementState.movementCorrelationId || movementState.movementCorrelationId !== movementState.placementCorrelationId || movementState.auditCorrelations.length !== 1 || movementState.auditCorrelations[0] !== movementState.movementCorrelationId || movementState.auditCount < mutationBaseline.beforeAudit + 2 || movementState.audits.length < 2) {
    throw new Error(`browser movement mutation evidence failed: ${JSON.stringify(movementState)}`);
  }
  console.log(`AUTH_MOVEMENT_MUTATION_PASS ${device} movement=${movementState.movementId} placement=${movementState.placementId} audit=${movementState.auditCount}`);

  await page.evaluate(() => window.show('leave'));
  await page.waitForFunction(() => /Buat Izin/i.test(document.getElementById('appView')?.textContent || ''), null, { timeout: 5000 });
  await page.getByRole('button', { name: /Buat Izin/i }).click();
  await page.locator('#lForm').waitFor({ state: 'visible', timeout: 5000 });
  const leaveForm = page.locator('#lForm');
  await leaveForm.locator('[name="detaineeId"]').selectOption(mutationBaseline.detaineeId);
  await leaveForm.locator('[name="destination"]').fill('Synthetic Destination');
  await leaveForm.locator('[name="startAt"]').fill(new Date(Date.now() - 3600000).toISOString().slice(0,16));
  await leaveForm.locator('[name="purpose"]').fill('Synthetic browser mutation certification');
  await leaveForm.evaluate((form) => form.requestSubmit());
  await page.waitForFunction(({id}) => {
    const d = JSON.parse(localStorage.getItem('mta-deteni-demo-v2') || '{}');
    return (d.leaves || []).some(l => l.detaineeId === id);
  }, { id: mutationBaseline.detaineeId }, { timeout: 5000 });
  let leaveState = await page.evaluate(({id}) => {
    const d = JSON.parse(localStorage.getItem('mta-deteni-demo-v2') || '{}');
    const l = (d.leaves || []).find(x => x.detaineeId === id && x.destination === 'Synthetic Destination');
    return { id: l?.id, status: l?.status, auditCount: d.audit.length };
  }, { id: mutationBaseline.detaineeId });
  if (!leaveState.id || leaveState.status !== 'DRAFT') throw new Error(`leave create mutation failed: ${JSON.stringify(leaveState)}`);
  for (const expected of ['SUBMITTED', 'APPROVED', 'DEPARTED', 'RETURNED', 'COMPLETED']) {
    const actionLabel = expected === 'SUBMITTED' ? 'SUBMIT' : expected === 'APPROVED' ? 'APPROVE' : expected === 'DEPARTED' ? 'DEPART' : expected === 'RETURNED' ? 'RETURN' : 'COMPLETE';
    const actionButton = page.locator('#appView button').filter({ hasText: actionLabel }).first();
    await actionButton.waitFor({ state: 'attached', timeout: 5000 });
    await actionButton.evaluate((button) => button.click());
    await page.waitForFunction(({id,expected}) => {
      const d = JSON.parse(localStorage.getItem('mta-deteni-demo-v2') || '{}');
      return (d.leaves || []).some(l => l.id === id && l.status === expected);
    }, { id: leaveState.id, expected }, { timeout: 5000 });
  }
  leaveState = await page.evaluate(({id}) => {
    const d = JSON.parse(localStorage.getItem('mta-deteni-demo-v2') || '{}');
    const l = (d.leaves || []).find(x => x.id === id);
    const audits = (d.audit || []).filter(x => x.resourceId === id);
    return { id: l?.id, status: l?.status, correlationId: l?.correlationId, auditCorrelations: [...new Set(audits.map(x => x.correlationId).filter(Boolean))], auditCount: d.audit.length, leaveAuditActions: audits.map(x => x.action), lastMutation: d.lastMutation };
  }, { id: leaveState.id });
  if (leaveState.status !== 'COMPLETED' || !leaveState.correlationId || leaveState.auditCorrelations.length !== 1 || leaveState.auditCorrelations[0] !== leaveState.correlationId || leaveState.auditCount < mutationBaseline.beforeAudit + 8 || leaveState.leaveAuditActions.length < 6) {
    throw new Error(`leave workflow evidence failed: ${JSON.stringify(leaveState)}`);
  }
  console.log(`AUTH_LEAVE_MUTATION_PASS ${device} leave=${leaveState.status} audit=${leaveState.leaveAuditActions.length}`);

  await page.evaluate(() => window.show('monitor'));
  await page.waitForFunction(() => /Operational Monitor/i.test(document.getElementById('appView')?.textContent || ''), null, { timeout: 5000 });
  const monitorAfterMutation = await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('mta-deteni-demo-v2') || '{}');
    return {
      movements: d.movements.length,
      leaves: d.leaves.length,
      audits: d.audit.length,
      monitorText: document.getElementById('appView')?.textContent || ''
    };
  });
  if (monitorAfterMutation.movements <= mutationBaseline.beforeMovements || monitorAfterMutation.leaves <= mutationBaseline.beforeLeaves || monitorAfterMutation.audits <= mutationBaseline.beforeAudit) {
    throw new Error(`monitor did not reflect browser mutations: ${JSON.stringify(monitorAfterMutation)}`);
  }

  await page.evaluate(() => window.show('documents'));
  await page.waitForFunction(() => /Dokumen|Draft Laporan Harian/i.test(document.getElementById('appView')?.textContent || ''), null, { timeout: 5000 });
  const reportButton = page.getByRole('button', { name: /Buat Draft|Draft Laporan Harian/i }).first();
  await reportButton.waitFor({ state: 'visible', timeout: 5000 });
  await reportButton.click();
  await page.locator('#rForm').waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('#rForm input[name="time"]').fill('07.00–14.00 WIB');
  await page.locator('#rForm textarea[name="note"]').fill('Synthetic browser mutation evidence');
  await page.locator('#rForm').getByRole('button', { name: 'Buat Draft' }).click();
  await page.waitForFunction(() => /Draft dibuat|VALIDATED|Dokumen/i.test(document.getElementById('appView')?.textContent || ''), null, { timeout: 5000 });
  const reportEvidence = await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('mta-deteni-demo-v2') || '{}');
    const r = (d.documents || [])[0];
    return { id: r?.documentId || r?.id, status: r?.status, reportCorrelationId: r?.correlationId, sourceCorrelationIds: r?.evidence?.sourceCorrelationIds || [], sourceCount: r?.evidence?.sourceRecordCount, auditEventCount: r?.evidence?.auditEventCount, hasMovement: (r?.sourceRecordIds || []).some(id => id && (d.movements || []).some(m => m.id === id)), hasLeave: (r?.sourceRecordIds || []).some(id => id && (d.leaves || []).some(l => l.id === id)) };
  });
  if (!reportEvidence.id || !reportEvidence.reportCorrelationId || !reportEvidence.sourceCount || !reportEvidence.auditEventCount || !reportEvidence.hasMovement || !reportEvidence.hasLeave || !reportEvidence.sourceCorrelationIds.includes(movementState.movementCorrelationId) || !reportEvidence.sourceCorrelationIds.includes(leaveState.correlationId)) {
    throw new Error(`report evidence does not reflect browser mutations: ${JSON.stringify(reportEvidence)}`);
  }
  console.log(`AUTH_REPORT_EVIDENCE_PASS ${device} document=${reportEvidence.id} sources=${reportEvidence.sourceCount} audits=${reportEvidence.auditEventCount}`);

  // Core operational surfaces must expose an actionable control, not just a non-empty shell.
  const surfaceContracts = {
    dashboard: /Dashboard/i,
    detainee: /Data Deteni|Tambah Deteni/i,
    placement: /Penempatan/i,
    movement: /Pergerakan|Simpan Perpindahan/i,
    leave: /Izin|Buat Izin/i,
    documents: /Dokumen|Draft Laporan Harian/i,
    audit: /Audit Trail|Verifikasi Chain/i,
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

  fs.writeFileSync(evidencePath(`mta-auth-journey-${device}.json`), JSON.stringify({
    certification: 'E2E-BROWSER-JOURNEY-v1',
    journeyId: `E2E-BROWSER-${device.toUpperCase()}`,
    correlationIds: { movement: movementState.movementCorrelationId, leave: leaveState.correlationId, report: reportEvidence.reportCorrelationId },
    stages: { authentication:'PASS', qr:'PASS', detainee:'PASS', movement:'PASS', leave:'PASS', monitor:'PASS', report:'PASS', evidence:'PASS', surfaces:'PASS' },
    evidence: { movementId:movementState.movementId, placementId:movementState.placementId, leaveId:leaveState.id, reportId:reportEvidence.id, sourceCorrelationIds:reportEvidence.sourceCorrelationIds, auditCount:reportEvidence.auditEventCount },
    syntheticOnly:true, productionAccessAuthorized:false, migrationExecuted:false, aiEnabled:false, device, width, height, views
  }, null, 2));

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
  let snapshot = { contextAvailable: false };
  try {
    snapshot = await page.evaluate(() => ({
      contextAvailable: true,
      bodyClass: document.body.className,
      authMessage: document.getElementById('mtaAuthMessage')?.textContent || '',
      navViews: [...document.querySelectorAll('#nav button[data-view], #mtaMobileBottomNav button[data-view]')].map(b => b.dataset.view).filter(Boolean),
      appText: document.getElementById('appView')?.textContent?.trim().slice(0, 1200) || '',
      runtimeLoaded: !!window.__mtaAppRuntimeLoaded,
      fullRuntimeBooted: !!window.__mtaAppBooted,
      fullRuntimeLoading: !!window.__mtaRuntimeLoading
    }));
  } catch (snapshotError) {
    snapshot = { contextAvailable: false, snapshotError: String(snapshotError?.message || snapshotError) };
  }
  fs.writeFileSync(evidencePath(`mta-auth-acceptance-${device}.json`), JSON.stringify({device,width,height,stage,error:String(error?.stack||error),errors,snapshot},null,2));
  throw error;
} finally {
  const successEvidence = evidencePath(`mta-auth-journey-${device}.json`);
  const failureEvidence = evidencePath(`mta-auth-acceptance-${device}.json`);
  if (!fs.existsSync(successEvidence) && !fs.existsSync(failureEvidence)) {
    let snapshot = { contextAvailable: false };
    try {
      snapshot = await page.evaluate(() => ({contextAvailable:true,bodyClass:document.body.className,navViews:[...document.querySelectorAll('#nav button[data-view], #mtaMobileBottomNav button[data-view]')].map(b => b.dataset.view).filter(Boolean),runtimeLoaded:!!window.__mtaAppRuntimeLoaded,fullRuntimeBooted:!!window.__mtaAppBooted}));
    } catch (snapshotError) {
      snapshot = { contextAvailable:false, snapshotError:String(snapshotError?.message || snapshotError) };
    }
    fs.writeFileSync(failureEvidence, JSON.stringify({device,width,height,stage,errors,snapshot},null,2));
  }
  await browser.close();
}
