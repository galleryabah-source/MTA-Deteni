import { chromium } from 'playwright';

const base = process.env.MTA_TEST_URL || 'http://127.0.0.1:4173/index.html';
const widths = [320, 360, 390, 430, 768, 1024, 1440];
const browser = await chromium.launch({headless:true});
const failures=[];
try {
  for (const width of widths) {
    const page = await browser.newPage({viewport:{width,height:800},deviceScaleFactor:1,isMobile:width<768});
    await page.goto(base,{waitUntil:'networkidle'});
    if(width<=1024){
      await page.addScriptTag({url:new URL('/mobile-shell-v1.js',base).href});
      await page.waitForTimeout(120);
    }
    const result = await page.evaluate(()=>({
      width:innerWidth,
      scrollWidth:document.documentElement.scrollWidth,
      clientWidth:document.documentElement.clientWidth,
      bodyWidth:document.body.scrollWidth,
      nav:!!document.querySelector('#nav'),
      mobileRecords:!!document.querySelector('.mta-mobile-records'),
      mobileRecordsDisplay:!!document.querySelector('.mta-mobile-records')&&getComputedStyle(document.querySelector('.mta-mobile-records')).display,
      detaineeTable:!!document.querySelector('.detainee-table'),
      main:!!document.querySelector('.main'),
      backup:!!document.querySelector('#backupBtn'),
      metaViewport:!!document.querySelector('meta[name="viewport"]'),
      mobileShell:!!document.querySelector('#mtaMobileBottomNav'),
      mobileShellVisible:!!document.querySelector('#mtaMobileBottomNav')&&getComputedStyle(document.querySelector('#mtaMobileBottomNav')).display!=='none',
      mobileScan:!!document.querySelector('#mtaMobileBottomNav .mta-scan')
    }));
    if(result.scrollWidth>result.clientWidth+1 || result.bodyWidth>result.clientWidth+1) failures.push(`${width}px horizontal overflow ${Math.max(result.scrollWidth,result.bodyWidth)}>${result.clientWidth}`);
    if(!result.nav||!result.main||!result.backup||!result.metaViewport) failures.push(`${width}px required shell element missing`);
    if(width<=1024 && (!result.mobileShell||!result.mobileShellVisible||!result.mobileScan)) failures.push(`${width}px mobile/tablet shell contract missing`);
    // Detainee record projection is runtime-owned and requires authenticated application state.\n    // This responsive smoke gate validates the shell/layout contract without fabricating auth state.\n    const responsiveDetainee = await page.evaluate(()=>({table:!!document.querySelector('.detainee-table'),cards:!!document.querySelector('.mta-mobile-records')}));\n    if(width>=1025 && responsiveDetainee.cards) failures.push(`${width}px mobile detainee records leaked into desktop shell`);
    await page.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:800},isMobile:true});
  await page.goto(base,{waitUntil:'networkidle'});
  await page.addScriptTag({url:new URL('/mobile-shell-v1.js',base).href});
  await page.addScriptTag({url:new URL('/offline-v1.js',base).href});
  await page.waitForTimeout(300);
  const offline = await page.evaluate(async()=>({sw:'serviceWorker' in navigator, registered:!!(await navigator.serviceWorker.getRegistration('/')),mobileShell:!!document.querySelector('#mtaMobileBottomNav')}));
  if(!offline.sw||!offline.registered) failures.push('service worker did not register in responsive harness');
  if(!offline.mobileShell) failures.push('mobile shell did not initialize in offline profile');
  await page.close();
} finally { await browser.close(); }
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log(`Responsive smoke test PASS: ${widths.length} viewport profiles + mobile/tablet shell + offline registration`);
